import type { VercelRequest, VercelResponse } from '@vercel/node';
import express, { type Express, type Request, Response, NextFunction } from 'express';
import { registerRoutes } from '../server/routes';
import { serveStatic } from '../server/vite';

// Extend Express Request type
declare module 'express-serve-static-core' {
  interface Request {
    rawBody?: unknown;
  }
}

let app: Express | null = null;

async function getApp(): Promise<Express> {
  if (app) {
    return app;
  }

  app = express();

  app.use(express.json({
    verify: (req, _res, buf) => {
      (req as any).rawBody = buf;
    }
  }));
  app.use(express.urlencoded({ extended: false }));

  app.use((req, res, next) => {
    const start = Date.now();
    const path = req.path;
    let capturedJsonResponse: Record<string, any> | undefined = undefined;

    const originalResJson = res.json;
    res.json = function (bodyJson, ...args) {
      capturedJsonResponse = bodyJson;
      return originalResJson.apply(res, [bodyJson, ...args]);
    };

    res.on("finish", () => {
      const duration = Date.now() - start;
      if (path.startsWith("/api")) {
        let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
        if (capturedJsonResponse) {
          logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
        }

        if (logLine.length > 80) {
          logLine = logLine.slice(0, 79) + "…";
        }

        console.log(logLine);
      }
    });

    next();
  });

  await registerRoutes(app);

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    res.status(status).json({ message });
  });

  // Only serve static files in production (not in Vercel serverless for non-API routes)
  // Vercel will handle static files via outputDirectory
  if (process.env.VERCEL) {
    // In Vercel, static files are served separately, but we still need to handle SPA routing
    app.use("*", (_req, res) => {
      // This should not be reached for API routes, but handle it gracefully
      res.status(404).json({ message: "Not found" });
    });
  } else {
    serveStatic(app);
  }

  return app;
}

export default async function handler(
  req: VercelRequest,
  res: VercelResponse,
) {
  const expressApp = await getApp();
  return expressApp(req, res);
}

