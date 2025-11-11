import { supabase } from "@/lib/supabaseClient";
import { useState, useEffect, useCallback } from "react";
import { User } from "@supabase/supabase-js";

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const getUser = useCallback(async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    return user;
  }, []);

  useEffect(() => {
    const fetchUser = async () => {
      const user = await getUser();
      setUser(user);
      setLoading(false);
    };
    fetchUser();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [getUser]);

  const login = useCallback(async (email: string) => {
    const callbackUrl = `${window.location.origin}/auth/callback`;
    const { data, error } = await supabase.auth.signInWithOtp({
      email: email,
      options: {
        emailRedirectTo: callbackUrl,
      },
    });
    if (error) {
      throw error;
    }
    return data;
  }, []);

  const logout = useCallback(async (): Promise<void> => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      throw error;
    }
    setUser(null);
  }, []);

  return {
    user: user,
    loading: loading,
    login: login,
    logout: logout,
  };
};

export default useAuth;
