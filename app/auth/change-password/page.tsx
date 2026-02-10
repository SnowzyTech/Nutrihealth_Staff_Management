'use client';

import React from "react"

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { AlertCircle, CheckCircle2, Shield, Eye, EyeOff, Info } from 'lucide-react';

interface PasswordRequirement {
  label: string;
  met: boolean;
}

export default function ChangePasswordPage() {
  const router = useRouter();
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Password requirements check
  const requirements: PasswordRequirement[] = [
    { label: 'At least 8 characters', met: newPassword.length >= 8 },
    { label: 'One uppercase letter', met: /[A-Z]/.test(newPassword) },
    { label: 'One lowercase letter', met: /[a-z]/.test(newPassword) },
    { label: 'One number', met: /\d/.test(newPassword) },
    { label: 'One special character (!@#$%^&*)', met: /[!@#$%^&*(),.?":{}|<>]/.test(newPassword) },
  ];

  const metRequirements = requirements.filter(r => r.met).length;
  const allRequirementsMet = metRequirements === requirements.length;
  const passwordsMatch = newPassword === confirmPassword && confirmPassword.length > 0;

  // Calculate password strength
  const getPasswordStrength = () => {
    if (newPassword.length === 0) return { label: '', color: '', value: 0 };
    if (metRequirements <= 1) return { label: 'Weak', color: 'bg-red-500', value: 20 };
    if (metRequirements <= 2) return { label: 'Fair', color: 'bg-orange-500', value: 40 };
    if (metRequirements <= 3) return { label: 'Good', color: 'bg-yellow-500', value: 60 };
    if (metRequirements <= 4) return { label: 'Strong', color: 'bg-green-400', value: 80 };
    return { label: 'Very Strong', color: 'bg-green-600', value: 100 };
  };

  const strength = getPasswordStrength();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!allRequirementsMet) {
      setError('Please meet all password requirements');
      return;
    }

    if (!passwordsMatch) {
      setError('Passwords do not match');
      return;
    }

    setIsLoading(true);

    try {
      // Update the password and remove the requires_password_change flag
      const { error: updateError } = await supabase.auth.updateUser({
        password: newPassword,
        data: {
          requires_password_change: false,
        },
      });

      if (updateError) {
        setError(updateError.message);
        return;
      }

      // Redirect to dashboard after successful password change
      router.push('/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-slate-50 to-green-50 px-4 py-8">
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader className="space-y-4 text-center">
          <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
            <Shield className="h-8 w-8 text-blue-600" />
          </div>
          <div>
            <CardTitle className="text-2xl font-bold text-slate-900">Set Your New Password</CardTitle>
            <CardDescription className="mt-2">
              For your security, please create a new password to replace your temporary one.
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {/* New Password Field */}
            <div className="space-y-2">
              <Label htmlFor="newPassword">New Password</Label>
              <div className="relative">
                <Input
                  id="newPassword"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter your new password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  disabled={isLoading}
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {/* Password Strength Indicator */}
            {newPassword.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-600">Password Strength</span>
                  <span className={`font-medium ${
                    strength.value <= 40 ? 'text-red-600' : 
                    strength.value <= 60 ? 'text-yellow-600' : 'text-green-600'
                  }`}>
                    {strength.label}
                  </span>
                </div>
                <Progress value={strength.value} className="h-2" />
              </div>
            )}

            {/* Password Requirements Checklist */}
            <div className="space-y-2 p-4 bg-slate-50 rounded-lg border border-slate-200">
              <p className="text-sm font-medium text-slate-700 mb-3">Password Requirements:</p>
              {requirements.map((req, index) => (
                <div key={index} className="flex items-center gap-2 text-sm">
                  {req.met ? (
                    <CheckCircle2 className="h-4 w-4 text-green-600 flex-shrink-0" />
                  ) : (
                    <div className="h-4 w-4 rounded-full border-2 border-slate-300 flex-shrink-0" />
                  )}
                  <span className={req.met ? 'text-green-700' : 'text-slate-600'}>
                    {req.label}
                  </span>
                </div>
              ))}
            </div>

            {/* Confirm Password Field */}
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm New Password</Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  placeholder="Confirm your new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  disabled={isLoading}
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {confirmPassword.length > 0 && (
                <div className="flex items-center gap-2 text-sm mt-1">
                  {passwordsMatch ? (
                    <>
                      <CheckCircle2 className="h-4 w-4 text-green-600" />
                      <span className="text-green-700">Passwords match</span>
                    </>
                  ) : (
                    <>
                      <AlertCircle className="h-4 w-4 text-red-500" />
                      <span className="text-red-600">Passwords do not match</span>
                    </>
                  )}
                </div>
              )}
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              className="w-full"
              disabled={isLoading || !allRequirementsMet || !passwordsMatch}
            >
              {isLoading ? 'Updating Password...' : 'Set New Password'}
            </Button>

            {/* Security Tip */}
            <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
              <div className="flex items-start gap-2">
                <Info className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                <p className="text-xs text-blue-800">
                  <strong>Security Tip:</strong> Use a unique password that you don't use for other accounts. 
                  Consider using a password manager to generate and store secure passwords.
                </p>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
