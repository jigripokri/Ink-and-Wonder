import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage.js";
import { insertBlogPostSchema } from "./schema.js";
import { enhanceWithAI, generateMetadata, generateAllMetadata } from "./ai.js";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  app.get("/api/posts", async (req, res) => {
    try {
      const posts = await storage.getAllPosts();
      res.json(posts);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch posts" });
    }
  });

  app.get("/api/posts/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const post = await storage.getPostById(id);
      
      if (!post) {
        return res.status(404).json({ error: "Post not found" });
      }
      
      res.json(post);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch post" });
    }
  });

  app.post("/api/posts", async (req, res) => {
    try {
      const postData = insertBlogPostSchema.parse(req.body);
      
      const date = new Date().toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
      
      // Generate all metadata with AI
      const { title, category, excerpt, readTime } = await generateAllMetadata(postData.content);
      
      const finalData = {
        title: postData.title || title,
        category: postData.category || category,
        content: postData.content,
        excerpt: (postData.excerpt && postData.excerpt.trim().length >= 10) 
          ? postData.excerpt.trim()
          : excerpt,
        date,
        readTime,
      };
      
      const post = await storage.createPost(finalData);
      res.status(201).json(post);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      console.error("Create post error:", error);
      res.status(500).json({ error: "Failed to create post" });
    }
  });

  app.put("/api/posts/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const postData = insertBlogPostSchema.partial().parse(req.body);

      // If content is being updated, regenerate metadata
      if (postData.content) {
        const { title, category, excerpt, readTime } = await generateAllMetadata(postData.content);

        const finalData = {
          title: postData.title || title,
          category: postData.category || category,
          content: postData.content,
          excerpt: (postData.excerpt && postData.excerpt.trim().length >= 10)
            ? postData.excerpt.trim()
            : excerpt,
          readTime,
        };

        const post = await storage.updatePost(id, finalData);

        if (!post) {
          return res.status(404).json({ error: "Post not found" });
        }

        res.json(post);
      } else {
        // Just update whatever fields were provided
        const post = await storage.updatePost(id, postData);

        if (!post) {
          return res.status(404).json({ error: "Post not found" });
        }

        res.json(post);
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      console.error("Update post error:", error);
      res.status(500).json({ error: "Failed to update post" });
    }
  });

  app.delete("/api/posts/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deletePost(id);
      
      if (!success) {
        return res.status(404).json({ error: "Post not found" });
      }
      
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete post" });
    }
  });

  app.post("/api/ai/enhance", async (req, res) => {
    try {
      const { text, action, fullContent, selectedText, selectionStart, selectionEnd } = req.body;
      
      console.log("[AI ENHANCE REQUEST]", {
        textLength: text?.length,
        action,
        hasFullContent: !!fullContent,
        hasSelectedText: !!selectedText,
        selectionStart,
        selectionEnd,
      });
      
      if (!text || typeof text !== "string") {
        console.error("[AI ENHANCE] Text validation failed:", { text, typeof: typeof text });
        return res.status(400).json({ error: "Text is required" });
      }
      
      if (!action || typeof action !== "string") {
        return res.status(400).json({ error: "Action is required" });
      }
      
      const enhancedText = await enhanceWithAI(text, action, fullContent, selectedText, selectionStart, selectionEnd);
      res.json({ enhancedText });
    } catch (error) {
      console.error("AI enhancement error:", error);
      res.status(500).json({ error: "Failed to enhance text" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
