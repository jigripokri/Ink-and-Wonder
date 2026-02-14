import { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import Header from "@/components/Header";
import Hero from "@/components/Hero";
import BlogCard from "@/components/BlogCard";
import SkeletonCard from "@/components/SkeletonCard";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, X } from "lucide-react";
import type { BlogPost as BlogPostType } from "@shared/schema";

export default function Home() {
  const [location, setLocation] = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [debouncedSearch, setDebouncedSearch] = useState("");

  const { data: posts = [], isLoading } = useQuery<BlogPostType[]>({
    queryKey: ["/api/posts"],
  });

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Backward compatibility: redirect ?view=ID to /post/ID
  useEffect(() => {
    const params = new URLSearchParams(location.split('?')[1] || '');
    const viewId = params.get('view');
    if (viewId) {
      setLocation(`/post/${viewId}`, { replace: true });
    }
  }, [location, setLocation]);

  // Get unique categories
  const categories = useMemo(() => {
    const cats = new Set(posts.map(post => post.category));
    return Array.from(cats).sort();
  }, [posts]);

  // Filter posts based on search and category
  const filteredPosts = useMemo(() => {
    return posts.filter(post => {
      const matchesSearch = !debouncedSearch ||
        post.title.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
        post.excerpt.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
        post.content.toLowerCase().includes(debouncedSearch.toLowerCase());

      const matchesCategory = !selectedCategory || post.category === selectedCategory;

      return matchesSearch && matchesCategory;
    });
  }, [posts, debouncedSearch, selectedCategory]);

  const hasActiveFilters = searchQuery || selectedCategory;
  const showEmptyState = filteredPosts.length === 0 && posts.length > 0 && hasActiveFilters;

  return (
    <>
      <a href="#main-content" className="skip-to-content">
        Skip to main content
      </a>
      <Header />
      <Hero />
      <motion.div
        id="main-content"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="max-w-6xl mx-auto px-6 sm:px-8 py-4 sm:py-6"
        role="main"
        aria-label="Blog posts"
      >
        {/* Search and Filter Bar */}
        {posts.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 sm:mb-8 space-y-4"
          >
            {/* Search Input */}
            <div className="relative max-w-2xl mx-auto">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search stories..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 pr-12 h-10 sm:h-12 text-base"
                aria-label="Search stories"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  aria-label="Clear search"
                >
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>

            {/* Category Filters */}
            {categories.length > 0 && (
              <div className="flex flex-wrap items-center justify-center gap-2" role="group" aria-label="Category filters">
                <Badge
                  variant={selectedCategory === null ? "default" : "outline"}
                  className="cursor-pointer transition-all hover:scale-105"
                  onClick={() => setSelectedCategory(null)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      setSelectedCategory(null);
                    }
                  }}
                  tabIndex={0}
                  role="button"
                  aria-pressed={selectedCategory === null}
                  aria-label="Show all stories"
                >
                  All Stories
                </Badge>
                {categories.map(category => (
                  <Badge
                    key={category}
                    variant={selectedCategory === category ? "default" : "outline"}
                    className="cursor-pointer transition-all hover:scale-105"
                    onClick={() => setSelectedCategory(selectedCategory === category ? null : category)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        setSelectedCategory(selectedCategory === category ? null : category);
                      }
                    }}
                    tabIndex={0}
                    role="button"
                    aria-pressed={selectedCategory === category}
                    aria-label={`Filter by ${category}`}
                  >
                    {category}
                  </Badge>
                ))}
              </div>
            )}

            {/* Results count */}
            {hasActiveFilters && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center text-sm text-muted-foreground"
              >
                Showing {filteredPosts.length} of {posts.length} {filteredPosts.length === 1 ? 'story' : 'stories'}
              </motion.p>
            )}
          </motion.div>
        )}

        {/* Posts Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {[...Array(4)].map((_, i) => (
              <SkeletonCard key={i} index={i} />
            ))}
          </div>
        ) : posts.length === 0 ? (
          <div className="text-center text-muted-foreground py-20 max-w-2xl mx-auto">
            <div className="text-4xl font-serif mb-4">❦</div>
            <h3 className="text-2xl mb-4">No Stories Yet</h3>
            <p className="text-lg leading-relaxed">
              Your journal is waiting for its first story. Click "Write" above to begin sharing your memories and wisdom.
            </p>
          </div>
        ) : showEmptyState ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center text-muted-foreground py-20 max-w-2xl mx-auto"
          >
            <div className="text-4xl font-serif mb-4">❦</div>
            <h3 className="text-2xl mb-4">No Matching Stories</h3>
            <p className="text-lg leading-relaxed mb-6">
              We couldn't find any stories matching your search criteria.
              Try different keywords or clear your filters.
            </p>
            <button
              onClick={() => {
                setSearchQuery("");
                setSelectedCategory(null);
              }}
              className="text-primary hover:underline font-medium"
            >
              Clear all filters
            </button>
          </motion.div>
        ) : (
          <AnimatePresence mode="wait">
            <motion.div
              key={`${debouncedSearch}-${selectedCategory}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="grid grid-cols-1 md:grid-cols-2 gap-8"
              role="list"
              aria-label="Blog posts list"
            >
              {filteredPosts.map((post, index) => (
                <div key={post.id} role="listitem">
                  <BlogCard
                    post={post}
                    index={index}
                    onClick={() => setLocation(`/post/${post.id}`)}
                  />
                </div>
              ))}
            </motion.div>
          </AnimatePresence>
        )}
      </motion.div>
    </>
  );
}
