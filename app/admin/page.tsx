'use client';

import { Card, CardContent } from '@/components/ui/card';
import {
  Users,
  FileText,
  CheckCircle,
  GraduationCap,
  Clock,
  RefreshCw,
  ChevronRight,
  Settings,
} from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useEffect, useState } from 'react';
import { getAdminDashboardStats, getRecentActivities } from '@/app/actions/dashboard';

interface DashboardStats {
  totalStaff: number;
  pendingDocuments: number;
  onboardingRate: number;
  trainingModules: number;
  submissionRate: number;
  approvedDocuments: number;
  totalSubmitted: number;
}

interface Activity {
  id: string;
  type: 'audit' | 'submission' | 'hr_acknowledgment';
  action: string;
  description: string;
  timestamp: string;
  user_name?: string;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalStaff: 0,
    pendingDocuments: 0,
    onboardingRate: 0,
    trainingModules: 0,
    submissionRate: 0,
    approvedDocuments: 0,
    totalSubmitted: 0,
  });
  const [recentActivities, setRecentActivities] = useState<Activity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isActivitiesLoading, setIsActivitiesLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setIsLoading(true);
    setIsActivitiesLoading(true);
    try {
      const [statsResult, activitiesResult] = await Promise.all([
        getAdminDashboardStats(),
        getRecentActivities(10),
      ]);

      if (statsResult.success && statsResult.data) {
        setStats(statsResult.data);
      }

      if (activitiesResult.success && activitiesResult.data) {
        setRecentActivities(activitiesResult.data);
      }

      setLastUpdated(new Date());
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setIsLoading(false);
      setIsActivitiesLoading(false);
    }
  };

  const getTimeAgo = (timestamp: string) => {
    if (!timestamp) return 'unknown';
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'just now';
    if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  };

  const getActivityDotColor = (type: string) => {
    switch (type) {
      case 'submission':
        return 'bg-blue-500';
      case 'hr_acknowledgment':
        return 'bg-amber-500';
      case 'audit':
      default:
        return 'bg-slate-400';
    }
  };

  const getActivityBadge = (type: string) => {
    switch (type) {
      case 'submission':
        return (
          <Badge className="bg-blue-900/30 text-blue-400 border-blue-700 text-xs font-medium">
            Submission
          </Badge>
        );
      case 'hr_acknowledgment':
        return (
          <Badge className="bg-amber-900/30 text-amber-400 border-amber-700 text-xs font-medium">
            HR Record
          </Badge>
        );
      case 'audit':
      default:
        return (
          <Badge className="bg-slate-700 text-slate-300 border-slate-600 text-xs font-medium">
            System
          </Badge>
        );
    }
  };

  const formatLastUpdated = () => {
    if (!lastUpdated) return '';
    return lastUpdated.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const approvalRate =
    stats.totalSubmitted > 0
      ? Math.round((stats.approvedDocuments / stats.totalSubmitted) * 100)
      : 0;

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-50 tracking-tight">
            Admin Dashboard
          </h1>
          <p className="text-slate-400 mt-1">
            Overview of your platform statistics and recent activity
          </p>
        </div>
        <div className="flex items-center gap-3">
          {lastUpdated && (
            <span className="text-sm text-slate-500">
              Last updated: {formatLastUpdated()}
            </span>
          )}
          <Button
            onClick={fetchDashboardData}
            variant="outline"
            size="sm"
            className="gap-2 border-slate-700 text-slate-300 hover:bg-slate-800 bg-transparent"
            disabled={isLoading}
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="border-slate-700 bg-slate-800 shadow-xl">
              <CardContent className="p-6">
                <div className="animate-pulse">
                  <div className="flex items-center justify-between">
                    <div className="space-y-3 flex-1">
                      <div className="h-3 bg-slate-700 rounded w-24" />
                      <div className="h-8 bg-slate-700 rounded w-16" />
                      <div className="h-3 bg-slate-700 rounded w-20" />
                    </div>
                    <div className="h-12 w-12 bg-slate-700 rounded-full" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Total Staff - Blue */}
          <Card className="bg-gradient-to-br from-blue-950 to-blue-900 border-blue-800 shadow-xl shadow-blue-900/20 hover:shadow-2xl hover:shadow-blue-800/30 transition-all">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-blue-200 uppercase tracking-wide">
                    Total Staff
                  </p>
                  <p className="text-4xl font-bold text-white mt-2">
                    {stats.totalStaff}
                  </p>
                  <p className="text-sm text-blue-300 mt-1">Active members</p>
                </div>
                <div className="h-14 w-14 rounded-full bg-blue-800/50 flex items-center justify-center ring-4 ring-blue-900/50">
                  <Users className="h-7 w-7 text-blue-200" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Pending Documents - Amber */}
          <Card className="bg-gradient-to-br from-amber-950 to-amber-900 border-amber-800 shadow-xl shadow-amber-900/20 hover:shadow-2xl hover:shadow-amber-800/30 transition-all">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-amber-200 uppercase tracking-wide">
                    Pending Documents
                  </p>
                  <p className="text-4xl font-bold text-white mt-2">
                    {stats.pendingDocuments}
                  </p>
                  <p className="text-sm text-amber-300 mt-1">Awaiting review</p>
                </div>
                <div className="h-14 w-14 rounded-full bg-amber-800/50 flex items-center justify-center ring-4 ring-amber-900/50">
                  <FileText className="h-7 w-7 text-amber-200" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Approval Rate - Green */}
          <Card className="bg-gradient-to-br from-green-950 to-green-900 border-green-800 shadow-xl shadow-green-900/20 hover:shadow-2xl hover:shadow-green-800/30 transition-all">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-green-200 uppercase tracking-wide">
                    Approval Rate
                  </p>
                  <p className="text-4xl font-bold text-white mt-2">
                    {approvalRate}%
                  </p>
                  <p className="text-sm text-green-300 mt-1">
                    {stats.approvedDocuments}/{stats.totalSubmitted} approved
                  </p>
                </div>
                <div className="h-14 w-14 rounded-full bg-green-800/50 flex items-center justify-center ring-4 ring-green-900/50">
                  <CheckCircle className="h-7 w-7 text-green-200" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Training Modules - Purple */}
          <Card className="bg-gradient-to-br from-purple-950 to-purple-900 border-purple-800 shadow-xl shadow-purple-900/20 hover:shadow-2xl hover:shadow-purple-800/30 transition-all">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-purple-200 uppercase tracking-wide">
                    Training Modules
                  </p>
                  <p className="text-4xl font-bold text-white mt-2">
                    {stats.trainingModules}
                  </p>
                  <p className="text-sm text-purple-300 mt-1">Active courses</p>
                </div>
                <div className="h-14 w-14 rounded-full bg-purple-800/50 flex items-center justify-center ring-4 ring-purple-900/50">
                  <GraduationCap className="h-7 w-7 text-purple-200" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Two Column: Recent Activity + Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Recent Activity Feed */}
        <Card className="lg:col-span-3 border-slate-700 bg-slate-800 shadow-xl">
          <div className="p-6 border-b border-slate-700">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-slate-50">
                Recent Activity
              </h3>
              <Link href="/admin/submissions">
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-sm text-blue-400 hover:text-blue-300 hover:bg-slate-700"
                >
                  View All
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </Link>
            </div>
          </div>
          <CardContent className="p-0">
            {isActivitiesLoading ? (
              <div className="p-6 space-y-4">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="flex items-start gap-3 animate-pulse">
                    <div className="h-2 w-2 rounded-full bg-slate-200 mt-2" />
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-slate-200 rounded w-3/4" />
                      <div className="h-3 bg-slate-200 rounded w-1/2" />
                    </div>
                  </div>
                ))}
              </div>
            ) : recentActivities.length === 0 ? (
              <div className="py-16 text-center">
                <Clock className="h-12 w-12 text-slate-600 mx-auto mb-3" />
                <p className="text-sm font-medium text-slate-400">
                  No recent activity
                </p>
                <p className="text-xs text-slate-500 mt-1">
                  Activity will appear here as your team works
                </p>
              </div>
            ) : (
              <div className="max-h-[420px] overflow-y-auto">
                <div className="divide-y divide-slate-700">
                  {recentActivities.map((activity) => (
                    <div
                      key={activity.id}
                      className="flex items-start gap-3 px-6 py-4 hover:bg-slate-750 transition-colors duration-150"
                    >
                      {/* Timeline dot */}
                      <div
                        className={`h-2 w-2 rounded-full mt-2 flex-shrink-0 ${getActivityDotColor(activity.type)}`}
                      />

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-slate-50 leading-snug">
                          {activity.description}
                        </p>
                        <p className="text-xs text-slate-400 mt-1 flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {getTimeAgo(activity.timestamp)}
                        </p>
                      </div>

                      {/* Badge */}
                      <div className="flex-shrink-0">
                        {getActivityBadge(activity.type)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="border-slate-700 bg-slate-800 shadow-xl">
            <div className="p-6 border-b border-slate-700">
              <h3 className="text-lg font-semibold text-slate-50">
                Quick Actions
              </h3>
            </div>
            <CardContent className="p-4">
              <div className="grid grid-cols-1 gap-3">
                {/* Manage Staff */}
                <Link href="/admin/staff">
                  <div className="flex items-center gap-4 p-4 rounded-lg border border-slate-600 bg-slate-700 hover:border-blue-500 hover:shadow-lg hover:shadow-blue-600/20 transition-all duration-200 cursor-pointer group">
                    <div className="h-10 w-10 rounded-lg bg-blue-600/20 border border-blue-500/30 flex items-center justify-center group-hover:bg-blue-600/30 transition-all">
                      <Users className="h-5 w-5 text-blue-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-slate-50 text-sm">
                        Manage Staff
                      </p>
                      <p className="text-xs text-slate-400">
                        Create and manage accounts
                      </p>
                    </div>
                    <ChevronRight className="h-5 w-5 text-slate-400 group-hover:text-blue-400 group-hover:translate-x-1 transition-all duration-200" />
                  </div>
                </Link>

                {/* Review Documents */}
                <Link href="/admin/submissions">
                  <div className="flex items-center gap-4 p-4 rounded-lg border border-slate-600 bg-slate-700 hover:border-amber-500 hover:shadow-lg hover:shadow-amber-600/20 transition-all duration-200 cursor-pointer group">
                    <div className="h-10 w-10 rounded-lg bg-amber-600/20 border border-amber-500/30 flex items-center justify-center group-hover:bg-amber-600/30 transition-all">
                      <FileText className="h-5 w-5 text-amber-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-slate-50 text-sm">
                        Review Documents
                      </p>
                      <p className="text-xs text-slate-400">
                        Pending submissions and approvals
                      </p>
                    </div>
                    <ChevronRight className="h-5 w-5 text-slate-400 group-hover:text-amber-400 group-hover:translate-x-1 transition-all duration-200" />
                  </div>
                </Link>

                {/* Training Courses */}
                <Link href="/admin/training">
                  <div className="flex items-center gap-4 p-4 rounded-lg border border-slate-600 bg-slate-700 hover:border-purple-500 hover:shadow-lg hover:shadow-purple-600/20 transition-all duration-200 cursor-pointer group">
                    <div className="h-10 w-10 rounded-lg bg-purple-600/20 border border-purple-500/30 flex items-center justify-center group-hover:bg-purple-600/30 transition-all">
                      <GraduationCap className="h-5 w-5 text-purple-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-slate-50 text-sm">
                        Training Courses
                      </p>
                      <p className="text-xs text-slate-400">
                        Manage training modules
                      </p>
                    </div>
                    <ChevronRight className="h-5 w-5 text-slate-400 group-hover:text-purple-400 group-hover:translate-x-1 transition-all duration-200" />
                  </div>
                </Link>

                {/* System Settings */}
                <Link href="/admin/settings">
                  <div className="flex items-center gap-4 p-4 rounded-lg border border-slate-600 bg-slate-700 hover:border-slate-500 hover:shadow-lg hover:shadow-slate-600/20 transition-all duration-200 cursor-pointer group">
                    <div className="h-10 w-10 rounded-lg bg-slate-600/50 border border-slate-500 flex items-center justify-center group-hover:bg-slate-600/70 transition-all">
                      <Settings className="h-5 w-5 text-slate-300" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-slate-50 text-sm">
                        System Settings
                      </p>
                      <p className="text-xs text-slate-400">
                        Configure platform options
                      </p>
                    </div>
                    <ChevronRight className="h-5 w-5 text-slate-400 group-hover:text-slate-300 group-hover:translate-x-1 transition-all duration-200" />
                  </div>
                </Link>
              </div>
            </CardContent>
          </Card>

          {/* Summary Mini Card */}
          <Card className="border-slate-700 bg-slate-800 shadow-xl">
            <CardContent className="p-6">
              <h4 className="text-sm font-semibold text-slate-50 mb-4">
                Submission Overview
              </h4>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-400">Total Submitted</span>
                  <span className="text-sm font-semibold text-slate-50">
                    {stats.totalSubmitted}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-400">Approved</span>
                  <span className="text-sm font-semibold text-green-400">
                    {stats.approvedDocuments}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-400">Pending Review</span>
                  <span className="text-sm font-semibold text-amber-400">
                    {stats.pendingDocuments}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-400">Onboarding Rate</span>
                  <span className="text-sm font-semibold text-blue-400">
                    {stats.onboardingRate}%
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-400">Submission Rate</span>
                  <span className="text-sm font-semibold text-purple-400">
                    {stats.submissionRate}%
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
