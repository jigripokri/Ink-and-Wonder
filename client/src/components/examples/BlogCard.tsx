import BlogCard from "../BlogCard";

const mockPost = {
  id: 1,
  title: "The Quiet Wisdom of Morning Coffee",
  excerpt: "There's something sacred about the first cup of coffee in the morning. It's not just the warmth or the caffeine—it's the moment of pause before the day begins.",
  date: "October 28, 2025",
  category: "Mindfulness",
  readTime: "4 min read",
};

export default function BlogCardExample() {
  return (
    <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-8 max-w-6xl">
      <BlogCard post={mockPost} index={0} onClick={() => console.log("Card 0 clicked")} />
      <BlogCard post={{ ...mockPost, id: 2 }} index={1} onClick={() => console.log("Card 1 clicked")} />
      <BlogCard post={{ ...mockPost, id: 3 }} index={2} onClick={() => console.log("Card 2 clicked")} />
      <BlogCard post={{ ...mockPost, id: 4 }} index={3} onClick={() => console.log("Card 3 clicked")} />
    </div>
  );
}
