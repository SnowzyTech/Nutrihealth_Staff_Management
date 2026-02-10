'use client';

import { useAuth } from '@/lib/context/auth-context';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { FileText, GraduationCap, BookOpen, ChevronRight, FolderOpen, User, Briefcase, Building2 } from 'lucide-react';

export default function DashboardPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth/login');
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="flex flex-col items-center gap-3">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-slate-300 border-t-blue-600" />
          <p className="text-sm text-slate-500">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const modules = [
    {
      title: 'Onboarding',
      description: 'Complete your onboarding documents and tasks',
      icon: FileText,
      href: '/dashboard/onboarding',
      iconBg: 'bg-blue-600/20 border border-blue-500/30',
      iconColor: 'text-blue-400',
      hoverBorder: 'hover:border-blue-500/50 hover:shadow-blue-500/20',
    },
    {
      title: 'Training',
      description: 'Access and complete required training modules',
      icon: GraduationCap,
      href: '/dashboard/training',
      iconBg: 'bg-purple-600/20 border border-purple-500/30',
      iconColor: 'text-purple-400',
      hoverBorder: 'hover:border-purple-500/50 hover:shadow-purple-500/20',
    },
    {
      title: 'Handbook',
      description: 'Browse company handbook and policies',
      icon: BookOpen,
      href: '/dashboard/handbook',
      iconBg: 'bg-amber-600/20 border border-amber-500/30',
      iconColor: 'text-amber-400',
      hoverBorder: 'hover:border-amber-500/50 hover:shadow-amber-500/20',
    },
    {
      title: 'HR Records',
      description: 'View your HR records and documents',
      icon: FolderOpen,
      href: '/dashboard/hr-records',
      iconBg: 'bg-green-600/20 border border-green-500/30',
      iconColor: 'text-green-400',
      hoverBorder: 'hover:border-green-500/50 hover:shadow-green-500/20',
    },
  ];

  return (
    <div className="space-y-8">
      {/* Welcome header */}
      <div>
        <h1 className="text-2xl lg:text-3xl font-bold text-slate-50 text-balance">
          Welcome back, {user.first_name}!
        </h1>
        <p className="text-slate-300 mt-1">
          {"Here's your overview for today."}
        </p>
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-slate-700 border-slate-600 shadow-xl">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-400 uppercase tracking-wide">Role</p>
                <p className="text-lg font-bold text-slate-50 mt-1 capitalize">{user.role}</p>
              </div>
              <div className="h-10 w-10 rounded-full bg-blue-600/20 border border-blue-500/30 flex items-center justify-center">
                <User className="h-5 w-5 text-blue-400" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-slate-700 border-slate-600 shadow-xl">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-400 uppercase tracking-wide">Department</p>
                <p className="text-lg font-bold text-slate-50 mt-1">{user.department || 'Not set'}</p>
              </div>
              <div className="h-10 w-10 rounded-full bg-amber-600/20 border border-amber-500/30 flex items-center justify-center">
                <Building2 className="h-5 w-5 text-amber-400" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-slate-700 border-slate-600 shadow-xl">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-400 uppercase tracking-wide">Position</p>
                <p className="text-lg font-bold text-slate-50 mt-1">{user.position || 'Not set'}</p>
              </div>
              <div className="h-10 w-10 rounded-full bg-purple-600/20 border border-purple-500/30 flex items-center justify-center">
                <Briefcase className="h-5 w-5 text-purple-400" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-slate-700 border-slate-600 shadow-xl">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-400 uppercase tracking-wide">Status</p>
                <div className="mt-1">
                  <Badge className="bg-green-900/30 text-green-400 border-green-500/30">Active</Badge>
                </div>
              </div>
              <div className="h-10 w-10 rounded-full bg-green-600/20 border border-green-500/30 flex items-center justify-center">
                <div className="h-3 w-3 rounded-full bg-green-400" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Module Cards */}
      <div>
        <h2 className="text-lg font-semibold text-slate-50 mb-4">My Modules</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {modules.map((module) => {
            const Icon = module.icon;
            return (
              <Link key={module.href} href={module.href}>
                <Card className={`group bg-gradient-to-br from-slate-700 to-slate-800 border-slate-600 shadow-xl ${module.hoverBorder} hover:shadow-xl transition-all duration-200 cursor-pointer h-full`}>
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div className={`h-12 w-12 rounded-lg ${module.iconBg} flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-200`}>
                        <Icon className={`h-6 w-6 ${module.iconColor}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-slate-50 group-hover:text-slate-200">
                          {module.title}
                        </h3>
                        <p className="text-sm text-slate-300 mt-1 leading-relaxed">
                          {module.description}
                        </p>
                      </div>
                      <ChevronRight className="h-5 w-5 text-slate-400 group-hover:text-slate-200 group-hover:translate-x-1 transition-all flex-shrink-0 mt-1" />
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
