'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { useAuth } from '@/lib/context/auth-context';
import { useRouter, useParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import {
  CheckCircle2, ArrowLeft, Clock, AlertCircle, Youtube,
  FileText, Tag, Signal, Loader2, BarChart3,
} from 'lucide-react';
import Link from 'next/link';
import { YouTubePlayer, VideoProgressBar } from '@/components/youtube-player';
import { saveVideoProgress, getVideoProgress, startTraining, completeTraining } from '@/app/actions/training';

interface TrainingModule {
  id: string;
  title: string;
  description: string;
  content: string;
  file_url: string | null;
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

interface TrainingProgressData {
  id: string;
  status: 'not_started' | 'in_progress' | 'completed' | 'expired';
  started_at: string | null;
  completed_at: string | null;
  expires_at: string | null;
  score: number | null;
  notes: string;
}

interface VideoWatchData {
  current_time_seconds: number;
  duration_seconds: number;
  watched_percentage: number;
}

export default function TrainingModulePage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const params = useParams();
  const moduleId = params.id as string;

  const [module, setModule] = useState<TrainingModule | null>(null);
  const [progress, setProgress] = useState<TrainingProgressData | null>(null);
  const [videoData, setVideoData] = useState<VideoWatchData | null>(null);
  const [score, setScore] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [videoCompleted, setVideoCompleted] = useState(false);
  const [currentVideoPct, setCurrentVideoPct] = useState(0);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth/login');
      return;
    }

    if (user && moduleId) {
      fetchData();
    }
  }, [user, loading, router, moduleId]);

  const fetchData = async () => {
    try {
      const [{ data: mod }, { data: prog }] = await Promise.all([
        supabase
          .from('training_modules')
          .select('*')
          .eq('id', moduleId)
          .single(),
        supabase
          .from('training_progress')
          .select('*')
          .eq('user_id', user?.id)
          .eq('module_id', moduleId)
          .single(),
      ]);

      setModule(mod);
      if (prog) {
        setProgress(prog);
        setScore(prog.score);
      }

      // Fetch video progress
      if (user && moduleId) {
        const vpResult = await getVideoProgress(user.id, moduleId);
        if (vpResult.success && vpResult.data) {
          setVideoData(vpResult.data);
          setCurrentVideoPct(vpResult.data.watched_percentage || 0);
        }
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleVideoProgressUpdate = useCallback((currentTime: number, duration: number, percentage: number) => {
    setCurrentVideoPct(percentage);

    // Debounce save: save every 5 seconds
    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    saveTimeoutRef.current = setTimeout(async () => {
      if (user) {
        await saveVideoProgress(user.id, moduleId, currentTime, duration, percentage);
      }
    }, 5000);
  }, [user, moduleId]);

  const handleVideoComplete = useCallback(async () => {
    setVideoCompleted(true);
    // Save 100% progress
    if (user) {
      const dur = videoData?.duration_seconds || 0;
      await saveVideoProgress(user.id, moduleId, dur, dur, 100);
    }
  }, [user, moduleId, videoData]);

  const handleStartModule = async () => {
    if (!user || !module) return;
    setIsSaving(true);
    try {
      const result = await startTraining(user.id, module.id);
      if (result.success) {
        await fetchData();
      }
    } catch (error) {
      console.error('Error starting module:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCompleteModule = async () => {
    if (!user || !module || score === null) return;
    setIsSaving(true);
    try {
      const result = await completeTraining(user.id, module.id, score);
      if (result.success) {
        await fetchData();
      }
    } catch (error) {
      console.error('Error completing module:', error);
    } finally {
      setIsSaving(false);
    }
  };

  // Clean up timeout on unmount
  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    };
  }, []);

  if (loading || isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="flex flex-col items-center gap-3">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-slate-300 border-t-blue-600" />
          <p className="text-sm text-slate-400">Loading module...</p>
        </div>
      </div>
    );
  }

  if (!module) {
    return (
      <div className="space-y-4">
        <Link
          href="/dashboard/training"
          className="text-blue-400 hover:text-blue-300 text-sm inline-flex items-center gap-1 cursor-pointer border p-2"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Training</span>
        </Link>
        <Card className="bg-slate-700 border-slate-600">
          <CardContent className="py-16 text-center">
            <p className="text-slate-300">Module not found</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const isCompleted = progress?.status === 'completed';
  const isStarted = progress?.status === 'in_progress';
  const hasYouTube = !!module.youtube_video_id;
  const canComplete = hasYouTube
    ? (videoCompleted || currentVideoPct >= 90)
    : true;

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Back button */}
      <Link
        href="/dashboard/training"
        className="text-blue-400 hover:text-blue-300 text-sm inline-flex items-center bg-orange-200 gap-1 cursor-pointer border p-2"
      >
        <ArrowLeft className="h-4 w-4" />
        <span>Back to Training</span>
      </Link>

      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-primary">{module.title}</h1>
          <p className="text-slate-600 mt-2">{module.description}</p>
          <div className="flex items-center gap-3 mt-3 flex-wrap">
            {module.duration_hours > 0 && (
              <div className="flex items-center gap-1 text-sm text-slate-400">
                <Clock className="h-4 w-4" />
                <span>{module.duration_hours} hours</span>
              </div>
            )}
            {module.is_mandatory && (
              <div className="flex items-center gap-1 text-sm text-red-400">
                <AlertCircle className="h-4 w-4" />
                <span>Required</span>
              </div>
            )}
            {module.category && (
              <Badge variant="outline" className="bg-slate-700 text-slate-300 border-slate-600">
                <Tag className="h-3 w-3 mr-1" />
                {module.category}
              </Badge>
            )}
            {module.difficulty && (
              <Badge variant="outline" className={`border-0 ${
                module.difficulty === 'beginner' ? 'bg-green-900/30 text-green-400' :
                module.difficulty === 'intermediate' ? 'bg-yellow-900/30 text-yellow-400' :
                'bg-red-900/30 text-red-400'
              }`}>
                {module.difficulty}
              </Badge>
            )}
            {module.expiry_months && (
              <span className="text-sm text-slate-500">Expires in {module.expiry_months} months</span>
            )}
          </div>
          {/* Tags */}
          {module.tags && module.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {module.tags.map((tag) => (
                <span key={tag} className="text-xs bg-slate-700 text-slate-300 px-2 py-0.5 rounded-full">
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>
        {isCompleted && (
          <div className="flex items-center gap-2 px-3 py-2 bg-green-900/30 border border-green-700/30 rounded-lg flex-shrink-0">
            <CheckCircle2 className="h-5 w-5 text-green-400" />
            <span className="text-green-300 font-medium text-sm">Completed</span>
          </div>
        )}
      </div>

      {/* YouTube Player */}
      {hasYouTube && (
        <Card className="bg-primary border-slate-700 shadow-xl overflow-hidden">
          <CardContent className="p-0">
            <YouTubePlayer
              videoId={module.youtube_video_id!}
              title={module.title}
              startTime={videoData?.current_time_seconds || 0}
              onProgressUpdate={handleVideoProgressUpdate}
              onComplete={handleVideoComplete}
            />
          </CardContent>
          <div className="px-4 py-3 border-t border-slate-700">
            <VideoProgressBar percentage={currentVideoPct} className="text-orange-2000" />
          </div>
        </Card>
      )}

      {/* Module Content */}
      {(module.content || module.file_url) && (
        <Card className="bg-slate-800 border-slate-700 shadow-xl">
          <CardHeader>
            <CardTitle className="text-slate-50">Module Content</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {module.file_url && (
              <div className="p-4 bg-slate-700 rounded-lg border border-slate-600">
                <p className="text-sm text-slate-300 mb-2">Download the training material:</p>
                <a
                  href={module.file_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-blue-400 hover:text-blue-300 font-medium text-sm"
                >
                  <FileText className="h-4 w-4" />
                  Open File
                </a>
              </div>
            )}
            {module.content && (
              <div className="prose prose-sm prose-invert max-w-none">
                <p className="text-slate-300 whitespace-pre-wrap">{module.content}</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Progress & Completion Section */}
      {!isCompleted ? (
        <Card className="bg-primary border-gray-300 shadow-xl">
          <CardHeader>
            <CardTitle className="text-slate-50">
              {!isStarted ? 'Start This Module' : 'Complete This Module'}
            </CardTitle>
            <CardDescription className="text-slate-400">
              {!isStarted
                ? 'Click the button below to begin this training module'
                : hasYouTube && !canComplete
                  ? 'Watch at least 90% of the video before completing this module'
                  : 'Enter your score to mark this module as complete'
              }
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {isStarted && (
              <>
                {/* Video completion status */}
                {hasYouTube && (
                  <div className={`p-3 rounded-lg border ${
                    canComplete
                      ? 'bg-green-900/20 border-green-700/30'
                      : 'bg-yellow-900/20 border-yellow-700/30'
                  }`}>
                    <div className="flex items-center gap-2">
                      <Youtube className={`h-4 w-4 ${canComplete ? 'text-green-400' : 'text-yellow-400'}`} />
                      <span className={`text-sm ${canComplete ? 'text-green-300' : 'text-yellow-300'}`}>
                        {canComplete
                          ? 'Video requirement met - you can complete this module'
                          : `Watch more of the video (${Math.round(currentVideoPct)}% / 90% required)`
                        }
                      </span>
                    </div>
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="score" className="text-slate-200">Your Score (%)</Label>
                  <Input
                    id="score"
                    type="number"
                    min="0"
                    max="100"
                    placeholder="Enter your score (0-100)"
                    value={score ?? ''}
                    onChange={(e) => setScore(e.target.value ? Number(e.target.value) : null)}
                    className="border-slate-600 bg-slate-700 text-slate-50"
                  />
                </div>
                {score !== null && (
                  <div className="space-y-2">
                    <Progress value={score} className="h-2" />
                    <p className="text-xs text-slate-400">{score}%</p>
                  </div>
                )}
              </>
            )}

            {!isStarted ? (
              <Button
                onClick={handleStartModule}
                disabled={isSaving}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Starting...
                  </>
                ) : (
                  'Start Module'
                )}
              </Button>
            ) : (
              <Button
                onClick={handleCompleteModule}
                disabled={isSaving || score === null || !canComplete}
                className="w-full bg-green-600 hover:bg-green-700 text-white disabled:opacity-50"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="mr-2 h-4 w-4" />
                    Mark as Complete
                  </>
                )}
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <Card className="bg-green-900/20 border-green-700/30 shadow-xl">
          <CardHeader>
            <CardTitle className="text-green-300 flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5" />
              Module Completed
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-green-200/80">
              Completed on {new Date(progress?.completed_at || '').toLocaleDateString()}
            </p>
            {progress?.score != null && (
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <BarChart3 className="h-4 w-4 text-green-400" />
                  <p className="text-sm font-medium text-slate-200">Your Score</p>
                </div>
                <Progress value={progress?.score || 0} className="h-2" />
                <p className="text-sm text-green-300 mt-1 font-medium">{progress?.score}%</p>
              </div>
            )}
            {progress?.expires_at && (
              <p className="text-sm text-slate-400">
                Certificate expires on {new Date(progress.expires_at).toLocaleDateString()}
              </p>
            )}
            <Link href="/dashboard/training">
              <Button variant="outline" className="bg-transparent border-green-700/50 text-green-300 hover:bg-green-900/30">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Training
              </Button>
            </Link>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
