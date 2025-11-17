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

    // Listen for auth state changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      setSupabaseUser(session?.user ?? null);
      
      // Handle OAuth callback
      if (event === 'SIGNED_IN' && session) {
        // Session is automatically handled by Supabase
        // Clean up URL hash if present
        if (window.location.hash.includes('access_token')) {
          window.history.replaceState({}, '', window.location.pathname);
        }
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  return {
    user: dbUser,
    supabaseUser,
    isLoading: isLoading || dbUserLoading,
    isAuthenticated: !!supabaseUser,
  };
}
