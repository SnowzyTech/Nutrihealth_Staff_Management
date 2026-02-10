'use client';

import React from "react"

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { resetPasswordAction } from '@/app/actions/auth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useUIStore } from '@/lib/stores/ui-store';
import { ArrowLeft, Loader2 } from 'lucide-react';

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const { addNotification } = useUIStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const result = await resetPasswordAction({ email });

      if (result.success) {
        addNotification('success', result.message || 'Password reset email sent!');
        setTimeout(() => {
          router.push('/auth/login');
        }, 2000);
      } else {
        addNotification('error', result.error || 'Failed to send reset email');
      }
    } catch (error) {
      addNotification('error', 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 px-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Reset Password</CardTitle>
          <CardDescription>
            Enter your email address and we'll send you a link to reset your password
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Send Reset Link
            </Button>
          </form>

          <div className="mt-6 flex items-center gap-2 text-sm">
            <Link href="/auth/login" className="flex items-center gap-2 text-blue-600 hover:text-blue-700">
              <ArrowLeft className="h-4 w-4" />
              Back to Login
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
