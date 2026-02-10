'use client';

import React from "react";
import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/context/auth-context';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  GraduationCap, Plus, Search, Loader2, Upload, FileText, Clock, BookOpen,
  RefreshCw, BarChart3, Youtube, Trash2, Users, CalendarClock, Tag, Signal,
} from 'lucide-react';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
  DialogFooter, DialogDescription,
} from '@/components/ui/dialog';
import Link from 'next/link';
import {
  createTrainingModule, getAllTrainingModules, deleteTrainingModule,
  assignTraining, getAllStaffForAssignment,
} from '@/app/actions/training-admin';
import { toast } from 'sonner';

interface TrainingModule {
  id: string;
  title: string;
  description: string;
  content: string;
  duration_hours: number;
  is_mandatory: boolean;
  expiry_months: number | null;
  file_url: string | null;
  youtube_video_id: string | null;
  category: string | null;
  difficulty: string | null;
  tags: string[] | null;
  duration_minutes: number | null;
  created_at: string;
}

interface StaffMember {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  department: string | null;
  role: string;
}

function extractYouTubeId(url: string): string {
  if (!url) return '';
  // Already a video ID (11 chars, no special chars)
  if (/^[a-zA-Z0-9_-]{11}$/.test(url)) return url;
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  return match && match[2].length === 11 ? match[2] : url;
}

export default function AdminTrainingPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [modules, setModules] = useState<TrainingModule[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isAssignDialogOpen, setIsAssignDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [formError, setFormError] = useState('');
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    content: '',
    duration_hours: '',
    is_mandatory: true,
    expiry_months: '',
    youtube_url: '',
    category: '',
    difficulty: 'beginner',
    tags: '',
    duration_minutes: '',
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  // Assignment state
  const [assignModuleId, setAssignModuleId] = useState<string | null>(null);
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [selectedStaff, setSelectedStaff] = useState<string[]>([]);
  const [assignmentType, setAssignmentType] = useState<'individual' | 'department'>('individual');
  const [assignDepartment, setAssignDepartment] = useState('');
  const [assignDeadline, setAssignDeadline] = useState('');
  const [assignMandatory, setAssignMandatory] = useState(true);
  const [assignNotes, setAssignNotes] = useState('');

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth/login');
      return;
    }

    if (user && user.role === 'admin') {
      fetchTrainingModules();
    } else if (user && user.role !== 'admin') {
      router.push('/dashboard');
    }
  }, [user, loading, router]);

  const fetchTrainingModules = async () => {
    try {
      const result = await getAllTrainingModules();
      if (result.success) {
        setModules(result.data || []);
      } else {
        toast.error(result.error || 'Failed to fetch training modules');
      }
    } catch {
      toast.error('Failed to fetch training modules');
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      content: '',
      duration_hours: '',
      is_mandatory: true,
      expiry_months: '',
      youtube_url: '',
      category: '',
      difficulty: 'beginner',
      tags: '',
      duration_minutes: '',
    });
    setSelectedFile(null);
    setFormError('');
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const allowedTypes = [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'video/mp4',
        'video/webm',
      ];
      if (!allowedTypes.includes(file.type)) {
        toast.error('Please upload a PDF, Word document, or video file');
        return;
      }
      if (file.size > 50 * 1024 * 1024) {
        toast.error('File size must be less than 50MB');
        return;
      }
      setSelectedFile(file);
    }
  };

  const uploadFile = async (file: File): Promise<string | null> => {
    setIsUploading(true);
    try {
      const uploadData = new FormData();
      uploadData.append('file', file);
      uploadData.append('folder', '/training');

      const response = await fetch('/api/uploads/documents', {
        method: 'POST',
        body: uploadData,
      });

      if (!response.ok) {
        throw new Error('Failed to upload file');
      }

      const data = await response.json();
      return data.url;
    } catch {
      toast.error('Failed to upload file');
      return null;
    } finally {
      setIsUploading(false);
    }
  };

  const handleAddModule = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    setIsSubmitting(true);

    try {
      if (!formData.title || !formData.description) {
        setFormError('Please fill in the title and description');
        setIsSubmitting(false);
        return;
      }

      let fileUrl: string | undefined;
      if (selectedFile) {
        const uploadedUrl = await uploadFile(selectedFile);
        if (!uploadedUrl) {
          setFormError('Failed to upload file');
          setIsSubmitting(false);
          return;
        }
        fileUrl = uploadedUrl;
      }

      const youtubeVideoId = formData.youtube_url
        ? extractYouTubeId(formData.youtube_url)
        : undefined;

      const tags = formData.tags
        ? formData.tags.split(',').map((t) => t.trim()).filter(Boolean)
        : undefined;

      const result = await createTrainingModule({
        title: formData.title,
        description: formData.description,
        content: formData.content,
        durationHours: parseFloat(formData.duration_hours) || 0,
        isMandatory: formData.is_mandatory,
        expiryMonths: formData.expiry_months ? parseInt(formData.expiry_months) : null,
        fileUrl,
        youtubeVideoId,
        category: formData.category || undefined,
        difficulty: formData.difficulty || undefined,
        tags,
        durationMinutes: formData.duration_minutes ? parseInt(formData.duration_minutes) : undefined,
      });

      if (!result.success) {
        setFormError(result.error || 'Failed to create training module');
        setIsSubmitting(false);
        return;
      }

      toast.success('Training module created successfully');
      setIsDialogOpen(false);
      resetForm();
      await fetchTrainingModules();
    } catch {
      setFormError('An unexpected error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (moduleId: string) => {
    setIsDeleting(moduleId);
    try {
      const result = await deleteTrainingModule(moduleId);
      if (result.success) {
        toast.success('Module deleted');
        setModules((prev) => prev.filter((m) => m.id !== moduleId));
      } else {
        toast.error(result.error || 'Failed to delete');
      }
    } catch {
      toast.error('Failed to delete module');
    } finally {
      setIsDeleting(null);
    }
  };

  const openAssignDialog = async (moduleId: string) => {
    setAssignModuleId(moduleId);
    setIsAssignDialogOpen(true);
    const result = await getAllStaffForAssignment();
    if (result.success) {
      setStaff(result.data || []);
    }
  };

  const handleAssign = async () => {
    if (!assignModuleId) return;
    setIsSubmitting(true);

    try {
      const result = await assignTraining({
        moduleId: assignModuleId,
        userIds: assignmentType === 'individual' ? selectedStaff : undefined,
        department: assignmentType === 'department' ? assignDepartment : undefined,
        assignmentType,
        deadline: assignDeadline || undefined,
        isMandatory: assignMandatory,
        notes: assignNotes || undefined,
      });

      if (result.success) {
        toast.success(result.message);
        setIsAssignDialogOpen(false);
        setSelectedStaff([]);
        setAssignDepartment('');
        setAssignDeadline('');
        setAssignNotes('');
      } else {
        toast.error(result.error || 'Failed to assign');
      }
    } catch {
      toast.error('Failed to assign training');
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleStaffSelection = (id: string) => {
    setSelectedStaff((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
    );
  };

  const categories = [...new Set(modules.map((m) => m.category).filter(Boolean))] as string[];
  const departments = [...new Set(staff.map((s) => s.department).filter(Boolean))] as string[];

  const filteredModules = modules.filter((mod) => {
    const matchesSearch = mod.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      mod.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === 'all' || mod.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

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

  if (user?.role !== 'admin') {
    return (
      <div className="flex items-center justify-center py-20">
        <p className="text-slate-600">Access denied. Admin only.</p>
      </div>
    );
  }

  const mandatoryCount = modules.filter((m) => m.is_mandatory).length;
  const youtubeCount = modules.filter((m) => m.youtube_video_id).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4">
        <div className="min-w-0">
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-slate-50 truncate">Training Management</h1>
          <p className="text-slate-400 mt-1 text-xs sm:text-sm">Create and manage YouTube-based training modules for staff</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link href="/admin/training/analytics">
            <Button variant="outline" size="sm" className="bg-transparent border-slate-600 text-slate-300 hover:bg-slate-800 hover:text-slate-50 text-xs sm:text-sm h-8 sm:h-9">
              <BarChart3 className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1.5" />
              Analytics
            </Button>
          </Link>
          <Link href="/admin/training/assignments">
            <Button variant="outline" size="sm" className="bg-transparent border-slate-600 text-slate-300 hover:bg-slate-800 hover:text-slate-50 text-xs sm:text-sm h-8 sm:h-9">
              <Users className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1.5" />
              Assignments
            </Button>
          </Link>
          <Dialog open={isDialogOpen} onOpenChange={(open) => {
            setIsDialogOpen(open);
            if (!open) resetForm();
          }}>
            <DialogTrigger asChild>
              <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm h-8 sm:h-9">
                <Plus className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1.5" />
                Create Module
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Create Training Module</DialogTitle>
                <DialogDescription>
                  Add a new training module with YouTube video support for staff.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleAddModule}>
                <div className="space-y-4 py-4">
                  {formError && (
                    <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm border border-red-200">
                      {formError}
                    </div>
                  )}
                  <div className="space-y-2">
                    <Label htmlFor="title">Title *</Label>
                    <Input
                      id="title"
                      placeholder="Module title"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="description">Description *</Label>
                    <Input
                      id="description"
                      placeholder="Brief description"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      required
                    />
                  </div>

                  {/* YouTube URL */}
                  <div className="space-y-2">
                    <Label htmlFor="youtube_url" className="flex items-center gap-2">
                      <Youtube className="h-4 w-4 text-red-500" />
                      YouTube Video URL or ID
                    </Label>
                    <Input
                      id="youtube_url"
                      placeholder="https://youtube.com/watch?v=... or video ID"
                      value={formData.youtube_url}
                      onChange={(e) => setFormData({ ...formData, youtube_url: e.target.value })}
                    />
                    {formData.youtube_url && extractYouTubeId(formData.youtube_url) && (
                      <div className="mt-2 rounded-lg overflow-hidden border border-slate-200">
                        <img
                          src={`https://img.youtube.com/vi/${extractYouTubeId(formData.youtube_url)}/mqdefault.jpg`}
                          alt="Video thumbnail"
                          className="w-full max-w-xs"
                        />
                      </div>
                    )}
                  </div>

                  {/* Category & Difficulty */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="category">Category</Label>
                      <Input
                        id="category"
                        placeholder="e.g., Safety, Compliance"
                        value={formData.category}
                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="difficulty">Difficulty</Label>
                      <Select
                        value={formData.difficulty}
                        onValueChange={(value) => setFormData({ ...formData, difficulty: value })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="beginner">Beginner</SelectItem>
                          <SelectItem value="intermediate">Intermediate</SelectItem>
                          <SelectItem value="advanced">Advanced</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Tags */}
                  <div className="space-y-2">
                    <Label htmlFor="tags">Tags (comma separated)</Label>
                    <Input
                      id="tags"
                      placeholder="nutrition, health, safety"
                      value={formData.tags}
                      onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                    />
                  </div>

                  {/* File upload */}
                  <div className="space-y-2">
                    <Label htmlFor="file">Upload Training Material (PDF, Word, or Video)</Label>
                    <div className="border-2 border-dashed border-slate-300 rounded-lg p-4 hover:border-slate-400 transition-colors">
                      <input
                        id="file"
                        type="file"
                        accept=".pdf,.doc,.docx,.mp4,.webm,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,video/mp4,video/webm"
                        onChange={handleFileChange}
                        className="hidden"
                      />
                      <label htmlFor="file" className="flex flex-col items-center cursor-pointer">
                        <Upload className="h-8 w-8 text-slate-400 mb-2" />
                        <span className="text-sm text-slate-600">
                          {selectedFile ? selectedFile.name : 'Click to upload PDF, Word, or video file'}
                        </span>
                        <span className="text-xs text-slate-400 mt-1">Max size: 50MB</span>
                      </label>
                      {selectedFile && (
                        <div className="mt-2 flex items-center justify-center">
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => setSelectedFile(null)}
                            className="text-red-600 hover:text-red-700"
                          >
                            Remove file
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="content">Content / Instructions (Optional)</Label>
                    <Textarea
                      id="content"
                      placeholder="Module instructions, notes, or additional content"
                      value={formData.content}
                      onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                      className="min-h-32"
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="duration">Duration (Hours)</Label>
                      <Input
                        id="duration"
                        type="number"
                        step="0.5"
                        min="0"
                        placeholder="2.5"
                        value={formData.duration_hours}
                        onChange={(e) => setFormData({ ...formData, duration_hours: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="duration_min">Video Duration (Min)</Label>
                      <Input
                        id="duration_min"
                        type="number"
                        min="0"
                        placeholder="45"
                        value={formData.duration_minutes}
                        onChange={(e) => setFormData({ ...formData, duration_minutes: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="expiry">Expiry (Months)</Label>
                      <Input
                        id="expiry"
                        type="number"
                        min="0"
                        placeholder="12"
                        value={formData.expiry_months}
                        onChange={(e) => setFormData({ ...formData, expiry_months: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="mandatory">Mandatory</Label>
                    <Select
                      value={formData.is_mandatory ? 'yes' : 'no'}
                      onValueChange={(value) => setFormData({ ...formData, is_mandatory: value === 'yes' })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="yes">Yes</SelectItem>
                        <SelectItem value="no">No</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <DialogFooter>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => { setIsDialogOpen(false); resetForm(); }}
                    disabled={isSubmitting}
                    className="bg-transparent"
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isSubmitting} className="bg-blue-600 hover:bg-blue-700 text-white">
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Creating...
                      </>
                    ) : (
                      'Create Module'
                    )}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <Card className="bg-gradient-to-br from-blue-950 to-blue-900 border-blue-800 shadow-xl shadow-blue-900/20">
          <CardContent className="p-3 sm:p-5">
            <div className="flex items-center justify-between">
              <div className="min-w-0">
                <p className="text-xs sm:text-sm font-medium text-blue-200 uppercase tracking-wide truncate">Total Modules</p>
                <p className="text-2xl sm:text-3xl font-bold text-white mt-1">{modules.length}</p>
              </div>
              <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-full bg-blue-800/50 flex items-center justify-center flex-shrink-0">
                <GraduationCap className="h-4 w-4 sm:h-5 sm:w-5 text-blue-200" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-red-950 to-red-900 border-red-800 shadow-xl shadow-red-900/20">
          <CardContent className="p-3 sm:p-5">
            <div className="flex items-center justify-between">
              <div className="min-w-0">
                <p className="text-xs sm:text-sm font-medium text-red-200 uppercase tracking-wide truncate">Mandatory</p>
                <p className="text-2xl sm:text-3xl font-bold text-white mt-1">{mandatoryCount}</p>
              </div>
              <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-full bg-red-800/50 flex items-center justify-center flex-shrink-0">
                <BookOpen className="h-4 w-4 sm:h-5 sm:w-5 text-red-200" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-rose-950 to-rose-900 border-rose-800 shadow-xl shadow-rose-900/20">
          <CardContent className="p-3 sm:p-5">
            <div className="flex items-center justify-between">
              <div className="min-w-0">
                <p className="text-xs sm:text-sm font-medium text-rose-200 uppercase tracking-wide truncate">YouTube Videos</p>
                <p className="text-2xl sm:text-3xl font-bold text-white mt-1">{youtubeCount}</p>
              </div>
              <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-full bg-rose-800/50 flex items-center justify-center flex-shrink-0">
                <Youtube className="h-4 w-4 sm:h-5 sm:w-5 text-rose-200" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-slate-800 to-slate-700 border-slate-600 shadow-xl">
          <CardContent className="p-3 sm:p-5">
            <div className="flex items-center justify-between">
              <div className="min-w-0">
                <p className="text-xs sm:text-sm font-medium text-slate-300 uppercase tracking-wide truncate">Categories</p>
                <p className="text-2xl sm:text-3xl font-bold text-white mt-1">{categories.length}</p>
              </div>
              <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-full bg-slate-600/50 flex items-center justify-center flex-shrink-0">
                <Tag className="h-4 w-4 sm:h-5 sm:w-5 text-slate-300" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search & Filter */}
      <Card className="border-slate-700 bg-slate-800 shadow-xl">
        <CardContent className="p-3 sm:p-6">
          <div className="flex flex-col gap-3 sm:gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
              <Input
                type="text"
                placeholder="Search modules..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 border-slate-600 bg-slate-700 text-slate-50 placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 text-sm"
              />
            </div>
            <div className="flex gap-2">
              <Select value={filterCategory} onValueChange={setFilterCategory}>
                <SelectTrigger className="flex-1 sm:w-48 sm:flex-none border-slate-600 bg-slate-700 text-slate-50 text-sm h-9">
                  <SelectValue placeholder="All categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map((cat) => (
                    <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button
                variant="outline"
                size="sm"
                onClick={fetchTrainingModules}
                className="bg-transparent border-slate-600 text-slate-300 hover:bg-slate-700 h-9 text-xs sm:text-sm"
              >
                <RefreshCw className="h-3.5 w-3.5 sm:mr-2" />
                <span className="hidden sm:inline">Refresh</span>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Modules Grid */}
      {filteredModules.length === 0 ? (
        <Card className="border-slate-700 bg-slate-800 shadow-xl">
          <CardContent className="py-16 text-center">
            <div className="h-12 w-12 rounded-full bg-slate-700 flex items-center justify-center mx-auto mb-4">
              <GraduationCap className="h-6 w-6 text-slate-500" />
            </div>
            <p className="text-slate-50 font-medium">No training modules found</p>
            <p className="text-slate-400 text-sm mt-1">Create your first training module to get started.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6">
          {filteredModules.map((mod) => (
            <Card key={mod.id} className="border-slate-700 bg-slate-800 shadow-xl hover:shadow-2xl hover:shadow-blue-900/20 transition-all group overflow-hidden">
              {/* YouTube Thumbnail */}
              {mod.youtube_video_id && (
                <div className="relative overflow-hidden">
                  <img
                    src={`https://img.youtube.com/vi/${mod.youtube_video_id}/mqdefault.jpg`}
                    alt={mod.title}
                    className="w-full h-32 sm:h-40 object-cover"
                  />
                  <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="h-12 w-12 rounded-full bg-red-600 flex items-center justify-center">
                      <Youtube className="h-6 w-6 text-white" />
                    </div>
                  </div>
                  {mod.duration_minutes && (
                    <div className="absolute bottom-2 right-2 bg-black/80 text-white text-xs px-2 py-1 rounded">
                      {mod.duration_minutes} min
                    </div>
                  )}
                </div>
              )}

              <CardHeader className="pb-3 p-3 sm:p-6 sm:pb-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
                    {mod.is_mandatory && (
                      <Badge className="bg-red-900/30 text-red-400 border-red-700">Required</Badge>
                    )}
                    {mod.difficulty && (
                      <Badge variant="outline" className={`border-0 ${
                        mod.difficulty === 'beginner' ? 'bg-green-900/30 text-green-400' :
                        mod.difficulty === 'intermediate' ? 'bg-yellow-900/30 text-yellow-400' :
                        'bg-red-900/30 text-red-400'
                      }`}>
                        {mod.difficulty}
                      </Badge>
                    )}
                    {mod.category && (
                      <Badge variant="outline" className="bg-slate-700 text-slate-300 border-slate-600">
                        {mod.category}
                      </Badge>
                    )}
                  </div>
                </div>
                <CardTitle className="flex items-center gap-2 mt-2 text-slate-50">
                  <div className={`h-8 w-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                    mod.youtube_video_id
                      ? 'bg-red-600/20 border border-red-500/30'
                      : 'bg-blue-600/20 border border-blue-500/30'
                  }`}>
                    {mod.youtube_video_id
                      ? <Youtube className="h-4 w-4 text-red-400" />
                      : <GraduationCap className="h-4 w-4 text-blue-400" />
                    }
                  </div>
                  <span className="text-base line-clamp-1">{mod.title}</span>
                </CardTitle>
                <CardDescription className="mt-1 line-clamp-2 text-slate-400">{mod.description}</CardDescription>
              </CardHeader>
              <CardContent className="pt-0 p-3 sm:p-6 sm:pt-0">
                <div className="flex items-center gap-4 text-sm text-slate-500 mb-3">
                  {mod.duration_hours > 0 && (
                    <div className="flex items-center gap-1">
                      <Clock className="h-3.5 w-3.5" />
                      <span>{mod.duration_hours}h</span>
                    </div>
                  )}
                  {mod.file_url && (
                    <div className="flex items-center gap-1">
                      <FileText className="h-3.5 w-3.5" />
                      <span>Material</span>
                    </div>
                  )}
                  {mod.expiry_months && (
                    <div className="flex items-center gap-1">
                      <CalendarClock className="h-3.5 w-3.5" />
                      <span>{mod.expiry_months}mo</span>
                    </div>
                  )}
                </div>

                {/* Tags */}
                {mod.tags && mod.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-3">
                    {mod.tags.slice(0, 3).map((tag) => (
                      <span key={tag} className="text-xs bg-slate-700 text-slate-300 px-2 py-0.5 rounded-full">
                        {tag}
                      </span>
                    ))}
                    {mod.tags.length > 3 && (
                      <span className="text-xs text-slate-500">+{mod.tags.length - 3} more</span>
                    )}
                  </div>
                )}

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 bg-transparent border-slate-600 text-slate-300 hover:bg-slate-700"
                    onClick={() => openAssignDialog(mod.id)}
                  >
                    <Users className="h-3.5 w-3.5 mr-1" />
                    Assign
                  </Button>
                  {mod.file_url && (
                    <Button variant="outline" size="sm" asChild className="bg-transparent border-slate-600 text-slate-300 hover:bg-slate-700">
                      <a href={mod.file_url} target="_blank" rel="noopener noreferrer">
                        <FileText className="h-3.5 w-3.5" />
                      </a>
                    </Button>
                  )}
                  <Button
                    variant="outline"
                    size="sm"
                    className="bg-transparent border-red-800 text-red-400 hover:bg-red-900/30"
                    onClick={() => handleDelete(mod.id)}
                    disabled={isDeleting === mod.id}
                  >
                    {isDeleting === mod.id
                      ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      : <Trash2 className="h-3.5 w-3.5" />
                    }
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Assignment Dialog */}
      <Dialog open={isAssignDialogOpen} onOpenChange={setIsAssignDialogOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Assign Training</DialogTitle>
            <DialogDescription>
              Assign this training module to individual staff or an entire department.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Assignment Type</Label>
              <Select
                value={assignmentType}
                onValueChange={(v) => setAssignmentType(v as 'individual' | 'department')}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="individual">Individual Staff</SelectItem>
                  <SelectItem value="department">Entire Department</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {assignmentType === 'individual' ? (
              <div className="space-y-2">
                <Label>Select Staff Members</Label>
                <div className="max-h-48 overflow-y-auto space-y-1 border border-slate-200 rounded-lg p-2">
                  {staff.map((s) => (
                    <label
                      key={s.id}
                      className={`flex items-center gap-3 p-2 rounded cursor-pointer hover:bg-slate-50 ${
                        selectedStaff.includes(s.id) ? 'bg-blue-50 border border-blue-200' : ''
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={selectedStaff.includes(s.id)}
                        onChange={() => toggleStaffSelection(s.id)}
                        className="rounded"
                      />
                      <div>
                        <p className="text-sm font-medium">{s.first_name} {s.last_name}</p>
                        <p className="text-xs text-slate-500">{s.email} {s.department ? `- ${s.department}` : ''}</p>
                      </div>
                    </label>
                  ))}
                  {staff.length === 0 && (
                    <p className="text-sm text-slate-500 text-center py-4">No staff found</p>
                  )}
                </div>
                {selectedStaff.length > 0 && (
                  <p className="text-xs text-slate-500">{selectedStaff.length} selected</p>
                )}
              </div>
            ) : (
              <div className="space-y-2">
                <Label>Department</Label>
                <Select value={assignDepartment} onValueChange={setAssignDepartment}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select department" />
                  </SelectTrigger>
                  <SelectContent>
                    {departments.map((dept) => (
                      <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="assign-deadline">Deadline (Optional)</Label>
              <Input
                id="assign-deadline"
                type="date"
                value={assignDeadline}
                onChange={(e) => setAssignDeadline(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label>Mandatory</Label>
              <Select
                value={assignMandatory ? 'yes' : 'no'}
                onValueChange={(v) => setAssignMandatory(v === 'yes')}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="yes">Yes</SelectItem>
                  <SelectItem value="no">No</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="assign-notes">Notes (Optional)</Label>
              <Textarea
                id="assign-notes"
                placeholder="Additional notes for the assignee"
                value={assignNotes}
                onChange={(e) => setAssignNotes(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsAssignDialogOpen(false)}
              className="bg-transparent"
            >
              Cancel
            </Button>
            <Button
              onClick={handleAssign}
              disabled={isSubmitting}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Assigning...
                </>
              ) : (
                'Assign Training'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
