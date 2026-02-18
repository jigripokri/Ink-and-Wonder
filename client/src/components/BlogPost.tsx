import { motion } from "framer-motion";
import { useLocation } from "wouter";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Edit, Trash2, Share2, Check, Link, Eye, EyeOff, RefreshCw, MoreVertical } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useState, useEffect } from "react";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/lib/auth";

interface BlogPostProps {
  post: {
    id: number;
    title: string;
    content: string;
    date: string | null;
    category: string;
    readTime: string | null;
    isPrivate: boolean;
    createdAt: Date;
    updatedAt: Date;
  };
  onBack: () => void;
}

export default function BlogPost({ post, onBack }: BlogPostProps) {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { isAuthenticated } = useAuth();
  const [isPrivate, setIsPrivate] = useState(post.isPrivate);
  const paragraphs = post.content.split("\n\n");
  const midpoint = Math.floor(paragraphs.length / 2);
  const pullQuote = paragraphs[midpoint]?.split(".")[0] + ".";

  const isEdited = new Date(post.updatedAt).getTime() > new Date(post.createdAt).getTime() + 1000;

  const deleteMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch(`/api/posts/${post.id}`, {
        method: "DELETE",
      });
      if (!response.ok) {
        throw new Error("Failed to delete post");
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/posts"] });
      toast({
        title: "Post deleted",
        description: "Your story has been deleted successfully.",
      });
      onBack();
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete the post. Please try again.",
        variant: "destructive",
      });
    },
  });

  const privacyMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch(`/api/posts/${post.id}/privacy`, {
        method: "PATCH",
      });
      if (!response.ok) {
        throw new Error("Failed to toggle privacy");
      }
      return response.json();
    },
    onSuccess: (updatedPost) => {
      setIsPrivate(updatedPost.isPrivate);
      queryClient.invalidateQueries({ queryKey: ["/api/posts"] });
      toast({
        title: updatedPost.isPrivate ? "Post is now private" : "Post is now public",
        description: updatedPost.isPrivate
          ? "Only you can see this story."
          : "Everyone can see this story now.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to change privacy. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleEdit = () => {
    setLocation(`/create?edit=${post.id}`);
  };

  const handleDelete = () => {
    if (window.confirm("Are you sure you want to delete this story? This cannot be undone.")) {
      deleteMutation.mutate();
    }
  };

  const [illustrationExists, setIllustrationExists] = useState(false);
  const [illustrationVersion, setIllustrationVersion] = useState(Date.now());
  const illustrationUrl = `/illustrations/post-${post.id}.png?v=${illustrationVersion}`;

  useEffect(() => {
    const img = new Image();
    img.onload = () => setIllustrationExists(true);
    img.onerror = () => setIllustrationExists(false);
    img.src = illustrationUrl;
  }, [illustrationUrl]);

  const regenerateMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch(`/api/posts/${post.id}/illustration`, {
        method: "POST",
      });
      if (!response.ok) throw new Error("Failed to regenerate illustration");
      return response.json();
    },
    onSuccess: () => {
      setIllustrationVersion(Date.now());
      setIllustrationExists(true);
      toast({ title: "Illustration regenerated" });
    },
    onError: () => {
      toast({ title: "Failed to regenerate", description: "Please try again.", variant: "destructive" });
    },
  });

  const [copied, setCopied] = useState(false);

  const getShareUrl = () => {
    return `${window.location.origin}/post/${post.id}`;
  };

  const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

  const handleShare = async () => {
    const shareUrl = getShareUrl();

    if (isMobile && navigator.share) {
      try {
        await navigator.share({
          title: post.title,
          text: post.title,
          url: shareUrl,
        });
      } catch {
      }
    } else {
      await copyToClipboard(shareUrl);
    }
  };

  const copyToClipboard = async (url: string) => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      toast({
        title: "Link copied",
        description: "Share it with family and friends.",
      });
      setTimeout(() => setCopied(false), 2000);
    } catch {
      const textArea = document.createElement("textarea");
      textArea.value = url;
      textArea.style.position = "fixed";
      textArea.style.opacity = "0";
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand("copy");
      document.body.removeChild(textArea);
      setCopied(true);
      toast({
        title: "Link copied",
        description: "Share it with family and friends.",
      });
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.3 }}
        className="flex justify-between items-center mb-8"
      >
        <Button
          variant="ghost"
          onClick={onBack}
          className="group"
          data-testid="button-back"
        >
          <ArrowLeft className="mr-2 h-4 w-4 transition-transform group-hover:-translate-x-1" />
          Back to Posts
        </Button>
        <div className="flex gap-2">
          <Button
            variant="ghost"
            onClick={handleShare}
            data-testid="button-share"
          >
            {copied ? (
              <Check className="h-4 w-4 text-emerald-500" />
            ) : (
              <Share2 className="h-4 w-4 text-muted-foreground" />
            )}
          </Button>
          {isAuthenticated && (
            <>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => privacyMutation.mutate()}
                disabled={privacyMutation.isPending}
                data-testid="button-toggle-privacy"
                title={isPrivate ? "Make public" : "Make private"}
                className="hidden sm:inline-flex"
              >
                {isPrivate ? (
                  <EyeOff className="h-4 w-4 text-muted-foreground" />
                ) : (
                  <Eye className="h-4 w-4 text-muted-foreground" />
                )}
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => regenerateMutation.mutate()}
                disabled={regenerateMutation.isPending}
                title={illustrationExists ? "Regenerate illustration" : "Generate illustration"}
                data-testid="button-regenerate-illustration"
                className="hidden sm:inline-flex"
              >
                <RefreshCw className={`h-4 w-4 text-muted-foreground ${regenerateMutation.isPending ? 'animate-spin' : ''}`} />
              </Button>
              <Button
                variant="ghost"
                onClick={handleDelete}
                disabled={deleteMutation.isPending}
                data-testid="button-delete"
                className="hidden sm:inline-flex"
              >
                <Trash2 className="h-4 w-4 text-muted-foreground" />
              </Button>
              <Button
                variant="outline"
                onClick={handleEdit}
                className="gap-2"
                data-testid="button-edit"
              >
                <Edit className="h-4 w-4" />
                <span className="hidden sm:inline">Edit</span>
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="sm:hidden"
                    data-testid="button-overflow-menu"
                  >
                    <MoreVertical className="h-4 w-4 text-muted-foreground" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem
                    onClick={() => privacyMutation.mutate()}
                    disabled={privacyMutation.isPending}
                    data-testid="menu-toggle-privacy"
                  >
                    {isPrivate ? (
                      <EyeOff className="h-4 w-4 mr-2" />
                    ) : (
                      <Eye className="h-4 w-4 mr-2" />
                    )}
                    {isPrivate ? "Make public" : "Make private"}
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => regenerateMutation.mutate()}
                    disabled={regenerateMutation.isPending}
                    data-testid="menu-regenerate-illustration"
                  >
                    <RefreshCw className={`h-4 w-4 mr-2 ${regenerateMutation.isPending ? 'animate-spin' : ''}`} />
                    {illustrationExists ? "Regenerate illustration" : "Generate illustration"}
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={handleDelete}
                    disabled={deleteMutation.isPending}
                    className="text-destructive"
                    data-testid="menu-delete"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete post
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          )}
        </div>
      </motion.div>

      <motion.article
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex items-center gap-2 mb-4 flex-wrap">
          <Badge className="text-xs uppercase tracking-widest" data-testid="badge-category">
            {post.category}
          </Badge>
          {isPrivate && (
            <Badge variant="outline" className="text-xs uppercase tracking-widest" data-testid="badge-private">
              <EyeOff className="h-3 w-3 mr-1" />
              Private
            </Badge>
          )}
        </div>

        <h1 className="text-3xl sm:text-5xl md:text-6xl tracking-tight leading-tight mb-6">
          {post.title}
        </h1>

        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-8">
          <span data-testid="text-date">{post.date || 'Recently'}</span>
          <span>·</span>
          <span data-testid="text-readtime">{post.readTime || '5 min read'}</span>
          {isEdited && (
            <>
              <span>·</span>
              <span className="text-xs italic">Last edited</span>
            </>
          )}
        </div>

        <div className="prose prose-lg max-w-none">
          {(() => {
            const isLongPost = paragraphs.length >= 5;
            const useFloatedLayout = illustrationExists && isLongPost;
            const useCenteredLayout = illustrationExists && !isLongPost;

            return paragraphs.map((para, i) => {

            if (i === 0) {
              return (
                <div key={i}>
                  {useCenteredLayout && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.2 }}
                      className="my-6 flex flex-col items-center"
                    >
                      <img
                        src={illustrationUrl}
                        alt={`Illustration for ${post.title}`}
                        className="w-[200px] sm:w-[250px] h-auto"
                        data-testid="img-illustration"
                      />
                    </motion.div>
                  )}
                  <motion.p
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="text-lg leading-relaxed opacity-90 mb-8"
                  >
                    <span className="float-left text-[3rem] sm:text-[4.5rem] leading-[0.85] mr-2 mt-1 font-medium">
                      {para.charAt(0)}
                    </span>
                    {para.slice(1)}
                  </motion.p>
                </div>
              );
            }

            if (useFloatedLayout && i === 1) {
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="text-lg leading-relaxed opacity-90 mb-8"
                >
                  <span className="block mx-auto mb-1 sm:float-right sm:ml-6 sm:mb-4 sm:mx-0 w-[200px] sm:w-[200px] md:w-[240px]">
                    <motion.img
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.3 }}
                      src={illustrationUrl}
                      alt={`Illustration for ${post.title}`}
                      className="w-full h-auto"
                      data-testid="img-illustration"
                    />
                  </span>
                  {para}
                </motion.div>
              );
            }

            if (i === midpoint) {
              return (
                <div key={i}>
                  <motion.blockquote
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5 }}
                    className="text-xl sm:text-2xl md:text-3xl italic font-light border-l-2 border-foreground pl-4 sm:pl-8 pr-4 my-12"
                  >
                    {pullQuote}
                  </motion.blockquote>
                  <motion.p
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="text-lg leading-relaxed opacity-90 mb-8"
                  >
                    {para}
                  </motion.p>
                </div>
              );
            }

            return (
              <motion.p
                key={i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="text-lg leading-relaxed opacity-90 mb-8"
              >
                {para}
              </motion.p>
            );
          });
          })()}
        </div>
      </motion.article>
    </div>
  );
}
