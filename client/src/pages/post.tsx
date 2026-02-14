import { useParams, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import Header from "@/components/Header";
import BlogPost from "@/components/BlogPost";
import { Skeleton } from "@/components/ui/skeleton";
import type { BlogPost as BlogPostType } from "@shared/schema";

export default function PostPage() {
  const { id } = useParams<{ id: string }>();
  const [, setLocation] = useLocation();

  const { data: post, isLoading, error } = useQuery<BlogPostType>({
    queryKey: ["/api/posts", id],
    queryFn: async () => {
      const res = await fetch(`/api/posts/${id}`);
      if (!res.ok) throw new Error("Post not found");
      return res.json();
    },
    enabled: !!id,
  });

  if (isLoading) {
    return (
      <>
        <Header />
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
          <Skeleton className="h-8 w-32 mb-8" />
          <Skeleton className="h-6 w-24 mb-4" />
          <Skeleton className="h-12 w-full mb-4" />
          <Skeleton className="h-12 w-3/4 mb-6" />
          <Skeleton className="h-4 w-48 mb-8" />
          <div className="space-y-4">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-4/5" />
          </div>
        </div>
      </>
    );
  }

  if (error || !post) {
    return (
      <>
        <Header />
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-20 text-center">
          <div className="text-4xl font-serif mb-4 text-muted-foreground/40">&#10086;</div>
          <h2 className="text-2xl mb-4" data-testid="text-not-found">Story Not Found</h2>
          <p className="text-muted-foreground mb-6">
            This story may have been removed or doesn't exist.
          </p>
          <button
            onClick={() => setLocation("/")}
            className="text-primary hover:underline font-medium"
            data-testid="link-back-home"
          >
            Back to all stories
          </button>
        </div>
      </>
    );
  }

  return (
    <>
      <Header />
      <BlogPost
        post={{
          ...post,
          createdAt: new Date(post.createdAt),
          updatedAt: new Date(post.updatedAt),
        }}
        onBack={() => setLocation("/")}
      />
    </>
  );
}
