// Vercel serverless function for API routes
// All server logic is now in the api/ folder for Vercel deployment
import "dotenv/config";
import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes.js";

const app = express();

app.use(express.json({
  verify: (req: any, _res, buf) => {
    req.rawBody = buf;
  }
}));
app.use(express.urlencoded({ extended: false }));

// Initialize routes
let isInitialized = false;
async function initializeApp() {
  if (isInitialized) return;

  await registerRoutes(app);

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    console.error("Error:", err);
    res.status(status).json({ message });
  });

  isInitialized = true;
}

// Export handler for Vercel
export default async (req: any, res: any) => {
  await initializeApp();
  return app(req, res);
};
