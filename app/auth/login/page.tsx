'use client';

import React from "react"

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Shield, AlertCircle, Loader2, CheckCircle2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Check for success messages from redirects
  useEffect(() => {
    const message = searchParams.get('message');
    if (message === 'password_changed') {
      setSuccessMessage('Password changed successfully! Please log in with your new password.');
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');
    setIsLoading(true);

    try {
      // Trim email and password to avoid whitespace issues
      const trimmedEmail = email.trim().toLowerCase();
      const trimmedPassword = password;

      if (!trimmedEmail || !trimmedPassword) {
        setError('Please enter both email and password.');
        setIsLoading(false);
        return;
      }

      // Use browser client to sign in - this persists the session in cookies
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email: trimmedEmail,
        password: trimmedPassword,
      });

      if (signInError) {
        // Provide more user-friendly error messages
        if (signInError.message.includes('Invalid login credentials')) {
          setError('Invalid email or password. Please check your credentials and try again.');
        } else if (signInError.message.includes('Email not confirmed')) {
          setError('Your email has not been confirmed. Please contact administrator.');
        } else {
          setError(signInError.message);
        }
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

      // Check if user needs to change password (first login)
      const requiresPasswordChange = data.user.user_metadata?.requires_password_change;
      
      if (requiresPasswordChange) {
        // Redirect to change password page
        window.location.href = '/auth/change-password';
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
    <div className="min-h-screen bg-primary flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-white">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-blue-100 rounded-xl">
              <Shield className="h-8 w-8 text-purple-600" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold text-primary">Staff Portal</CardTitle>
          <CardDescription className="text-slate-600">
            Nutrihealth Consult - Sign in to your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {successMessage && (
              <Alert className="bg-green-50 border-green-200">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-700">{successMessage}</AlertDescription>
              </Alert>
            )}
            
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
              className="w-full bg-secondary cursor-pointer hover:bg-scoecondary/40 text-white"
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


