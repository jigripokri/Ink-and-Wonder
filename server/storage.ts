import { getDb, withRetry } from "./db";
import { blogPosts, type InsertBlogPost, type BlogPost } from "@shared/schema";
import { eq, desc } from "drizzle-orm";

export interface IStorage {
  getAllPosts(): Promise<BlogPost[]>;
  getPublicPosts(): Promise<BlogPost[]>;
  getPostById(id: number): Promise<BlogPost | undefined>;
  createPost(post: InsertBlogPost): Promise<BlogPost>;
  updatePost(id: number, post: Partial<InsertBlogPost & { isPrivate: boolean }>): Promise<BlogPost | undefined>;
  deletePost(id: number): Promise<boolean>;
  togglePrivate(id: number): Promise<BlogPost | undefined>;
}

export class DatabaseStorage implements IStorage {
  async getAllPosts(): Promise<BlogPost[]> {
    return withRetry(() => getDb().select().from(blogPosts).orderBy(desc(blogPosts.createdAt)));
  }

  async getPublicPosts(): Promise<BlogPost[]> {
    return withRetry(() => getDb().select().from(blogPosts).where(eq(blogPosts.isPrivate, false)).orderBy(desc(blogPosts.createdAt)));
  }

  async getPostById(id: number): Promise<BlogPost | undefined> {
    return withRetry(async () => {
      const results = await getDb().select().from(blogPosts).where(eq(blogPosts.id, id));
      return results[0];
    });
  }

  async createPost(post: InsertBlogPost): Promise<BlogPost> {
    return withRetry(async () => {
      const postData = {
        title: post.title || '',
        content: post.content,
        excerpt: post.excerpt || '',
        category: post.category || '',
        readTime: post.readTime || null,
        date: post.date || null,
      };
      const results = await getDb().insert(blogPosts).values(postData).returning();
      return results[0];
    });
  }

  async updatePost(id: number, post: Partial<InsertBlogPost>): Promise<BlogPost | undefined> {
    return withRetry(async () => {
      const results = await getDb()
        .update(blogPosts)
        .set({ ...post, updatedAt: new Date() })
        .where(eq(blogPosts.id, id))
        .returning();
      return results[0];
    });
  }

  async deletePost(id: number): Promise<boolean> {
    return withRetry(async () => {
      const results = await getDb().delete(blogPosts).where(eq(blogPosts.id, id)).returning();
      return results.length > 0;
    });
  }

  async togglePrivate(id: number): Promise<BlogPost | undefined> {
    return withRetry(async () => {
      const post = await this.getPostById(id);
      if (!post) return undefined;
      const results = await getDb()
        .update(blogPosts)
        .set({ isPrivate: !post.isPrivate, updatedAt: new Date() })
        .where(eq(blogPosts.id, id))
        .returning();
      return results[0];
    });
  }
}

export const storage = new DatabaseStorage();
