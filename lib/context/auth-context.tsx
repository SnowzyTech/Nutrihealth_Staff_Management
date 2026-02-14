'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import type { AuthContextType, User } from '@/lib/types/auth';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Simple in-memory cache with 5-minute expiry
let userCache: { user: User | null; timestamp: number } | null = null;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchUser = async (useCache = true) => {
    // Check cache first
    if (useCache && userCache && Date.now() - userCache.timestamp < CACHE_DURATION) {
      setUser(userCache.user);
      setLoading(false);
      return;
    }

    try {
      const { data: { user: authUser } } = await supabase.auth.getUser();
      
      if (!authUser) {
        setUser(null);
        userCache = null;
        setLoading(false);
        return;
      }

      // Single DB call with all needed fields
      const { data: userData } = await supabase
        .from('users')
        .select('*')
        .eq('id', authUser.id)
        .single();
      
      if (userData) {
        setUser(userData);
        // Cache the user data
        userCache = { user: userData, timestamp: Date.now() };
      } else {
        setUser(null);
        userCache = null;
      }
    } catch (error) {
      console.error('Auth error:', error);
      setUser(null);
      userCache = null;
    } finally {
      setLoading(false);
    }
  };

  const refreshUser = async () => {
    userCache = null; // Invalidate cache
    await fetchUser(false);
  };

  useEffect(() => {
    fetchUser();

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) {
        setUser(null);
        userCache = null;
      } else {
        fetchUser(false); // Refresh on auth change
      }
    });

    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  const signUp = async (email: string, password: string, firstName: string, lastName: string) => {
    const { data: { user: authUser }, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
    });

    if (signUpError) throw signUpError;
    if (!authUser) throw new Error('Sign up failed');

    // Create user profile
    const { error: profileError } = await supabase
      .from('users')
      .insert({
        id: authUser.id,
        email,
        first_name: firstName,
        last_name: lastName,
        role: 'staff',
      });

    if (profileError) throw profileError;
  };

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    setUser(null);
    userCache = null; // Clear cache on logout
  };

  const resetPassword = async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/reset-password`,
    });

    if (error) throw error;
  };

  return (
    <AuthContext.Provider value={{ user, loading, signUp, signIn, signOut, resetPassword, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
