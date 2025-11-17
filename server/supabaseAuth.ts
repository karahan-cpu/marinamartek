// Supabase Auth integration
import type { Express, RequestHandler } from "express";
import type { Request, Response } from "express";
import { supabaseAdmin } from "./supabase";
import { storage } from "./storage";

// Middleware to extract Supabase session from Authorization header
export async function getSupabaseUser(req: Request) {
  try {
    // Get token from Authorization header
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return null;
    }

    const token = authHeader.substring(7);
    
    if (!token) {
      return null;
    }

    // Verify token and get user using admin client
    const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);
    
    if (error || !user) {
      return null;
    }

    // Get or create user in our database
    const dbUser = await storage.getUser(user.id);
    if (!dbUser) {
      // Create user in database if doesn't exist
      await storage.upsertUser({
        id: user.id,
        email: user.email || undefined,
        firstName: user.user_metadata?.first_name || user.user_metadata?.full_name?.split(' ')[0],
        lastName: user.user_metadata?.last_name || user.user_metadata?.full_name?.split(' ').slice(1).join(' '),
        profileImageUrl: user.user_metadata?.avatar_url || user.user_metadata?.picture,
      });
    }

    return user;
  } catch (error) {
    console.error("Error getting Supabase user:", error);
    return null;
  }
}

// Authentication middleware
export const isAuthenticated: RequestHandler = async (req, res, next) => {
  const user = await getSupabaseUser(req);
  
  if (!user) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  // Attach user to request
  (req as any).user = user;
  next();
};

// Setup auth routes
export async function setupAuth(app: Express) {
  // Auth route - get logged in user (handled in routes.ts)
  // Logout route
  app.get("/api/logout", async (_req, res) => {
    // Logout is handled client-side, but we provide this for server-side cleanup if needed
    res.json({ message: "Logged out" });
  });

  // Email/password login route (optional - for future use)
  app.post("/api/auth/login", async (req, res) => {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({ error: "Email and password are required" });
      }

      // Note: This would require the supabase client with anon key
      // For now, email/password login should be handled client-side
      res.status(501).json({ error: "Email/password login not implemented on server. Use client-side login." });
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({ error: "Login failed" });
    }
  });
}
