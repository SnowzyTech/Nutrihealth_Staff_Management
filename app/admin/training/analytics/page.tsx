'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/lib/context/auth-context';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import {
  ArrowLeft, BarChart3, GraduationCap, Users, CheckCircle2,
  Clock, TrendingUp, Eye, RefreshCw,
} from 'lucide-react';
import Link from 'next/link';
import { getTrainingAnalytics } from '@/app/actions/training-admin';
import { toast } from 'sonner';

interface AnalyticsData {
  totalModules: number;
  totalAssignments: number;
  totalCompletions: number;
  inProgressCount: number;
  avgScore: number;
  avgWatchPercentage: number;
  completionRate: number;
  progress: Array<{
    id: string;
    user_id: string;
    module_id: string;
    status: string;
    score: number | null;
    completed_at: string | null;
    user: {
      first_name: string;
      last_name: string;
      email: string;
      department: string | null;
    } | null;
  }>;
  modules: Array<{
    id: string;
    title: string;
    youtube_video_id: string | null;
    category: string | null;
    is_mandatory: boolean;
  }>;
}

export default function AdminTrainingAnalyticsPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth/login');
      return;
    }
    if (user && user.role === 'admin') {
      fetchAnalytics();
    } else if (user && user.role !== 'admin') {
      router.push('/dashboard');
    }
  }, [user, loading, router]);

  const fetchAnalytics = async () => {
    try {
      const result = await getTrainingAnalytics();
      if (result.success && result.data) {
        setAnalytics(result.data);
      } else {
        toast.error(result.error || 'Failed to fetch analytics');
      }
    } catch {
      toast.error('Failed to fetch analytics');
    } finally {
      setIsLoading(false);
    }
  };

  if (loading || isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="flex flex-col items-center gap-3">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-slate-300 border-t-blue-600" />
          <p className="text-sm text-slate-500">Loading analytics...</p>
        </div>
      </div>
    );
  }

  if (!analytics) return null;

  const recentCompletions = analytics.progress
    .filter((p) => p.status === 'completed' && p.completed_at)
    .sort((a, b) => new Date(b.completed_at!).getTime() - new Date(a.completed_at!).getTime())
    .slice(0, 10);

  // Module completion counts
  const moduleCompletionCounts = analytics.modules.map((mod) => {
    const completions = analytics.progress.filter(
      (p) => p.module_id === mod.id && p.status === 'completed'
    ).length;
    const inProgress = analytics.progress.filter(
      (p) => p.module_id === mod.id && p.status === 'in_progress'
    ).length;
    return { ...mod, completions, inProgress };
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link href="/admin/training">
            <Button variant="outline" size="sm" className="bg-transparent border-slate-600 text-slate-300 hover:bg-slate-700">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-slate-50">Training Analytics</h1>
            <p className="text-slate-400 mt-1">Overview of staff training progress and engagement</p>
          </div>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={fetchAnalytics}
          className="bg-transparent self-start border-slate-600 text-slate-300 hover:bg-slate-700"
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-blue-950 to-blue-900 border-blue-800 shadow-xl">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-blue-300 uppercase tracking-wide">Modules</p>
                <p className="text-2xl font-bold text-white mt-1">{analytics.totalModules}</p>
              </div>
              <GraduationCap className="h-5 w-5 text-blue-300" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-green-950 to-green-900 border-green-800 shadow-xl">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-green-300 uppercase tracking-wide">Completions</p>
                <p className="text-2xl font-bold text-white mt-1">{analytics.totalCompletions}</p>
              </div>
              <CheckCircle2 className="h-5 w-5 text-green-300" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-amber-950 to-amber-900 border-amber-800 shadow-xl">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-amber-300 uppercase tracking-wide">In Progress</p>
                <p className="text-2xl font-bold text-white mt-1">{analytics.inProgressCount}</p>
              </div>
              <Clock className="h-5 w-5 text-amber-300" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-slate-800 to-slate-700 border-slate-600 shadow-xl">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-slate-300 uppercase tracking-wide">Assignments</p>
                <p className="text-2xl font-bold text-white mt-1">{analytics.totalAssignments}</p>
              </div>
              <Users className="h-5 w-5 text-slate-300" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-slate-700 bg-slate-800 shadow-xl">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-3">
              <TrendingUp className="h-5 w-5 text-green-400" />
              <p className="text-sm font-medium text-slate-300">Completion Rate</p>
            </div>
            <p className="text-3xl font-bold text-slate-50 mb-2">{analytics.completionRate}%</p>
            <Progress value={analytics.completionRate} className="h-2" />
          </CardContent>
        </Card>
        <Card className="border-slate-700 bg-slate-800 shadow-xl">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-3">
              <BarChart3 className="h-5 w-5 text-blue-400" />
              <p className="text-sm font-medium text-slate-300">Average Score</p>
            </div>
            <p className="text-3xl font-bold text-slate-50 mb-2">{analytics.avgScore}%</p>
            <Progress value={analytics.avgScore} className="h-2" />
          </CardContent>
        </Card>
        <Card className="border-slate-700 bg-slate-800 shadow-xl">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-3">
              <Eye className="h-5 w-5 text-rose-400" />
              <p className="text-sm font-medium text-slate-300">Avg Video Watched</p>
            </div>
            <p className="text-3xl font-bold text-slate-50 mb-2">{analytics.avgWatchPercentage}%</p>
            <Progress value={analytics.avgWatchPercentage} className="h-2" />
          </CardContent>
        </Card>
      </div>

      {/* Module Performance */}
      <Card className="border-slate-700 bg-slate-800 shadow-xl">
        <CardHeader>
          <CardTitle className="text-slate-50">Module Performance</CardTitle>
        </CardHeader>
        <CardContent>
          {moduleCompletionCounts.length === 0 ? (
            <p className="text-sm text-slate-400 text-center py-8">No module data available yet.</p>
          ) : (
            <div className="space-y-4">
              {moduleCompletionCounts.map((mod) => (
                <div key={mod.id} className="flex items-center gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="text-sm font-medium text-slate-50 truncate">{mod.title}</p>
                      {mod.is_mandatory && (
                        <span className="text-xs text-red-400 flex-shrink-0">Required</span>
                      )}
                      {mod.category && (
                        <span className="text-xs text-slate-500 flex-shrink-0">{mod.category}</span>
                      )}
                    </div>
                    <div className="flex items-center gap-4 text-xs text-slate-400">
                      <span className="text-green-400">{mod.completions} completed</span>
                      <span className="text-blue-400">{mod.inProgress} in progress</span>
                    </div>
                  </div>
                  <div className="w-32 flex-shrink-0">
                    <Progress
                      value={
                        (mod.completions + mod.inProgress) > 0
                          ? (mod.completions / (mod.completions + mod.inProgress)) * 100
                          : 0
                      }
                      className="h-2"
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recent Completions */}
      <Card className="border-slate-700 bg-slate-800 shadow-xl">
        <CardHeader>
          <CardTitle className="text-slate-50">Recent Completions</CardTitle>
        </CardHeader>
        <CardContent>
          {recentCompletions.length === 0 ? (
            <p className="text-sm text-slate-400 text-center py-8">No completions yet.</p>
          ) : (
            <div className="space-y-3">
              {recentCompletions.map((entry) => {
                const mod = analytics.modules.find((m) => m.id === entry.module_id);
                return (
                  <div key={entry.id} className="flex items-center justify-between py-2 border-b border-slate-700 last:border-0">
                    <div>
                      <p className="text-sm font-medium text-slate-50">
                        {entry.user ? `${entry.user.first_name} ${entry.user.last_name}` : 'Unknown'}
                      </p>
                      <p className="text-xs text-slate-400">{mod?.title || 'Unknown module'}</p>
                    </div>
                    <div className="text-right">
                      {entry.score != null && (
                        <p className="text-sm font-medium text-green-400">{entry.score}%</p>
                      )}
                      <p className="text-xs text-slate-500">
                        {entry.completed_at ? new Date(entry.completed_at).toLocaleDateString() : ''}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
