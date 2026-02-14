import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { EyeOff } from "lucide-react";

interface BlogPost {
  id: number;
  title: string;
  excerpt: string;
  date: string | null;
  category: string;
  readTime: string | null;
  isPrivate: boolean;
}

interface BlogCardProps {
  post: BlogPost;
  index: number;
  onClick: () => void;
}

export default function BlogCard({ post, index, onClick }: BlogCardProps) {
  const variant = index % 4;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.05 }}
    >
      {variant === 0 && <LargeNumberCard post={post} onClick={onClick} />}
      {variant === 1 && <CenteredElegantCard post={post} onClick={onClick} />}
      {variant === 2 && <QuoteStyleCard post={post} onClick={onClick} />}
      {variant === 3 && <SidebarAccentCard post={post} onClick={onClick} />}
    </motion.div>
  );
}

function LargeNumberCard({ post, onClick }: { post: BlogPost; onClick: () => void }) {
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onClick();
    }
  };

  return (
    <Card
      className="relative p-5 sm:p-8 cursor-pointer transition-all duration-300 hover:-translate-y-1 hover:border-foreground/20 overflow-hidden"
      onClick={onClick}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      role="button"
      aria-label={`Read post: ${post.title}`}
      data-testid={`card-post-${post.id}`}
    >
      <div className="absolute top-4 right-4 text-[8rem] font-light opacity-10 leading-none select-none">
        {post.id}
      </div>
      <div className="relative z-10">
        <div className="flex items-center gap-2 mb-4 flex-wrap">
          <p className="text-xs uppercase tracking-widest text-muted-foreground">
            {post.category}
          </p>
          {post.isPrivate && <EyeOff className="h-3 w-3 text-muted-foreground" />}
        </div>
        <h3 className="text-2xl sm:text-3xl leading-tight font-medium mb-4 text-foreground">
          {post.title}
        </h3>
        <p className="text-muted-foreground leading-relaxed mb-6">
          {post.excerpt}
        </p>
        <div className="flex justify-between items-center pt-6 border-t border-border text-sm text-muted-foreground">
          <span>{post.date || 'Recently'}</span>
          <span>{post.readTime || '5 min read'}</span>
        </div>
      </div>
    </Card>
  );
}

function CenteredElegantCard({ post, onClick }: { post: BlogPost; onClick: () => void }) {
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onClick();
    }
  };

  return (
    <Card
      className="p-6 sm:p-12 text-center cursor-pointer transition-all duration-300 hover:-translate-y-1 hover:border-foreground/20"
      onClick={onClick}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      role="button"
      aria-label={`Read post: ${post.title}`}
      data-testid={`card-post-${post.id}`}
    >
      <div className="text-4xl text-muted-foreground/40 mb-6 font-serif">❦</div>
      <div className="flex items-center justify-center gap-2 mb-4 flex-wrap">
        <p className="text-xs uppercase tracking-widest text-muted-foreground">
          {post.category}
        </p>
        {post.isPrivate && <EyeOff className="h-3 w-3 text-muted-foreground" />}
      </div>
      <h3 className="text-2xl font-medium mb-4 px-4 text-foreground">{post.title}</h3>
      <p className="text-sm text-muted-foreground leading-relaxed mb-8">
        {post.excerpt}
      </p>
      <p className="text-sm text-muted-foreground">
        {post.date || 'Recently'} · {post.readTime || '5 min read'}
      </p>
    </Card>
  );
}

function QuoteStyleCard({ post, onClick }: { post: BlogPost; onClick: () => void }) {
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onClick();
    }
  };

  return (
    <Card
      className="relative p-5 sm:p-10 cursor-pointer transition-all duration-300 hover:-translate-y-1 hover:border-foreground/20"
      onClick={onClick}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      role="button"
      aria-label={`Read post: ${post.title}`}
      data-testid={`card-post-${post.id}`}
    >
      <div className="text-6xl font-serif opacity-20 leading-none mb-4">"</div>
      <h3 className="text-2xl italic font-light mb-4 text-foreground">
        {post.title}
      </h3>
      <p className="text-sm text-muted-foreground leading-relaxed mb-6">
        {post.excerpt}
      </p>
      <div className="flex justify-between items-center text-sm text-muted-foreground">
        <span className="flex items-center gap-1 uppercase tracking-widest text-xs">
          {post.category}
          {post.isPrivate && <EyeOff className="h-3 w-3" />}
        </span>
        <span>
          {post.date || 'Recently'} · {post.readTime || '5 min read'}
        </span>
      </div>
    </Card>
  );
}

function SidebarAccentCard({ post, onClick }: { post: BlogPost; onClick: () => void }) {
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onClick();
    }
  };

  return (
    <Card
      className="relative overflow-hidden cursor-pointer transition-all duration-300 hover:-translate-y-1 hover:border-foreground/20 group"
      onClick={onClick}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      role="button"
      aria-label={`Read post: ${post.title}`}
      data-testid={`card-post-${post.id}`}
    >
      <div className="absolute left-0 top-0 bottom-0 w-1 bg-foreground transition-all duration-300 group-hover:w-2"></div>
      <div className="pl-6 sm:pl-10 p-5 sm:p-8">
        <div className="flex items-center gap-2 mb-4 flex-wrap">
          <p className="text-xs uppercase tracking-widest text-muted-foreground">
            {post.category}
          </p>
          {post.isPrivate && <EyeOff className="h-3 w-3 text-muted-foreground" />}
        </div>
        <h3 className="text-2xl font-medium mb-4 text-foreground">{post.title}</h3>
        <p className="text-muted-foreground leading-relaxed mb-6">{post.excerpt}</p>
        <div className="flex justify-between items-center pt-6 border-t border-border text-sm text-muted-foreground">
          <span>{post.date || 'Recently'}</span>
          <span className="ml-2">· {post.readTime || '5 min read'}</span>
        </div>
      </div>
    </Card>
  );
}
