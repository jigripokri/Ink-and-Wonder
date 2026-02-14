import { useState, useRef, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLocation, useSearch } from "wouter";
import { useMutation, useQuery } from "@tanstack/react-query";
import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";
import { useAuth } from "@/lib/auth";
import { Check, Sparkles, Lock, ClipboardPaste, CalendarDays } from "lucide-react";
import type { InsertBlogPost, BlogPost } from "@shared/schema";

export default function Create() {
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const { isAuthenticated, isLoading: isAuthLoading, login, loginError, isLoggingIn } = useAuth();
  const [password, setPassword] = useState("");
  const searchString = useSearch();
  const editId = new URLSearchParams(searchString).get("edit");
  const isEditMode = !!editId;
  
  const { data: editPost, isLoading: isLoadingPost, isError: isEditError } = useQuery<BlogPost>({
    queryKey: ['/api/posts', editId],
    queryFn: async () => {
      const res = await fetch(`/api/posts/${editId}`);
      if (!res.ok) throw new Error('Failed to fetch post');
      return res.json();
    },
    enabled: isEditMode,
  });

  // Core state (preserve title for backward compat but don't show in UI)
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [postDate, setPostDate] = useState(() => {
    const now = new Date();
    return now.toISOString().split('T')[0];
  });
  const [showDatePicker, setShowDatePicker] = useState(false);
  
  // Auto-save state
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  
  // Undo state
  const [previousContent, setPreviousContent] = useState<string | null>(null);
  
  // Track whether user has already used AI enhancement
  const [hasEnhanced, setHasEnhanced] = useState(false);
  const [isAutoWeaving, setIsAutoWeaving] = useState(false);
  
  // Refs
  const contentRef = useRef<HTMLTextAreaElement>(null);

  // Load edit post data when available
  useEffect(() => {
    if (editPost) {
      setContent(editPost.content);
      setTitle(editPost.title);
      if (editPost.date) {
        try {
          const parsed = new Date(editPost.date);
          if (!isNaN(parsed.getTime())) {
            setPostDate(parsed.toISOString().split('T')[0]);
          }
        } catch {}
      }
    }
  }, [editPost]);

  const [draftRestored, setDraftRestored] = useState(false);

  // Load draft from localStorage on mount (skip in edit mode)
  useEffect(() => {
    if (isEditMode) return;
    const saved = localStorage.getItem('draft');
    if (saved) {
      try {
        const draft = JSON.parse(saved);
        if (draft.content && draft.content.trim()) {
          setTitle(draft.title || "");
          setContent(draft.content || "");
          setDraftRestored(true);
          setLastSaved(draft.savedAt ? new Date(draft.savedAt) : new Date());
        }
      } catch (e) {
        console.error("Failed to load draft:", e);
      }
    }
  }, [isEditMode]);

  // Auto-save to localStorage (2 seconds after typing stops, skip in edit mode)
  useEffect(() => {
    if (!content || isEditMode) return;
    
    const timer = setTimeout(() => {
      const now = new Date();
      setLastSaved(now);
      setDraftRestored(false);
      localStorage.setItem('draft', JSON.stringify({ content, savedAt: now.toISOString() }));
    }, 2000);

    return () => clearTimeout(timer);
  }, [content, isEditMode]);

  // Auto-focus content after 500ms
  useEffect(() => {
    const timer = setTimeout(() => {
      if (contentRef.current && !content) {
        contentRef.current.focus();
      }
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  // Keyboard shortcuts (simplified - removed focus mode)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Cmd/Ctrl + S: Manual save
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 's') {
        e.preventDefault();
        if (content) {
          const now = new Date();
          setLastSaved(now);
          setDraftRestored(false);
          localStorage.setItem('draft', JSON.stringify({ content, savedAt: now.toISOString() }));
          toast({
            title: "Saved",
            description: "Your draft has been saved.",
          });
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [content, toast]);

  // Calculate writing statistics
  const stats = useMemo(() => {
    const text = content || "";
    const words = text.trim().split(/\s+/).filter(w => w.length > 0).length;
    const characters = text.length;
    const readTime = Math.max(1, Math.ceil(words / 200));
    
    return { words, characters, readTime };
  }, [content]);

  // Real-time update of auto-save indicator
  const [tick, setTick] = useState(0);
  
  useEffect(() => {
    const interval = setInterval(() => {
      setTick(prev => prev + 1);
    }, 10000);
    
    return () => clearInterval(interval);
  }, []);

  // Format last saved time
  const formattedSaveTime = useMemo(() => {
    if (!lastSaved) return "";
    
    const now = new Date();
    const diffMs = now.getTime() - lastSaved.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return 'just now';
    if (diffMins === 1) return '1 min ago';
    if (diffMins < 60) return `${diffMins} mins ago`;
    
    return lastSaved.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    });
  }, [lastSaved, tick]);

  // Create Post Mutation
  const createMutation = useMutation({
    mutationFn: async (data: InsertBlogPost) => {
      console.log('[PUBLISH] Starting POST /api/posts', { contentLength: data.content.length });
      const response = await fetch('/api/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(data),
      });
      
      console.log('[PUBLISH] Response status:', response.status, response.statusText);
      if (!response.ok) {
        const errText = await response.text().catch(() => '');
        console.error('[PUBLISH] Error response body:', errText);
        let errMsg = 'Failed to create post';
        try { errMsg = JSON.parse(errText).error || errMsg; } catch {}
        throw new Error(errMsg);
      }
      const result = await response.json();
      console.log('[PUBLISH] Success, post id:', result.id);
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/posts'] });
      setTitle("");
      setContent("");
      setLastSaved(null);
      localStorage.removeItem('draft');
      toast({
        title: "Published!",
        description: "Your story has been shared.",
      });
      setLocation('/');
    },
    onError: (error: Error) => {
      console.error('[PUBLISH] Mutation error:', error.message);
      toast({
        title: "Publishing Failed",
        description: error.message || "Please try again.",
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (data: InsertBlogPost) => {
      console.log('[UPDATE] Starting PUT /api/posts/' + editId, { contentLength: data.content.length });
      const response = await fetch(`/api/posts/${editId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(data),
      });
      
      console.log('[UPDATE] Response status:', response.status, response.statusText);
      if (!response.ok) {
        const errText = await response.text().catch(() => '');
        console.error('[UPDATE] Error response body:', errText);
        let errMsg = 'Failed to update post';
        try { errMsg = JSON.parse(errText).error || errMsg; } catch {}
        throw new Error(errMsg);
      }
      const result = await response.json();
      console.log('[UPDATE] Success, post id:', result.id);
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/posts'] });
      queryClient.invalidateQueries({ queryKey: ['/api/posts', editId] });
      setTitle("");
      setContent("");
      setLastSaved(null);
      localStorage.removeItem('draft');
      toast({
        title: "Updated!",
        description: "Your story has been updated.",
      });
      setLocation('/');
    },
    onError: (error: Error) => {
      console.error('[UPDATE] Mutation error:', error.message);
      toast({
        title: "Update Failed",
        description: error.message || "Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleUndo = () => {
    if (previousContent !== null) {
      setContent(previousContent);
      setPreviousContent(null);
      toast({
        title: "Undone",
        description: "Reverted to previous version.",
      });
    }
  };

  const formatDateForPost = (dateStr: string) => {
    const [year, month, day] = dateStr.split('-').map(Number);
    const d = new Date(year, month - 1, day);
    return d.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const publishContent = (text: string) => {
    const postData: InsertBlogPost = { content: text, date: formatDateForPost(postDate) };
    if (isEditMode) {
      updateMutation.mutate(postData);
    } else {
      createMutation.mutate(postData);
    }
  };

  const handlePublish = async () => {
    const text = (content || "").trim();
    if (!text) {
      toast({
        title: isEditMode ? "Nothing to Update" : "Nothing to Publish",
        description: "Please write your thoughts first.",
        variant: "destructive",
      });
      return;
    }

    if (hasEnhanced || isEditMode) {
      publishContent(text);
      return;
    }

    setIsAutoWeaving(true);
    try {
      console.log('[WEAVE] Starting auto-weave, content length:', text.length);
      const response = await fetch('/api/ai/enhance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ text, action: 'weave' }),
      });

      console.log('[WEAVE] Response status:', response.status, response.statusText);
      if (!response.ok) {
        const errText = await response.text().catch(() => '');
        console.error('[WEAVE] Error response body:', errText);
        throw new Error('Enhancement failed');
      }
      const data = await response.json();
      const enhanced = data.enhancedText || text;
      console.log('[WEAVE] Success, enhanced length:', enhanced.length);
      setContent(enhanced);
      setHasEnhanced(true);
      console.log('[WEAVE] Now saving to database...');
      publishContent(enhanced);
    } catch (err) {
      console.warn('[WEAVE] Auto-weave failed, publishing original text:', err);
      publishContent(text);
    } finally {
      setIsAutoWeaving(false);
    }
  };

  const isProcessing = createMutation.isPending || updateMutation.isPending || isAutoWeaving;

  const handleLogin = async () => {
    try {
      await login(password);
    } catch {
    }
  };

  if (isAuthLoading) {
    return (
      <>
        <Header />
        <div className="min-h-screen flex items-center justify-center">
          <p className="text-muted-foreground font-serif italic text-lg">Loading...</p>
        </div>
      </>
    );
  }

  if (!isAuthenticated) {
    return (
      <>
        <Header />
        <div className="min-h-screen flex items-center justify-center px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full max-w-sm text-center"
          >
            <Lock className="w-8 h-8 mx-auto mb-4 text-muted-foreground" />
            <h2 className="text-2xl font-medium mb-2">Writer Access</h2>
            <p className="text-sm text-muted-foreground mb-8">Enter your password to start writing</p>
            <div className="space-y-4">
              <Input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && password) handleLogin();
                }}
                className="text-center text-lg"
                autoFocus
                data-testid="input-password"
              />
              {loginError && (
                <p className="text-sm text-destructive" data-testid="text-login-error">{loginError}</p>
              )}
              <Button
                onClick={handleLogin}
                disabled={!password || isLoggingIn}
                className="w-full"
                data-testid="button-login"
              >
                {isLoggingIn ? "Checking..." : "Continue"}
              </Button>
            </div>
          </motion.div>
        </div>
      </>
    );
  }

  if (isEditMode && isLoadingPost) {
    return (
      <>
        <Header />
        <div className="min-h-screen flex items-center justify-center" data-testid="loading-edit-post">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center gap-4"
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            >
              <Sparkles className="w-6 h-6 text-primary" />
            </motion.div>
            <p className="text-muted-foreground font-serif italic text-lg">Loading post...</p>
          </motion.div>
        </div>
      </>
    );
  }

  if (isEditMode && isEditError) {
    return (
      <>
        <Header />
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="text-4xl text-muted-foreground/40 mb-4 font-serif">❦</div>
            <h2 className="text-2xl font-medium mb-2">Post not found</h2>
            <p className="text-muted-foreground mb-6">This story may have been removed.</p>
            <Button onClick={() => setLocation('/')} data-testid="link-go-home">
              Back to Home
            </Button>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Header />

      {/* AI Processing Overlay */}
      <AnimatePresence>
        {isProcessing && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50 flex items-center justify-center"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-background/95 backdrop-blur px-8 py-6 rounded-lg shadow-2xl flex items-center gap-4"
            >
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              >
                <Sparkles className="w-6 h-6 text-primary" />
              </motion.div>
              <div>
                <h3 className="font-medium text-foreground">
                  {isAutoWeaving ? "Polishing your words..." : isEditMode ? "Updating..." : "Publishing..."}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {isAutoWeaving ? "Adding a final touch before publishing" : "Please wait a moment"}
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="min-h-screen relative py-4 sm:py-8"
      >
        {/* Ultra-Minimal Top Bar */}
        <div className="sticky top-0 z-40 bg-transparent">
          <div className="max-w-5xl mx-auto px-3 sm:px-6 py-2 sm:py-3 flex items-center justify-between">
            {/* Stats */}
            <div className="flex items-center gap-3 text-xs text-muted-foreground flex-wrap">
              <button
                type="button"
                onClick={() => setShowDatePicker(!showDatePicker)}
                className="flex items-center gap-1 hover:text-foreground transition-colors"
                data-testid="button-date-toggle"
              >
                <CalendarDays className="w-3 h-3" />
                <span>{formatDateForPost(postDate)}</span>
              </button>
              {showDatePicker && (
                <input
                  type="date"
                  value={postDate}
                  onChange={(e) => {
                    setPostDate(e.target.value);
                    setShowDatePicker(false);
                  }}
                  className="text-xs bg-transparent border-b border-muted-foreground/30 focus:border-foreground outline-none py-0.5"
                  data-testid="input-date"
                  autoFocus
                  onBlur={() => setShowDatePicker(false)}
                />
              )}
              <span>·</span>
              <span>{stats.words} words</span>
              {stats.readTime > 0 && (
                <>
                  <span>·</span>
                  <span>{stats.readTime} min</span>
                </>
              )}
              {lastSaved && (
                <>
                  <span>·</span>
                  <div className="flex items-center gap-1.5 text-emerald-500/70" data-testid="text-save-status">
                    <Check className="w-3 h-3" />
                    <span>{draftRestored ? "Draft restored" : formattedSaveTime}</span>
                  </div>
                </>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                onClick={async () => {
                  try {
                    const text = await navigator.clipboard.readText();
                    if (text) {
                      setContent((prev) => (prev ? prev + "\n" + text : text));
                      toast({ description: "Pasted from clipboard" });
                    }
                  } catch {
                    toast({ description: "Could not access clipboard", variant: "destructive" });
                  }
                }}
                disabled={isProcessing}
                data-testid="button-paste"
              >
                <ClipboardPaste className="w-4 h-4" />
                Paste
              </Button>
              {previousContent !== null && (
                <Button
                  variant="ghost"
                  onClick={handleUndo}
                  disabled={isProcessing}
                  className=""
                  data-testid="button-undo"
                >
                  Undo
                </Button>
              )}
              <Button
                onClick={handlePublish}
                disabled={isProcessing || !(content || "").trim()}
                className="shadow-lg"
                data-testid="button-publish"
              >
                {(createMutation.isPending || updateMutation.isPending)
                  ? (isEditMode ? "Updating..." : "Publishing...")
                  : (isEditMode ? "Update" : "Publish")}
              </Button>
            </div>
          </div>
        </div>

        {/* Paper Sheet Container */}
        <div className="max-w-5xl mx-auto px-3 sm:px-6 relative z-10">
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="bg-[#faf9f7] rounded-sm shadow-2xl"
            style={{
              boxShadow: '0 4px 24px rgba(0, 0, 0, 0.08), 0 0 0 1px rgba(0, 0, 0, 0.05)',
            }}
          >
            <div className="p-4 sm:p-8 md:p-16">
              <Textarea
                ref={contentRef}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Begin writing your thoughts..."
                className="w-full min-h-[60vh] sm:min-h-[600px] resize-none border-none bg-transparent p-0 focus-visible:ring-0 placeholder:text-muted-foreground/30 placeholder:italic"
                style={{
                  fontFamily: 'Georgia, serif',
                  fontSize: 'clamp(18px, 3vw, 22px)',
                  lineHeight: '2',
                  letterSpacing: '0.01em',
                }}
                data-testid="textarea-content"
                disabled={isProcessing}
              />
            </div>
          </motion.div>
        </div>
      </motion.div>
    </>
  );
}
