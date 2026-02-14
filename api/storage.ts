import { db } from "./db.js";
import { blogPosts, type InsertBlogPost, type BlogPost } from "./schema.js";
import { eq, desc } from "drizzle-orm";

export interface IStorage {
  getAllPosts(): Promise<BlogPost[]>;
  getPostById(id: number): Promise<BlogPost | undefined>;
  createPost(post: InsertBlogPost): Promise<BlogPost>;
  updatePost(id: number, post: Partial<InsertBlogPost>): Promise<BlogPost | undefined>;
  deletePost(id: number): Promise<boolean>;
}

export class DatabaseStorage implements IStorage {
  async getAllPosts(): Promise<BlogPost[]> {
    return db.select().from(blogPosts).orderBy(desc(blogPosts.createdAt));
  }

  async getPostById(id: number): Promise<BlogPost | undefined> {
    const results = await db.select().from(blogPosts).where(eq(blogPosts.id, id));
    return results[0];
  }

  async createPost(post: InsertBlogPost): Promise<BlogPost> {
    const postData = {
      title: post.title || '',
      content: post.content,
      excerpt: post.excerpt || '',
      category: post.category || '',
      readTime: post.readTime || null,
      date: post.date || null,
    };
    const results = await db.insert(blogPosts).values(postData).returning();
    return results[0];
  }

  async updatePost(id: number, post: Partial<InsertBlogPost>): Promise<BlogPost | undefined> {
    const results = await db
      .update(blogPosts)
      .set({ ...post, updatedAt: new Date() })
      .where(eq(blogPosts.id, id))
      .returning();
    return results[0];
  }

  async deletePost(id: number): Promise<boolean> {
    const results = await db.delete(blogPosts).where(eq(blogPosts.id, id)).returning();
    return results.length > 0;
  }
}

export const storage = new DatabaseStorage();
