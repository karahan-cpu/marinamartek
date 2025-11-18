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
  const { data: dbUser, isLoading: dbUserLoading, error: dbUserError } = useQuery<DbUser | null>({
    queryKey: ["/api/auth/user"],
    queryFn: getQueryFn({ on401: "returnNull" }),
    retry: false,
    enabled: !!supabaseUser,
    staleTime: 0, // Always refetch when enabled
    gcTime: 0, // Don't cache
  });

  useEffect(() => {
    let mounted = true;

    // Process OAuth callback from URL hash
    const processOAuthCallback = async () => {
      try {
        // Check if we have hash fragments (OAuth callback)
        if (window.location.hash) {
          console.log('Processing OAuth callback hash:', window.location.hash.substring(0, 50) + '...');
        }

        // Get session (this will extract tokens from hash if present)
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.error('Session error:', sessionError);
        }

        if (mounted) {
          setSupabaseUser(session?.user ?? null);
          setIsLoading(false);
        }

        // Clean up URL hash after processing
        if (window.location.hash && session) {
          window.history.replaceState({}, '', window.location.pathname + window.location.search);
        }
      } catch (error) {
        console.error('Error processing session:', error);
        if (mounted) {
          setIsLoading(false);
        }
      }
    };

    // Initial session check
    processOAuthCallback();

    // Listen for auth state changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state changed:', event, session?.user?.email || 'no user');
      
      if (mounted) {
        setSupabaseUser(session?.user ?? null);
        
        // If we just signed in, clean up URL
        if (event === 'SIGNED_IN' && session) {
          if (window.location.hash.includes('access_token')) {
            window.history.replaceState({}, '', window.location.pathname + window.location.search);
          }
        }
        
        // Only set loading to false after we've processed the initial session
        if (event !== 'INITIAL_SESSION') {
          setIsLoading(false);
        }
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  // Log errors for debugging
  useEffect(() => {
    if (dbUserError && supabaseUser) {
      console.error('Error fetching user from API:', dbUserError);
    }
  }, [dbUserError, supabaseUser]);

  // Don't wait for dbUser if we have supabaseUser - allow user to proceed
  // The dbUser will load in the background
  const finalIsLoading = isLoading || (!!supabaseUser && dbUserLoading && !dbUserError);

  return {
    user: dbUser,
    supabaseUser,
    isLoading: finalIsLoading,
    isAuthenticated: !!supabaseUser,
  };
}
