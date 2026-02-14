import { useState, useRef, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLocation } from "wouter";
import { useMutation } from "@tanstack/react-query";
import Header from "@/components/Header";
import AIAssistantPanel from "@/components/AIAssistantPanel";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";
import {
  Sparkles,
  ChevronRight,
  ChevronLeft,
  Eye,
  EyeOff,
  X,
  Check,
  Save,
  PartyPopper,
  FileText,
  PenLine
} from "lucide-react";
import type { InsertBlogPost } from "@shared/schema";

export default function Create() {
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  
  // Core state
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [selectedText, setSelectedText] = useState("");
  const [selectionStart, setSelectionStart] = useState(0);
  const [selectionEnd, setSelectionEnd] = useState(0);
  const [aiPanelOpen, setAiPanelOpen] = useState(false);
  const [focusMode, setFocusMode] = useState(false);

  // Auto-save state
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  // Success modal state
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [publishedPostId, setPublishedPostId] = useState<number | null>(null);

  // Edit mode state
  const [editMode, setEditMode] = useState(false);
  const [editingPostId, setEditingPostId] = useState<number | null>(null);
  
  // Refs
  const contentRef = useRef<HTMLTextAreaElement>(null);
  const selectionStartRef = useRef(0);
  const selectionEndRef = useRef(0);
  const replaceEntireContentRef = useRef(false);

  // Load draft from localStorage on mount or load post data if editing
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const editId = params.get('edit');

    if (editId) {
      // Load post for editing
      const fetchPost = async () => {
        try {
          const response = await fetch(`/api/posts/${editId}`);
          if (response.ok) {
            const post = await response.json();
            setTitle(post.title || "");
            setContent(post.content || "");
            setEditMode(true);
            setEditingPostId(parseInt(editId));
            toast({
              title: "Editing Post",
              description: "Make your changes and publish to update.",
            });
          }
        } catch (error) {
          toast({
            title: "Error",
            description: "Failed to load post for editing.",
            variant: "destructive",
          });
        }
      };
      fetchPost();
    } else {
      // Load draft from localStorage
      const saved = localStorage.getItem('draft');
      if (saved) {
        try {
          const draft = JSON.parse(saved);
          setTitle(draft.title || "");
          setContent(draft.content || "");
        } catch (e) {
          console.error("Failed to load draft:", e);
        }
      }
    }
  }, [toast]);

  // Auto-save to localStorage (2 seconds after typing stops)
  useEffect(() => {
    if (!title && !content) return;
    
    const timer = setTimeout(() => {
      setLastSaved(new Date());
      localStorage.setItem('draft', JSON.stringify({ title, content }));
    }, 2000);

    return () => clearTimeout(timer);
  }, [title, content]);

  // Auto-focus content after 500ms
  useEffect(() => {
    const timer = setTimeout(() => {
      if (contentRef.current && !content) {
        contentRef.current.focus();
      }
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Escape: Exit focus mode
      if (e.key === 'Escape' && focusMode) {
        setFocusMode(false);
      }
      
      // Cmd/Ctrl + Shift + F: Toggle focus mode
      if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key.toLowerCase() === 'f') {
        e.preventDefault();
        setFocusMode(!focusMode);
      }
      
      // Cmd/Ctrl + Shift + A: Toggle AI sidebar
      if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key.toLowerCase() === 'a') {
        e.preventDefault();
        if (!focusMode) {
          setAiPanelOpen(!aiPanelOpen);
        }
      }
      
      // Cmd/Ctrl + S: Manual save
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 's') {
        e.preventDefault();
        if (title || content) {
          setLastSaved(new Date());
          localStorage.setItem('draft', JSON.stringify({ title, content }));
          toast({
            title: "Saved",
            description: "Your draft has been saved.",
          });
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [focusMode, aiPanelOpen, title, content, toast]);

  // Calculate writing statistics
  const stats = useMemo(() => {
    const words = content.trim().split(/\s+/).filter(w => w.length > 0).length;
    const characters = content.length;
    const readTime = Math.max(1, Math.ceil(words / 200)); // 200 words per minute
    
    return { words, characters, readTime };
  }, [content]);

  // Real-time update of auto-save indicator (every 10 seconds)
  // Using a tick state that forces re-render to update the relative time display
  const [tick, setTick] = useState(0);
  
  useEffect(() => {
    // Always run the interval to keep time display updated
    const interval = setInterval(() => {
      setTick(prev => prev + 1); // Force re-render every 10 seconds
    }, 10000); // Update every 10 seconds
    
    return () => clearInterval(interval);
  }, []); // No dependencies - always keep the interval running

  // Format last saved time (memoized to recalculate when tick or lastSaved changes)
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
  }, [lastSaved, tick]); // Recalculates when either lastSaved or tick changes

  const enhanceMutation = useMutation({
    mutationFn: async ({ 
      text, 
      action, 
      fullContent, 
      selectedText,
      selectionStart,
      selectionEnd
    }: { 
      text: string; 
      action: string;
      fullContent?: string;
      selectedText?: string;
      selectionStart?: number;
      selectionEnd?: number;
    }) => {
      const response = await fetch("/api/ai/enhance", {
        method: "POST",
        body: JSON.stringify({ text, action, fullContent, selectedText, selectionStart, selectionEnd }),
        headers: { "Content-Type": "application/json" },
      });
      if (!response.ok) throw new Error("Enhancement failed");
      return response.json();
    },
    onSuccess: (data, variables) => {
      const { enhancedText } = data;
      
      const hasSelection = variables.selectionStart !== undefined && variables.selectionEnd !== undefined;
      
      if (variables.action === "weave" || !hasSelection) {
        setContent(enhancedText);
      } else {
        const start = variables.selectionStart!;
        const end = variables.selectionEnd!;
        
        setContent((currentContent) => {
          const before = currentContent.substring(0, start);
          const after = currentContent.substring(end);
          return before + enhancedText + after;
        });
      }

      selectionStartRef.current = 0;
      selectionEndRef.current = 0;
      replaceEntireContentRef.current = false;
      setSelectedText("");
      setSelectionStart(0);
      setSelectionEnd(0);

      const actionNames: Record<string, string> = {
        weave: "Words Transformed",
        shorten: "Text Condensed",
        elaborate: "Content Expanded",
        grammar: "Grammar Fixed",
      };

      toast({
        title: actionNames[variables.action] || "Enhanced",
        description: "Your writing has been improved while preserving your authentic voice.",
      });
    },
    onError: () => {
      toast({
        title: "Enhancement Failed",
        description: "Unable to process your request. Please try again.",
        variant: "destructive",
      });
    },
  });

  const createMutation = useMutation({
    mutationFn: async (post: InsertBlogPost) => {
      const url = editMode && editingPostId ? `/api/posts/${editingPostId}` : "/api/posts";
      const method = editMode && editingPostId ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        body: JSON.stringify(post),
        headers: { "Content-Type": "application/json" },
      });
      if (!response.ok) throw new Error(`Failed to ${editMode ? "update" : "create"} post`);
      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/posts"] });

      // Show success modal instead of immediate redirect
      setPublishedPostId(data.id);
      setShowSuccessModal(true);

      // Clear draft after successful publish
      localStorage.removeItem('draft');
    },
    onError: () => {
      toast({
        title: editMode ? "Update Failed" : "Save Failed",
        description: `Unable to ${editMode ? "update" : "save"} your story. Please try again.`,
        variant: "destructive",
      });
    },
  });

  const handleMagicWeave = () => {
    if (!content.trim()) {
      toast({
        title: "Nothing to Transform",
        description: "Please write your thoughts first.",
        variant: "destructive",
      });
      return;
    }
    enhanceMutation.mutate({ text: content, action: "weave" });
  };

  const syncSelection = () => {
    if (!contentRef.current) return;
    if (contentRef.current.disabled) return;
    
    const start = contentRef.current.selectionStart;
    const end = contentRef.current.selectionEnd;
    
    selectionStartRef.current = start;
    selectionEndRef.current = end;
    
    if (start !== end) {
      setSelectedText(content.substring(start, end));
      setSelectionStart(start);
      setSelectionEnd(end);
    } else {
      setSelectedText("");
      setSelectionStart(0);
      setSelectionEnd(0);
    }
  };

  const handleAIAction = (action: string) => {
    const hasSelection = selectionStartRef.current !== selectionEndRef.current;
    const textToEnhance = hasSelection 
      ? content.substring(selectionStartRef.current, selectionEndRef.current)
      : content;
    
    if (!textToEnhance.trim()) {
      toast({
        title: "No Text Selected",
        description: "Please select some text or write content to enhance.",
        variant: "destructive",
      });
      return;
    }
    
    replaceEntireContentRef.current = !hasSelection;
    
    enhanceMutation.mutate({ 
      text: textToEnhance, 
      action,
      fullContent: hasSelection ? content : undefined,
      selectedText: hasSelection ? textToEnhance : undefined,
      selectionStart: hasSelection ? selectionStartRef.current : undefined,
      selectionEnd: hasSelection ? selectionEndRef.current : undefined,
    });
  };

  const handlePublish = () => {
    if (!content.trim()) {
      toast({
        title: "Nothing to Publish",
        description: "Please write your thoughts first.",
        variant: "destructive",
      });
      return;
    }

    // Backend will use AI to generate any missing metadata
    // If user provided title, it will be used; otherwise AI generates it
    // AI always generates category, excerpt, and readTime
    const postData: InsertBlogPost = {
      content: content.trim(),
    };

    // Include user-provided title if exists
    if (title.trim()) {
      postData.title = title.trim();
    }

    createMutation.mutate(postData);
  };

  const handleClear = () => {
    if (title || content) {
      const confirmed = window.confirm("Are you sure you want to clear your writing?");
      if (confirmed) {
        setTitle("");
        setContent("");
        setLastSaved(null); // Reset save indicator
        localStorage.removeItem('draft');
        toast({
          title: "Cleared",
          description: "Your writing has been cleared.",
        });
      }
    }
  };

  const isProcessing = enhanceMutation.isPending || createMutation.isPending;
  const isEmpty = !title && !content;

  return (
    <>
      {!focusMode && <Header />}
      
      {/* Focus mode background overlay */}
      {focusMode && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-background z-40 pointer-events-none"
        />
      )}

      {/* AI Processing Overlay */}
      <AnimatePresence>
        {isProcessing && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-background/50 backdrop-blur-[2px] z-30 flex items-start justify-center pt-32"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white/90 border border-emerald-100/70 dark:border-emerald-900/50 rounded-2xl shadow-[0_30px_60px_rgba(16,185,129,0.25)] p-8 max-w-sm backdrop-blur"
            >
              <div className="flex flex-col items-center text-center gap-4">
                <motion.div
                  animate={{
                    rotate: [0, 360],
                    scale: [1, 1.1, 1],
                  }}
                  transition={{
                    rotate: { duration: 2, repeat: Infinity, ease: "linear" },
                    scale: { duration: 1, repeat: Infinity, ease: "easeInOut" },
                  }}
                >
                  <Sparkles className="w-12 h-12 text-emerald-600 dark:text-emerald-400" />
                </motion.div>
                <div>
                  <h3 className="text-lg font-medium mb-1">
                    {enhanceMutation.variables?.action === "weave" ? "Transforming Your Words" : "Enhancing Your Writing"}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    The AI is carefully preserving your voice while improving clarity...
                  </p>
                </div>
                <div className="w-full bg-muted rounded-full h-1 overflow-hidden">
                  <motion.div
                    className="h-full bg-gradient-to-r from-emerald-400 via-emerald-500 to-emerald-600"
                    initial={{ width: "0%" }}
                    animate={{ width: "100%" }}
                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                  />
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="min-h-screen relative"
      >
        <div className="relative z-10 max-w-7xl mx-auto px-6 pt-6 pb-24">
          {/* Top Bar - Collapsible */}
          <AnimatePresence>
            {!focusMode && (
              <motion.div
                initial={{ y: -100, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -100, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="sticky top-6 z-50"
              >
                <div className="px-6 py-5 flex items-center justify-between border rounded-3xl bg-background/80 backdrop-blur-xl shadow-lg">
                  {/* Stats - Minimal with smooth transitions */}
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex items-center gap-4 text-xs"
                  >
                    <motion.span
                      key={stats.words}
                      initial={{ scale: 0.95 }}
                      animate={{ scale: 1 }}
                      className="text-muted-foreground/60 font-medium"
                    >
                      {stats.words} {stats.words === 1 ? 'word' : 'words'}
                    </motion.span>
                    {stats.readTime > 0 && (
                      <>
                        <span className="text-muted-foreground/30">·</span>
                        <span className="text-muted-foreground/60">{stats.readTime} min read</span>
                      </>
                    )}
                    {lastSaved && (
                      <>
                        <span className="text-muted-foreground/30">·</span>
                        <motion.div
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          className="flex items-center gap-1.5 text-emerald-600/90 dark:text-emerald-400/90"
                        >
                          <Check className="w-3 h-3" />
                          <span>Saved {formattedSaveTime}</span>
                        </motion.div>
                      </>
                    )}
                  </motion.div>

                  {/* Actions - Icon Only with enhanced hover states */}
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex items-center gap-2"
                  >
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setFocusMode(true)}
                      data-testid="button-focus-mode"
                      aria-label="Focus Mode"
                      title="Focus Mode (⌘⇧F)"
                      className="hover:bg-accent hover:text-accent-foreground transition-all hover:scale-105"
                    >
                      <Eye className="w-4 h-4" />
                    </Button>

                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setAiPanelOpen(!aiPanelOpen)}
                      data-testid="button-toggle-ai-panel"
                      aria-label={aiPanelOpen ? "Close AI Assistant" : "Open AI Assistant"}
                      aria-expanded={aiPanelOpen}
                      aria-controls="ai-assistant-panel"
                      title="AI Assistant (⌘⇧A)"
                      className={`transition-all hover:scale-105 ${aiPanelOpen ? 'bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400' : 'hover:bg-accent hover:text-accent-foreground'}`}
                    >
                      <Sparkles className="w-4 h-4" />
                    </Button>

                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={handleClear}
                      disabled={isEmpty}
                      data-testid="button-clear"
                      aria-label="Clear"
                      title="Clear All"
                      className="hover:bg-emerald-50 hover:text-emerald-700 transition-all hover:scale-105 disabled:opacity-40"
                    >
                      <X className="w-4 h-4" />
                    </Button>

                    <div className="w-px h-6 bg-border mx-1"></div>

                    <Button
                      variant="default"
                      onClick={handlePublish}
                      disabled={isProcessing || !content.trim()}
                      className="gap-2 transition-all hover:scale-105 shadow-lg shadow-emerald-200/70 bg-gradient-to-r from-emerald-500 via-emerald-600 to-emerald-700 hover:from-emerald-600 hover:to-emerald-800 text-white border-none"
                      data-testid="button-publish"
                    >
                      {createMutation.isPending ? (
                        <>
                          <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                          >
                            <Sparkles className="w-4 h-4" />
                          </motion.div>
                          <span>Publishing...</span>
                        </>
                      ) : (
                        <>
                          <Save className="w-4 h-4" />
                          <span>Publish</span>
                        </>
                      )}
                    </Button>
                  </motion.div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Main Content Area */}
          <div className="flex gap-10">
            {/* Editor */}
            <motion.div
              layout
              className={`relative flex-1 transition-all duration-300 ${
                aiPanelOpen && !focusMode ? 'max-w-3xl' : 'max-w-4xl mx-auto'
              } ${!focusMode ? 'bg-background/80 border rounded-[36px] shadow-lg backdrop-blur' : ''}`}
              style={{ position: 'relative', zIndex: 50 }}
            >
              <div className="px-6 py-12 md:px-12 md:py-14">
                {/* Title Input */}
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Give your thoughts a title..."
                  className="w-full bg-transparent border-none outline-none focus:outline-none focus:ring-0 p-0 placeholder:text-muted-foreground/40 transition-all duration-300"
                  style={{
                    fontSize: focusMode ? '3.5rem' : '3rem',
                    lineHeight: '1.1',
                    letterSpacing: '-0.02em',
                    fontWeight: 400,
                  }}
                  data-testid="input-title"
                  disabled={isProcessing}
                  autoComplete="off"
                />

                {/* Title Divider */}
                {title && (
                  <motion.div
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: 1 }}
                    transition={{ duration: 0.3 }}
                    className="h-px bg-border mb-12 mt-8 origin-left"
                  />
                )}

                {/* Content Textarea */}
                <div className="relative">
                  <Textarea
                    ref={contentRef}
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    onSelect={syncSelection}
                    onKeyUp={syncSelection}
                    onMouseUp={syncSelection}
                    placeholder="What's on your mind?"
                    className="min-h-[600px] resize-none border-0 shadow-none focus-visible:ring-0 p-0 placeholder:text-muted-foreground/30 transition-all duration-300"
                    style={{
                      fontSize: focusMode ? '1.5rem' : '1.375rem',
                      lineHeight: '1.8',
                      letterSpacing: '0.01em',
                      fontFamily: 'Georgia, serif',
                      fontWeight: 400,
                    }}
                    data-testid="textarea-content"
                    disabled={isProcessing}
                  />
                </div>
              </div>
            </motion.div>

            {/* AI Sidebar */}
            <AnimatePresence>
              {aiPanelOpen && !focusMode && (
                <motion.div
                  id="ai-assistant-panel"
                  initial={{ x: 300, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  exit={{ x: 300, opacity: 0 }}
                  transition={{ type: "spring", damping: 25, stiffness: 200 }}
                  className="w-80 sticky top-32 h-fit"
                  style={{ alignSelf: 'flex-start' }}
                >
                  <motion.div
                    initial={{ scale: 0.95 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.1 }}
                  >
                    <AIAssistantPanel
                      onAction={handleAIAction}
                      onMagicWeave={handleMagicWeave}
                      isProcessing={enhanceMutation.isPending && enhanceMutation.variables?.action !== "weave"}
                      isMagicWeaving={enhanceMutation.isPending && enhanceMutation.variables?.action === "weave"}
                      selectedText={selectedText}
                      hasContent={!!content.trim()}
                    />
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </motion.div>

      {/* Focus Mode Exit Hint */}
      {focusMode && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1, duration: 0.5 }}
          className="fixed bottom-12 left-1/2 -translate-x-1/2 z-50"
        >
          <div className="bg-background/90 backdrop-blur-sm border border-emerald-100/80 rounded-full px-6 py-3 shadow-lg">
            <div className="flex items-center gap-3 text-sm text-muted-foreground">
              <EyeOff className="w-4 h-4" />
              <span>Press <kbd className="px-2 py-0.5 bg-muted rounded text-xs font-medium">Esc</kbd> to exit focus mode</span>
            </div>
          </div>
        </motion.div>
      )}

      {/* Success Modal */}
      <Dialog open={showSuccessModal} onOpenChange={setShowSuccessModal}>
        <DialogContent className="sm:max-w-md" onEscapeKeyDown={() => setShowSuccessModal(false)}>
          <DialogHeader>
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", duration: 0.6 }}
              className="mx-auto mb-4"
            >
              <div className="relative">
                <motion.div
                  animate={{
                    rotate: [0, 10, -10, 10, 0],
                  }}
                  transition={{
                    duration: 0.5,
                    delay: 0.2,
                  }}
                >
                  <PartyPopper className="w-16 h-16 text-emerald-500 dark:text-emerald-400" />
                </motion.div>
                <motion.div
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  className="absolute -top-2 -right-2"
                >
                  <Check className="w-6 h-6 text-emerald-600 bg-background rounded-full" />
                </motion.div>
              </div>
            </motion.div>
            <DialogTitle className="text-2xl text-center">
              {editMode ? "Story Updated!" : "Story Published!"}
            </DialogTitle>
            <DialogDescription className="text-center text-base">
              {editMode
                ? "Your changes have been saved and your story has been updated."
                : "Your words have been shared with the world. Well done!"}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex-col sm:flex-col gap-2 mt-4">
            <Button
              onClick={() => {
                setShowSuccessModal(false);
                if (publishedPostId) {
                  setLocation(`/?view=${publishedPostId}`);
                }
              }}
              className="w-full gap-2"
              size="lg"
            >
              <FileText className="w-4 h-4" />
              View Post
            </Button>
            <Button
              onClick={() => {
                setShowSuccessModal(false);
                setTitle("");
                setContent("");
                setEditMode(false);
                setEditingPostId(null);
                setPublishedPostId(null);
                if (contentRef.current) {
                  contentRef.current.focus();
                }
              }}
              variant="outline"
              className="w-full gap-2"
              size="lg"
            >
              <PenLine className="w-4 h-4" />
              Write Another
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
