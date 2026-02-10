'use client';

import React from "react"

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Shield, AlertCircle, Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      // Use browser client to sign in - this persists the session in cookies
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) {
        setError(signInError.message);
        setIsLoading(false);
        return;
      }

      if (!data.user) {
        setError('Login failed. Please try again.');
        setIsLoading(false);
        return;
      }

      // Fetch user profile to check role and active status
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('id, email, first_name, last_name, role, is_active')
        .eq('id', data.user.id)
        .single();

      if (userError || !userData) {
        // Sign out since we can't verify the user
        await supabase.auth.signOut();
        setError('User profile not found. Please contact administrator.');
        setIsLoading(false);
        return;
      }

      if (!userData.is_active) {
        // Sign out inactive users
        await supabase.auth.signOut();
        setError('Your account has been deactivated. Please contact administrator.');
        setIsLoading(false);
        return;
      }

      // Redirect based on role - use window.location for full page reload to ensure cookies are sent
      const redirectTo = userData.role === 'admin' ? '/admin' : '/dashboard';
      window.location.href = redirectTo;
    } catch (err) {
      console.error('Login error:', err);
      setError('An unexpected error occurred. Please try again.');
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-white">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-blue-100 rounded-xl">
              <Shield className="h-8 w-8 text-blue-600" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold text-slate-900">Staff Portal</CardTitle>
          <CardDescription className="text-slate-600">
            Nutrihealth Consult - Sign in to your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <Alert variant="destructive" className="bg-red-50 border-red-200">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription className="text-red-700">{error}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="email" className="text-slate-700">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@nutrihealthconsult.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isLoading}
                className="bg-slate-50 border-slate-200"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-slate-700">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={isLoading}
                className="bg-slate-50 border-slate-200"
              />
            </div>

            <Button
              type="submit"
              className="w-full bg-slate-900 hover:bg-slate-800 text-white"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Signing in...
                </>
              ) : (
                'Sign In'
              )}
            </Button>

            <div className="text-center text-sm">
              <Link href="/auth/forgot-password" className="text-blue-600 hover:underline">
                Forgot password?
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}


