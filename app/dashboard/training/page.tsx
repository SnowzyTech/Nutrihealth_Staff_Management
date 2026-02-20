'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/context/auth-context';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  CheckCircle2, Clock, GraduationCap, ArrowRight, BookOpen,
  BarChart3, Youtube, Search, Signal, Tag, CalendarClock,
} from 'lucide-react';
import Link from 'next/link';

interface TrainingModule {
  id: string;
  title: string;
  description: string;
  duration_hours: number;
  is_mandatory: boolean;
  expiry_months: number | null;
  youtube_video_id: string | null;
  category: string | null;
  difficulty: string | null;
  tags: string[] | null;
  duration_minutes: number | null;
  created_at: string;
}

interface TrainingProgress {
  id: string;
  module_id: string;
  status: 'not_started' | 'in_progress' | 'completed' | 'expired';
  started_at: string | null;
  completed_at: string | null;
  expires_at: string | null;
  score: number | null;
}

interface VideoWatchProgress {
  module_id: string;
  watched_percentage: number;
}

export default function TrainingPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [modules, setModules] = useState<TrainingModule[]>([]);
  const [progress, setProgress] = useState<TrainingProgress[]>([]);
  const [watchProgress, setWatchProgress] = useState<VideoWatchProgress[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth/login');
      return;
    }
    if (user) {
      fetchTrainingData();
    }
  }, [user, loading, router]);

  const fetchTrainingData = async () => {
    try {
      const [modsResult, progResult, wpResult] = await Promise.all([
        supabase.from('training_modules').select('*').order('created_at', { ascending: false }),
        supabase.from('training_progress').select('*').eq('user_id', user?.id),
        supabase.from('video_watch_progress').select('module_id, watched_percentage').eq('user_id', user?.id),
      ]);

      console.log('[v0] training_modules result:', modsResult.data?.length, modsResult.error);
      console.log('[v0] training_progress result:', progResult.data?.length, progResult.error);
      console.log('[v0] video_watch_progress result:', wpResult.data?.length, wpResult.error);

      setModules(modsResult.data || []);
      setProgress(progResult.data || []);
      setWatchProgress(wpResult.data || []);
    } catch (error) {
      console.error('Error fetching training data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getModuleProgress = (moduleId: string) => {
    return progress.find((p) => p.module_id === moduleId);
  };

  const getVideoWatchPct = (moduleId: string) => {
    return watchProgress.find((w) => w.module_id === moduleId)?.watched_percentage || 0;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-900/30 text-green-400 border-green-500/30';
      case 'in_progress': return 'bg-blue-900/30 text-blue-400 border-blue-500/30';
      case 'expired': return 'bg-red-900/30 text-red-400 border-red-500/30';
      default: return 'bg-slate-700 text-slate-300 border-slate-600';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'not_started': return 'Not Started';
      case 'in_progress': return 'In Progress';
      case 'completed': return 'Completed';
      case 'expired': return 'Expired';
      default: return 'Unknown';
    }
  };

  const getDifficultyColor = (difficulty: string | null) => {
    switch (difficulty) {
      case 'beginner': return 'text-green-400';
      case 'intermediate': return 'text-yellow-400';
      case 'advanced': return 'text-red-400';
      default: return 'text-slate-400';
    }
  };

  if (loading || isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="flex flex-col items-center gap-3">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-slate-300 border-t-blue-600" />
          <p className="text-sm text-slate-500">Loading training modules...</p>
        </div>
      </div>
    );
  }

  const completedCount = progress.filter((p) => p.status === 'completed').length;
  const mandatoryModules = modules.filter((m) => m.is_mandatory);
  const mandatoryCompleted = progress.filter(
    (p) => p.status === 'completed' && mandatoryModules.some((m) => m.id === p.module_id)
  ).length;
  const inProgressCount = progress.filter((p) => p.status === 'in_progress').length;
  const categories = [...new Set(modules.map((m) => m.category).filter(Boolean))] as string[];

  const filteredModules = modules.filter((mod) => {
    const matchesSearch = mod.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      mod.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === 'all' || mod.category === filterCategory;
    const modProgress = getModuleProgress(mod.id);
    const status = modProgress?.status || 'not_started';
    const matchesStatus = filterStatus === 'all' || status === filterStatus;
    return matchesSearch && matchesCategory && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl lg:text-3xl font-bold text-[#43005F]">My Training</h1>
        <p className="text-gray-600 mt-1">Complete your required training modules and track your progress</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-white border-gray-200 shadow-xl">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-gray-600 uppercase tracking-wide">Total</p>
                <p className="text-2xl font-bold text-[#43005F] mt-1">{modules.length}</p>
              </div>
              <div className="h-10 w-10 rounded-full bg-[#FE871F]/20 border border-[#FE871F]/30 flex items-center justify-center">
                <GraduationCap className="h-5 w-5 text-[#FE871F]" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-white border-gray-200 shadow-xl">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-gray-600 uppercase tracking-wide">Completed</p>
                <p className="text-2xl font-bold text-green-600 mt-1">{completedCount}</p>
              </div>
              <div className="h-10 w-10 rounded-full bg-green-100 border border-green-300 flex items-center justify-center">
                <CheckCircle2 className="h-5 w-5 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-white border-gray-200 shadow-xl">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-gray-600 uppercase tracking-wide">In Progress</p>
                <p className="text-2xl font-bold text-[#FE871F] mt-1">{inProgressCount}</p>
              </div>
              <div className="h-10 w-10 rounded-full bg-[#FE871F]/20 border border-[#FE871F]/30 flex items-center justify-center">
                <Clock className="h-5 w-5 text-[#FE871F]" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-white border-gray-200 shadow-xl">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-gray-600 uppercase tracking-wide">Required</p>
                <p className="text-2xl font-bold text-[#43005F] mt-1">
                  <span className="text-green-600">{mandatoryCompleted}</span>
                  <span className="text-gray-500 text-lg">/{mandatoryModules.length}</span>
                </p>
              </div>
              <div className="h-10 w-10 rounded-full bg-red-100 border border-red-300 flex items-center justify-center">
                <BookOpen className="h-5 w-5 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Overall Progress */}
      {modules.length > 0 && (
        <Card className="bg-white border-gray-200 shadow-xl">
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-medium text-gray-600">Overall Progress</p>
              <p className="text-sm font-bold text-[#43005F]">
                {Math.round((completedCount / modules.length) * 100)}%
              </p>
            </div>
            <Progress value={(completedCount / modules.length) * 100} className="h-2" />
          </CardContent>
        </Card>
      )}

      {/* Search & Filter */}
      <Card className="bg-white border-gray-200 shadow-xl">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                type="text"
                placeholder="Search modules..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 border-gray-200 bg-gray-50 text-[#43005F] placeholder:text-gray-400"
              />
            </div>
            <Select value={filterCategory} onValueChange={setFilterCategory}>
              <SelectTrigger className="w-40 border-gray-200 bg-gray-50 text-[#43005F]">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map((cat) => (
                  <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-40 border-gray-200 bg-gray-50 text-[#43005F]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="not_started">Not Started</SelectItem>
                <SelectItem value="in_progress">In Progress</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Modules List */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-[#43005F]">
          Available Modules
          <span className="text-sm text-gray-600 font-normal ml-2">({filteredModules.length})</span>
        </h2>
        {filteredModules.length === 0 ? (
          <Card className="bg-white border-gray-200 shadow-xl">
            <CardContent className="py-16 text-center">
              <div className="h-12 w-12 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
                <GraduationCap className="h-6 w-6 text-gray-400" />
              </div>
              <p className="text-[#43005F] font-medium">No training modules found</p>
              <p className="text-gray-600 text-sm mt-1">Try adjusting your filters or check back later.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredModules.map((module) => {
              const modProgress = getModuleProgress(module.id);
              const status = modProgress?.status || 'not_started';
              const videoPct = getVideoWatchPct(module.id);

              return (
                <Card key={module.id} className="bg-primary border-gray-300 shadow-xl hover:shadow-2xl transition-shadow group overflow-hidden">
                  {/* YouTube Thumbnail */}
                  {module.youtube_video_id && (
                    <div className="relative">
                      <img
                        src={`https://img.youtube.com/vi/${module.youtube_video_id}/mqdefault.jpg`}
                        alt={module.title}
                        className="w-full h-40 object-cover"
                      />
                      <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <div className="h-12 w-12 rounded-full bg-red-600/90 flex items-center justify-center">
                          <Youtube className="h-6 w-6 text-white" />
                        </div>
                      </div>
                      {module.duration_minutes && (
                        <div className="absolute bottom-2 right-2 bg-black/80 text-white text-xs px-2 py-1 rounded">
                          {module.duration_minutes} min
                        </div>
                      )}
                      {/* Video progress overlay */}
                      {videoPct > 0 && (
                        <div className="absolute bottom-0 left-0 right-0 h-1 bg-black/30">
                          <div
                            className="h-full bg-blue-500"
                            style={{ width: `${videoPct}%` }}
                          />
                        </div>
                      )}
                    </div>
                  )}

                  <CardContent className="p-5">
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className="flex items-center gap-3 min-w-0">
                        {!module.youtube_video_id && (
                          <div className="h-10 w-10 rounded-lg bg-blue-600/20 border border-blue-500/30 flex items-center justify-center flex-shrink-0">
                            <GraduationCap className="h-5 w-5 text-blue-400" />
                          </div>
                        )}
                        <div className="min-w-0">
                          <h3 className="font-semibold text-slate-50 line-clamp-1">{module.title}</h3>
                          <div className="flex items-center gap-2 mt-1 flex-wrap">
                            <Badge className={`${getStatusColor(status)} border-0 text-xs`}>
                              {getStatusLabel(status)}
                            </Badge>
                            {module.is_mandatory && (
                              <Badge className="bg-red-900/30 text-red-400 border-red-500/30 text-xs">Required</Badge>
                            )}
                            {module.difficulty && (
                              <span className={`text-xs font-medium ${getDifficultyColor(module.difficulty)}`}>
                                {module.difficulty}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    <p className="text-sm text-slate-300 mb-3 line-clamp-2">{module.description}</p>

                    <div className="flex items-center gap-3 text-xs text-slate-400 mb-3 flex-wrap">
                      {module.duration_hours > 0 && (
                        <div className="flex items-center gap-1">
                          <Clock className="h-3.5 w-3.5" />
                          <span>{module.duration_hours}h</span>
                        </div>
                      )}
                      {module.category && (
                        <div className="flex items-center gap-1">
                          <Tag className="h-3.5 w-3.5" />
                          <span>{module.category}</span>
                        </div>
                      )}
                      {modProgress?.completed_at && (
                        <div className="flex items-center gap-1 text-green-400">
                          <CheckCircle2 className="h-3.5 w-3.5" />
                          <span>{new Date(modProgress.completed_at).toLocaleDateString()}</span>
                        </div>
                      )}
                      {modProgress?.score != null && (
                        <div className="flex items-center gap-1 text-blue-400 font-medium">
                          <BarChart3 className="h-3.5 w-3.5" />
                          <span>{modProgress.score}%</span>
                        </div>
                      )}
                    </div>

                    {/* Video watch progress bar */}
                    {module.youtube_video_id && videoPct > 0 && status !== 'completed' && (
                      <div className="mb-3">
                        <div className="flex justify-between text-xs text-slate-400 mb-1">
                          <span>Video watched</span>
                          <span>{Math.round(videoPct)}%</span>
                        </div>
                        <Progress value={videoPct} className="h-1.5" />
                      </div>
                    )}

                    <Link href={`/dashboard/training/${module.id}`}>
                      <Button className="w-full bg-secondary cursor-pointer hover:bg-secondary/90 text-white">
                        {status === 'not_started' && 'Start Module'}
                        {status === 'in_progress' && 'Continue Module'}
                        {status === 'completed' && 'Review Module'}
                        {status === 'expired' && 'Retake Module'}
                        <ArrowRight className="h-4 w-4 ml-2" />
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
