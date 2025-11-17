// Supabase Auth integration
import type { Express, RequestHandler } from "express";
import type { Request, Response } from "express";
import { supabaseAdmin, supabase } from "./supabase";
import { storage } from "./storage";

// Middleware to extract Supabase session from Authorization header or cookies
export async function getSupabaseUser(req: Request) {
  try {
    // Try to get token from Authorization header
    const authHeader = req.headers.authorization;
    let token: string | null = null;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7);
    } else {
      // Try to get from cookies (if using cookie-based auth)
      const cookies = req.headers.cookie;
      if (cookies) {
        // Supabase stores tokens in cookies with pattern: sb-<project-ref>-auth-token
        const cookieMatch = cookies.match(/sb-[a-z0-9-]+-auth-token=([^;]+)/);
        if (cookieMatch) {
          try {
            const cookieValue = decodeURIComponent(cookieMatch[1]);
            // Cookie might be JSON with access_token
            const parsed = JSON.parse(cookieValue);
            token = parsed.access_token || cookieValue;
          } catch {
            token = decodeURIComponent(cookieMatch[1]);
          }
        }
      }
    }

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
  // Login route - redirects to Supabase OAuth or shows login options
  app.get("/api/login", async (req, res) => {
    try {
      const provider = (req.query.provider as string) || 'google'; // Default to Google
      const hostname = req.get('host') || req.hostname || 'localhost';
      const protocol = req.get('x-forwarded-proto') || req.protocol || 'https';
      
      // For OAuth providers
      if (provider && provider !== 'email') {
        const redirectTo = `${protocol}://${hostname}/api/callback`;

        const { data, error } = await supabase.auth.signInWithOAuth({
          provider: provider as any,
          options: {
            redirectTo,
          },
        });

        if (error) {
          console.error("Login error:", error);
          return res.redirect("/?error=login_failed");
        }

        if (data.url) {
          return res.redirect(data.url);
        }

        return res.redirect("/?error=login_failed");
      }
      
      // If no provider specified or email, redirect to home (frontend will handle email/password)
      res.redirect("/");
    } catch (error) {
      console.error("Login error:", error);
      res.redirect("/?error=login_failed");
    }
  });

  // Callback route - handles OAuth callback
  app.get("/api/callback", async (req, res) => {
    try {
      const { code, error: oauthError } = req.query;

      if (oauthError) {
        console.error("OAuth error:", oauthError);
        return res.redirect("/?error=auth_failed");
      }

      if (!code || typeof code !== 'string') {
        // Check if this is a direct OAuth redirect (Supabase handles it client-side)
        // In that case, just redirect to home and let frontend handle it
        return res.redirect("/");
      }

      // Exchange code for session
      const { data, error } = await supabase.auth.exchangeCodeForSession(code);

      if (error || !data.session) {
        console.error("Callback error:", error);
        return res.redirect("/?error=auth_failed");
      }

      // Get user and create/update in database
      const user = data.user;
      if (user) {
        await storage.upsertUser({
          id: user.id,
          email: user.email || undefined,
          firstName: user.user_metadata?.first_name || user.user_metadata?.full_name?.split(' ')[0],
          lastName: user.user_metadata?.last_name || user.user_metadata?.full_name?.split(' ').slice(1).join(' '),
          profileImageUrl: user.user_metadata?.avatar_url || user.user_metadata?.picture,
        });
      }

      // Redirect to home with hash fragment for frontend to process
      // Supabase OAuth returns tokens in URL hash, so we redirect to let frontend handle it
      res.redirect("/");
    } catch (error) {
      console.error("Callback error:", error);
      res.redirect("/?error=callback_failed");
    }
  });

  // Logout route
  app.get("/api/logout", async (req, res) => {
    try {
      const user = await getSupabaseUser(req);
      if (user) {
        await supabase.auth.signOut();
      }
      res.redirect("/");
    } catch (error) {
      console.error("Logout error:", error);
      res.redirect("/");
    }
  });

  // Email/password login route
  app.post("/api/auth/login", async (req, res) => {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({ error: "Email and password are required" });
      }

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error || !data.session) {
        return res.status(401).json({ error: error?.message || "Invalid credentials" });
      }

      // Get or create user in database
      if (data.user) {
        await storage.upsertUser({
          id: data.user.id,
          email: data.user.email || undefined,
          firstName: data.user.user_metadata?.first_name,
          lastName: data.user.user_metadata?.last_name,
          profileImageUrl: data.user.user_metadata?.avatar_url,
        });
      }

      res.json({
        user: data.user,
        session: data.session,
      });
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({ error: "Login failed" });
    }
  });

  // Sign up route
  app.post("/api/auth/signup", async (req, res) => {
    try {
      const { email, password, firstName, lastName } = req.body;

      if (!email || !password) {
        return res.status(400).json({ error: "Email and password are required" });
      }

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            first_name: firstName,
            last_name: lastName,
          },
        },
      });

      if (error) {
        return res.status(400).json({ error: error.message });
      }

      if (data.user) {
        await storage.upsertUser({
          id: data.user.id,
          email: data.user.email || undefined,
          firstName: firstName,
          lastName: lastName,
        });
      }

      res.json({
        user: data.user,
        session: data.session,
      });
    } catch (error) {
      console.error("Signup error:", error);
      res.status(500).json({ error: "Signup failed" });
    }
  });
}

