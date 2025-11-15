// useAuth hook for Supabase Auth
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import type { User } from "@supabase/supabase-js";
import { useQuery } from "@tanstack/react-query";
import { getQueryFn } from "@/lib/queryClient";
import type { User as DbUser } from "@shared/schema";

export function useAuth() {
  const [supabaseUser, setSupabaseUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Get database user info
  const { data: dbUser, isLoading: dbUserLoading } = useQuery<DbUser | null>({
    queryKey: ["/api/auth/user"],
    queryFn: getQueryFn({ on401: "returnNull" }),
    retry: false,
    enabled: !!supabaseUser,
  });

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSupabaseUser(session?.user ?? null);
      setIsLoading(false);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSupabaseUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Handle OAuth callback - Supabase handles this automatically via URL hash
  useEffect(() => {
    // Check for OAuth callback in URL hash
    const hashParams = new URLSearchParams(window.location.hash.substring(1));
    const accessToken = hashParams.get("access_token");
    const refreshToken = hashParams.get("refresh_token");
    
    if (accessToken && refreshToken) {
      // Set session from OAuth callback
      supabase.auth.setSession({
        access_token: accessToken,
        refresh_token: refreshToken,
      }).then(() => {
        // Clean up URL
        window.history.replaceState({}, "", window.location.pathname);
      });
    } else {
      // Also check for token in query params (from server callback)
      const params = new URLSearchParams(window.location.search);
      const token = params.get("token");
      
      if (token) {
        // This is a fallback - ideally use the hash method above
        // For now, we'll need to get a proper session from the server
        window.history.replaceState({}, "", window.location.pathname);
      }
    }
  }, []);

  return {
    user: dbUser,
    supabaseUser,
    isLoading: isLoading || dbUserLoading,
    isAuthenticated: !!supabaseUser,
  };
}
