'use client';

import React from "react"
import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/context/auth-context';
import { getUserProfile, updateUserProfile } from '@/app/actions/user';
import { changePasswordAction } from '@/app/actions/auth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { User, Lock, Loader2, Eye, EyeOff, CheckCircle, Mail, Briefcase, Building2, Hash } from 'lucide-react';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

export default function ProfilePage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [passwordError, setPasswordError] = useState('');
  const [profile, setProfile] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    department: '',
    position: '',
    employeeId: '',
  });

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth/login');
      return;
    }
    if (user) {
      loadProfile();
    }
  }, [user, authLoading, router]);

  const loadProfile = async () => {
    if (!user) return;
    const result = await getUserProfile(user.id);
    if (result.success && result.data) {
      setProfile({
        firstName: result.data.first_name || '',
        lastName: result.data.last_name || '',
        email: result.data.email || '',
        phone: result.data.phone || '',
        department: result.data.department || '',
        position: result.data.position || '',
        employeeId: result.data.employee_id || '',
      });
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError('');

    if (!passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword) {
      setPasswordError('All fields are required');
      return;
    }
    if (passwordData.newPassword.length < 8) {
      setPasswordError('New password must be at least 8 characters');
      return;
    }
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordError('New passwords do not match');
      return;
    }
    if (passwordData.currentPassword === passwordData.newPassword) {
      setPasswordError('New password must be different from current password');
      return;
    }

    setPasswordLoading(true);
    try {
      const result = await changePasswordAction({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
        confirmPassword: passwordData.confirmPassword,
      });
      if (result.success) {
        toast.success('Password changed successfully');
        setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      } else {
        setPasswordError(result.error || 'Failed to change password');
      }
    } catch (error) {
      setPasswordError('An unexpected error occurred');
    } finally {
      setPasswordLoading(false);
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
    try {
      const result = await updateUserProfile(user.id, {
        firstName: profile.firstName,
        lastName: profile.lastName,
        email: profile.email,
        phone: profile.phone,
        department: profile.department,
        position: profile.position,
      });
      if (result.success) {
        toast.success('Profile updated successfully');
      } else {
        toast.error(result.error || 'Failed to update profile');
      }
    } catch (error) {
      toast.error('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  if (authLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          <p className="text-sm text-slate-500">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl lg:text-3xl font-bold text-slate-50">My Profile</h1>
        <p className="text-slate-300 mt-1">Manage your account settings and preferences</p>
      </div>

      {/* Profile Header Card */}
      <Card className="bg-slate-700 border-slate-600 shadow-xl">
        <CardContent className="p-6 lg:p-8">
          <div className="flex flex-col sm:flex-row items-start gap-6">
            <Avatar className="h-20 w-20 flex-shrink-0">
              <AvatarFallback className="bg-blue-600/20 border border-blue-500/30 text-blue-400 text-2xl font-bold">
                {profile.firstName?.[0]}{profile.lastName?.[0]}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-slate-50">
                {profile.firstName} {profile.lastName}
              </h2>
              <div className="flex items-center gap-2 mt-2 flex-wrap">
                <Badge className="bg-blue-900/30 text-blue-400 border-blue-500/30 capitalize">{user?.role}</Badge>
                <Badge className="bg-green-900/30 text-green-400 border-green-500/30">Active</Badge>
              </div>
              <div className="mt-4 space-y-1.5 text-sm text-slate-300">
                <p className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-slate-500" />
                  {profile.email}
                </p>
                {profile.department && (
                  <p className="flex items-center gap-2">
                    <Building2 className="h-4 w-4 text-slate-500" />
                    {profile.department}
                  </p>
                )}
                {profile.position && (
                  <p className="flex items-center gap-2">
                    <Briefcase className="h-4 w-4 text-slate-500" />
                    {profile.position}
                  </p>
                )}
                {profile.employeeId && (
                  <p className="flex items-center gap-2">
                    <Hash className="h-4 w-4 text-slate-500" />
                    {profile.employeeId}
                  </p>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs defaultValue="personal" className="space-y-6">
        <TabsList className="bg-slate-700 border border-slate-600 p-1">
          <TabsTrigger value="personal" className="flex items-center gap-2 data-[state=active]:bg-slate-800 data-[state=active]:text-slate-50">
            <User className="h-4 w-4" />
            Personal Info
          </TabsTrigger>
          <TabsTrigger value="security" className="flex items-center gap-2 data-[state=active]:bg-slate-800 data-[state=active]:text-slate-50">
            <Lock className="h-4 w-4" />
            Change Password
          </TabsTrigger>
        </TabsList>

        {/* Personal Info Tab */}
        <TabsContent value="personal">
          <Card className="bg-slate-700 border-slate-600 shadow-xl">
            <CardHeader className="border-b border-slate-600">
              <CardTitle className="text-lg text-slate-50">Personal Information</CardTitle>
              <CardDescription className="text-slate-400">Update your personal details</CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <form onSubmit={handleUpdateProfile} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="firstName" className="text-sm font-medium text-slate-300">First Name</Label>
                    <Input
                      id="firstName"
                      value={profile.firstName}
                      onChange={(e) => setProfile({ ...profile, firstName: e.target.value })}
                      className="bg-slate-800 border-slate-600 text-slate-50"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName" className="text-sm font-medium text-slate-300">Last Name</Label>
                    <Input
                      id="lastName"
                      value={profile.lastName}
                      onChange={(e) => setProfile({ ...profile, lastName: e.target.value })}
                      className="bg-slate-800 border-slate-600 text-slate-50"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-sm font-medium text-slate-300">Email Address</Label>
                    <Input
                      id="email"
                      type="email"
                      value={profile.email}
                      onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                      className="bg-slate-800 border-slate-600 text-slate-50"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone" className="text-sm font-medium text-slate-300">Phone Number</Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={profile.phone}
                      onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                      className="bg-slate-800 border-slate-600 text-slate-50"
                    />
                  </div>
                </div>

                <div className="border-t border-slate-600 pt-6">
                  <p className="text-sm font-medium text-slate-400 uppercase tracking-wide mb-4">Employment Details</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="department" className="text-sm font-medium text-slate-300">Department</Label>
                      <Input id="department" value={profile.department} disabled className="bg-slate-800 border-slate-600 text-slate-400" />
                      <p className="text-xs text-slate-500">Contact admin to change</p>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="position" className="text-sm font-medium text-slate-300">Position</Label>
                      <Input id="position" value={profile.position} disabled className="bg-slate-800 border-slate-600 text-slate-400" />
                      <p className="text-xs text-slate-500">Contact admin to change</p>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-600">
                  <Button type="submit" disabled={loading} className="bg-blue-600 hover:bg-blue-700 text-white">
                    {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Save Changes
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Security Tab */}
        <TabsContent value="security">
          <Card className="bg-slate-700 border-slate-600 shadow-xl">
            <CardHeader className="border-b border-slate-600">
              <CardTitle className="text-lg text-slate-50">Change Password</CardTitle>
              <CardDescription className="text-slate-400">Update your password to keep your account secure</CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <form onSubmit={handleChangePassword} className="space-y-6 max-w-md">
                {passwordError && (
                  <div className="bg-red-900/20 text-red-300 p-3 rounded-lg text-sm border border-red-500/30">
                    {passwordError}
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="currentPassword" className="text-sm font-medium text-slate-300">Current Password</Label>
                  <div className="relative">
                    <Input
                      id="currentPassword"
                      type={showCurrentPassword ? 'text' : 'password'}
                      value={passwordData.currentPassword}
                      onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                      placeholder="Enter your current password"
                      className="bg-slate-800 border-slate-600 text-slate-50"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      {showCurrentPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="newPassword" className="text-sm font-medium text-slate-300">New Password</Label>
                  <div className="relative">
                    <Input
                      id="newPassword"
                      type={showNewPassword ? 'text' : 'password'}
                      value={passwordData.newPassword}
                      onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                      placeholder="Enter your new password"
                      className="bg-slate-800 border-slate-600 text-slate-50"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-400"
                    >
                      {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  <p className="text-xs text-slate-500">Password must be at least 8 characters</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword" className="text-sm font-medium text-slate-300">Confirm New Password</Label>
                  <div className="relative">
                    <Input
                      id="confirmPassword"
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={passwordData.confirmPassword}
                      onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                      placeholder="Confirm your new password"
                      className="bg-slate-800 border-slate-600 text-slate-50"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-400"
                    >
                      {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  {passwordData.confirmPassword && passwordData.newPassword === passwordData.confirmPassword && (
                    <p className="text-xs text-green-400 flex items-center gap-1">
                      <CheckCircle className="h-3 w-3" />
                      Passwords match
                    </p>
                  )}
                </div>

                <div className="pt-4 border-t border-slate-600">
                  <Button type="submit" disabled={passwordLoading} className="bg-blue-600 hover:bg-blue-700 text-white">
                    {passwordLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Change Password
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
