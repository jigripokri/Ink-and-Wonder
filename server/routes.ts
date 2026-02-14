import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { storage } from "./storage";
import { insertBlogPostSchema } from "@shared/schema";
import { enhanceWithAI, generateMetadata, generateAllMetadata } from "./ai";
import { z } from "zod";

function requireAuth(req: Request, res: Response, next: NextFunction) {
  if ((req as any).cookies?.writer_auth === "authenticated") {
    return next();
  }
  return res.status(401).json({ error: "Unauthorized" });
}

const serverDir = fileURLToPath(new URL(".", import.meta.url));

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function getBaseUrl(req: Request): string {
  const host = req.get("host") || "localhost:5000";
  const proto = req.get("x-forwarded-proto") || req.protocol;
  return `${proto}://${host}`;
}

async function injectOgTags(req: Request, res: Response, meta: {
  title: string;
  description: string;
  url: string;
  type: string;
  image: string;
  category?: string;
}) {
  const clientTemplate = path.resolve(serverDir, "..", "client", "index.html");
  let html = await fs.promises.readFile(clientTemplate, "utf-8");

  html = html.replace(/<title>.*?<\/title>/, `<title>${meta.title}</title>`);
  html = html.replace(
    /<meta name="description"[^>]*\/?>/,
    `<meta name="description" content="${meta.description}" />`
  );
  html = html.replace(
    /<meta property="og:type"[^>]*\/?>/,
    `<meta property="og:type" content="${meta.type}" />`
  );
  html = html.replace(
    /<meta property="og:title"[^>]*\/?>/,
    `<meta property="og:title" content="${meta.title}" />`
  );
  html = html.replace(
    /<meta property="og:description"[^>]*\/?>/,
    `<meta property="og:description" content="${meta.description}" />`
  );
  html = html.replace(
    /<meta property="og:image" content="[^"]*"/,
    `<meta property="og:image" content="${meta.image}"`
  );
  html = html.replace(
    /<meta name="twitter:title"[^>]*\/?>/,
    `<meta name="twitter:title" content="${meta.title}" />`
  );
  html = html.replace(
    /<meta name="twitter:description"[^>]*\/?>/,
    `<meta name="twitter:description" content="${meta.description}" />`
  );
  html = html.replace(
    /<meta name="twitter:image" content="[^"]*"/,
    `<meta name="twitter:image" content="${meta.image}"`
  );

  if (meta.type === "article") {
    const articleTags = `
    <meta property="og:url" content="${meta.url}" />
    <meta property="article:section" content="${meta.category || ""}" />`;
    html = html.replace("</head>", `${articleTags}\n  </head>`);
  } else {
    html = html.replace("</head>", `    <meta property="og:url" content="${meta.url}" />\n  </head>`);
  }

  res.status(200).set({ "Content-Type": "text/html" }).end(html);
}

export async function registerRoutes(app: Express): Promise<Server> {
  app.get("/", async (req, res, next) => {
    const viewId = req.query.view;
    const siteUrl = getBaseUrl(req);
    const ogImage = `${siteUrl}/og-image.png`;

    if (!viewId) {
      const userAgent = (req.get("user-agent") || "").toLowerCase();
      const isCrawler = /facebookexternalhit|whatsapp|telegrambot|twitterbot|linkedinbot|slackbot|discordbot|bot|crawler|spider/i.test(userAgent);
      if (!isCrawler) return next();

      try {
        await injectOgTags(req, res, {
          title: "A Grandmother's Journal",
          description: "A grandmother's reflections, memories, and little wisdoms — written down so her grandchildren can read them years from now.",
          url: siteUrl,
          type: "website",
          image: ogImage,
        });
      } catch (error) {
        console.error("Homepage OG injection error:", error);
        next();
      }
      return;
    }

    const id = parseInt(viewId as string);
    if (isNaN(id)) return next();

    try {
      const post = await storage.getPostById(id);
      if (!post) return next();

      const isAuthed = (req as any).cookies?.writer_auth === "authenticated";
      if (post.isPrivate && !isAuthed) return next();

      const title = escapeHtml(post.title);
      const excerpt = escapeHtml(post.excerpt);
      const category = escapeHtml(post.category);

      await injectOgTags(req, res, {
        title,
        description: excerpt,
        url: `${siteUrl}/?view=${post.id}`,
        type: "article",
        image: ogImage,
        category,
      });
    } catch (error) {
      console.error("OG tag injection error:", error);
      next();
    }
  });
  app.post("/api/auth/login", (req, res) => {
    const { password } = req.body;
    if (password === process.env.WRITER_PASSWORD) {
      res.cookie("writer_auth", "authenticated", {
        httpOnly: true,
        maxAge: 180 * 24 * 60 * 60 * 1000,
        path: "/",
        sameSite: "strict",
        secure: process.env.NODE_ENV === "production",
      });
      return res.json({ authenticated: true });
    }
    return res.status(401).json({ error: "Incorrect password" });
  });

  app.get("/api/auth/status", (req, res) => {
    const authenticated = (req as any).cookies?.writer_auth === "authenticated";
    return res.json({ authenticated });
  });

  app.post("/api/auth/logout", (_req, res) => {
    res.clearCookie("writer_auth", { path: "/" });
    return res.json({ authenticated: false });
  });

  app.get("/api/posts", async (req, res) => {
    try {
      const isAuthed = (req as any).cookies?.writer_auth === "authenticated";
      const posts = isAuthed ? await storage.getAllPosts() : await storage.getPublicPosts();
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

      const isAuthed = (req as any).cookies?.writer_auth === "authenticated";
      if (post.isPrivate && !isAuthed) {
        return res.status(404).json({ error: "Post not found" });
      }
      
      res.json(post);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch post" });
    }
  });

  app.post("/api/posts", requireAuth, async (req, res) => {
    try {
      console.log("[CREATE POST] Parsing request body...");
      const postData = insertBlogPostSchema.parse(req.body);
      console.log("[CREATE POST] Content length:", postData.content.length);
      
      const date = new Date().toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
      
      let title = "Untitled", category = "Reflections", excerpt = "", readTime = "1 min read";
      try {
        console.log("[CREATE POST] Generating metadata with AI...");
        const metadata = await generateAllMetadata(postData.content);
        title = metadata.title;
        category = metadata.category;
        excerpt = metadata.excerpt;
        readTime = metadata.readTime;
        console.log("[CREATE POST] Metadata generated:", { title, category, excerptLen: excerpt.length, readTime });
      } catch (metaErr) {
        console.error("[CREATE POST] Metadata generation failed, using fallbacks:", metaErr);
        const words = postData.content.split(/\s+/);
        title = postData.content.substring(0, 50).split(/[.!?\n]/)[0].trim() || "Untitled";
        excerpt = words.slice(0, 20).join(" ") + (words.length > 20 ? "..." : "");
        readTime = `${Math.max(1, Math.ceil(words.length / 200))} min read`;
      }
      
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
      
      console.log("[CREATE POST] Saving to database...", { 
        titleLen: finalData.title.length, 
        contentLen: finalData.content.length, 
        excerptLen: finalData.excerpt.length,
        category: finalData.category,
      });
      const post = await storage.createPost(finalData);
      console.log("[CREATE POST] Success! Post ID:", post.id);
      res.status(201).json(post);
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        console.error("[CREATE POST] Zod validation error:", JSON.stringify(error.errors));
        return res.status(400).json({ error: error.errors });
      }
      const msg = error?.message || "Unknown error";
      const code = error?.code || "N/A";
      const detail = error?.detail || "";
      console.error("[CREATE POST] FAILED:", { message: msg, code, detail, stack: error?.stack });
      res.status(500).json({ error: `${msg}${detail ? ' — ' + detail : ''}` });
    }
  });

  app.put("/api/posts/:id", requireAuth, async (req, res) => {
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

  app.delete("/api/posts/:id", requireAuth, async (req, res) => {
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

  app.patch("/api/posts/:id/privacy", requireAuth, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const post = await storage.togglePrivate(id);
      if (!post) {
        return res.status(404).json({ error: "Post not found" });
      }
      res.json(post);
    } catch (error) {
      console.error("Toggle privacy error:", error);
      res.status(500).json({ error: "Failed to toggle privacy" });
    }
  });

  app.post("/api/ai/enhance", requireAuth, async (req, res) => {
    try {
      const { text, action } = req.body;
      
      console.log("[AI ENHANCE REQUEST]", {
        textLength: text?.length,
        action,
      });
      
      if (!text || typeof text !== "string") {
        console.error("[AI ENHANCE] Text validation failed:", { text, typeof: typeof text });
        return res.status(400).json({ error: "Text is required" });
      }
      
      if (!action || typeof action !== "string") {
        return res.status(400).json({ error: "Action is required" });
      }
      
      const enhancedText = await enhanceWithAI(text, action);
      res.json({ enhancedText });
    } catch (error) {
      console.error("AI enhancement error:", error);
      res.status(500).json({ error: "Failed to enhance text" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
