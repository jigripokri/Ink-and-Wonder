import BlogPost from "../BlogPost";

const timestamp = new Date("2025-10-28T08:00:00Z");

const mockPost = {
  id: 1,
  title: "The Quiet Wisdom of Morning Coffee",
  content: `There's something sacred about the first cup of coffee in the morning. It's not just the warmth or the caffeine—it's the moment of pause before the day begins. In that quiet space, I've found some of life's most important lessons simply waiting to be noticed.

I remember my grandmother's kitchen, where the coffee pot was always on. She'd sit at the small wooden table by the window, hands wrapped around her mug, watching the world wake up. "This is my thinking time," she'd say. I didn't understand it then, but now I do.

Life moves so fast now. Everyone rushing from one thing to the next, checking phones, making lists, planning the next move. But that morning coffee ritual? It's a rebellion against the rush. It's permission to just be, even if only for ten minutes.

The best conversations I've had were over coffee. Not the hurried kind you grab on the way out, but the kind where you sit down, settle in, and really talk. My father and I solved the world's problems over Sunday morning coffee. We didn't actually solve anything, of course, but we connected.

These days, I make my coffee the same way my grandmother did. No fancy machines, just a simple pour-over. The ritual matters as much as the drink itself. The grinding, the measuring, the slow pour, the waiting. It's meditation disguised as a morning routine.`,
  date: "October 28, 2025",
  category: "Mindfulness",
  readTime: "4 min read",
  createdAt: timestamp,
  updatedAt: timestamp,
};

export default function BlogPostExample() {
  return (
    <BlogPost post={mockPost} onBack={() => console.log("Back clicked")} />
  );
}
