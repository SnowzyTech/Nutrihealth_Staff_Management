'use server';

import { createServerClient, createServerClientWithCookies } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export interface CreateTrainingModuleInput {
  title: string;
  description: string;
  content: string;
  durationHours: number;
  isMandatory: boolean;
  expiryMonths: number | null;
  fileUrl?: string;
  youtubeVideoId?: string;
  category?: string;
  difficulty?: string;
  prerequisiteId?: string;
  tags?: string[];
  durationMinutes?: number;
}

export interface AssignTrainingInput {
  moduleId: string;
  userIds?: string[];
  department?: string;
  assignmentType: 'individual' | 'department';
  deadline?: string;
  isMandatory: boolean;
  notes?: string;
}

async function verifyAdmin() {
  const supabaseWithCookies = await createServerClientWithCookies();
  const { data: { user: currentUser } } = await supabaseWithCookies.auth.getUser();

  if (!currentUser) {
    return { error: 'Unauthorized - Please log in', userId: null };
  }

  const supabase = createServerClient();
  const { data: currentUserData } = await supabase
    .from('users')
    .select('role')
    .eq('id', currentUser.id)
    .single();

  if (currentUserData?.role !== 'admin') {
    return { error: 'Only admins can perform this action', userId: null };
  }

  return { error: null, userId: currentUser.id };
}

export async function createTrainingModule(input: CreateTrainingModuleInput) {
  try {
    const { error: authError, userId } = await verifyAdmin();
    if (authError || !userId) {
      return { success: false, error: authError || 'Unauthorized' };
    }

    const supabase = createServerClient();

    const { data, error } = await supabase
      .from('training_modules')
      .insert({
        title: input.title,
        description: input.description,
        content: input.content,
        duration_hours: input.durationHours,
        is_mandatory: input.isMandatory,
        expiry_months: input.expiryMonths,
        file_url: input.fileUrl || null,
        youtube_video_id: input.youtubeVideoId || null,
        category: input.category || null,
        difficulty: input.difficulty || null,
        prerequisite_id: input.prerequisiteId || null,
        tags: input.tags || null,
        duration_minutes: input.durationMinutes || null,
        created_by: userId,
        created_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      console.error('Training module creation error:', error);
      return { success: false, error: error.message };
    }

    revalidatePath('/admin/training');
    return { success: true, message: 'Training module created successfully', data };
  } catch (error) {
    console.error('Create training module error:', error);
    return { success: false, error: 'Failed to create training module' };
  }
}

export async function updateTrainingModule(moduleId: string, input: Partial<CreateTrainingModuleInput>) {
  try {
    const { error: authError } = await verifyAdmin();
    if (authError) {
      return { success: false, error: authError };
    }

    const supabase = createServerClient();

    const updateData: Record<string, unknown> = {};
    if (input.title !== undefined) updateData.title = input.title;
    if (input.description !== undefined) updateData.description = input.description;
    if (input.content !== undefined) updateData.content = input.content;
    if (input.durationHours !== undefined) updateData.duration_hours = input.durationHours;
    if (input.isMandatory !== undefined) updateData.is_mandatory = input.isMandatory;
    if (input.expiryMonths !== undefined) updateData.expiry_months = input.expiryMonths;
    if (input.fileUrl !== undefined) updateData.file_url = input.fileUrl;
    if (input.youtubeVideoId !== undefined) updateData.youtube_video_id = input.youtubeVideoId;
    if (input.category !== undefined) updateData.category = input.category;
    if (input.difficulty !== undefined) updateData.difficulty = input.difficulty;
    if (input.prerequisiteId !== undefined) updateData.prerequisite_id = input.prerequisiteId;
    if (input.tags !== undefined) updateData.tags = input.tags;
    if (input.durationMinutes !== undefined) updateData.duration_minutes = input.durationMinutes;

    const { data, error } = await supabase
      .from('training_modules')
      .update(updateData)
      .eq('id', moduleId)
      .select()
      .single();

    if (error) {
      return { success: false, error: error.message };
    }

    revalidatePath('/admin/training');
    return { success: true, message: 'Training module updated successfully', data };
  } catch (error) {
    console.error('Update training module error:', error);
    return { success: false, error: 'Failed to update training module' };
  }
}

export async function getAllTrainingModules() {
  try {
    const supabase = createServerClient();

    const { data, error } = await supabase
      .from('training_modules')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Fetch training modules error:', error);
      return { success: false, error: error.message };
    }

    return { success: true, data: data || [] };
  } catch (error) {
    console.error('Get training modules error:', error);
    return { success: false, error: 'Failed to fetch training modules' };
  }
}

export async function deleteTrainingModule(moduleId: string) {
  try {
    const { error: authError } = await verifyAdmin();
    if (authError) {
      return { success: false, error: authError };
    }

    const supabase = createServerClient();

    const { error } = await supabase
      .from('training_modules')
      .delete()
      .eq('id', moduleId);

    if (error) {
      return { success: false, error: error.message };
    }

    revalidatePath('/admin/training');
    return { success: true, message: 'Training module deleted successfully' };
  } catch (error) {
    console.error('Delete training module error:', error);
    return { success: false, error: 'Failed to delete training module' };
  }
}

export async function assignTraining(input: AssignTrainingInput) {
  try {
    const { error: authError, userId } = await verifyAdmin();
    if (authError || !userId) {
      return { success: false, error: authError || 'Unauthorized' };
    }

    const supabase = createServerClient();
    const assignments: Array<Record<string, unknown>> = [];

    if (input.assignmentType === 'individual' && input.userIds?.length) {
      for (const uid of input.userIds) {
        assignments.push({
          module_id: input.moduleId,
          user_id: uid,
          assignment_type: 'individual',
          assigned_by: userId,
          deadline: input.deadline || null,
          is_mandatory: input.isMandatory,
          notes: input.notes || null,
        });
      }
    } else if (input.assignmentType === 'department' && input.department) {
      // Get all users in the department
      const { data: deptUsers } = await supabase
        .from('users')
        .select('id')
        .eq('department', input.department)
        .eq('is_active', true);

      if (deptUsers) {
        for (const deptUser of deptUsers) {
          assignments.push({
            module_id: input.moduleId,
            user_id: deptUser.id,
            department: input.department,
            assignment_type: 'department',
            assigned_by: userId,
            deadline: input.deadline || null,
            is_mandatory: input.isMandatory,
            notes: input.notes || null,
          });
        }
      }
    }

    if (assignments.length === 0) {
      return { success: false, error: 'No users to assign' };
    }

    const { error } = await supabase
      .from('training_assignments')
      .upsert(assignments, { onConflict: 'module_id,user_id' });

    if (error) {
      console.error('Assignment error:', error);
      return { success: false, error: error.message };
    }

    // ✅ ADD EMAIL NOTIFICATIONS
    try {
      // Get module details
      const { data: module } = await supabase
        .from('training_modules')
        .select('title')
        .eq('id', input.moduleId)
        .single();

      // Get user emails for all assignments
      const userIds = assignments.map(a => a.user_id as string);
      const { data: users } = await supabase
        .from('users')
        .select('id, email, first_name, last_name')
        .in('id', userIds);

      if (users && module) {
        const { sendBulkTrainingEmails } = await import('@/lib/email/send-email');
        
        const recipients = users.map(u => ({
          email: u.email,
          name: `${u.first_name} ${u.last_name}`,
        }));

        const courseUrl = `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/training/${input.moduleId}`;
        
        const emailResults = await sendBulkTrainingEmails(
          recipients,
          module.title,
          input.deadline,
          courseUrl
        );

        console.log(`[TRAINING EMAILS] Sent: ${emailResults.successful}, Failed: ${emailResults.failed}`);
      }
    } catch (emailError) {
      // Don't fail the assignment if email fails
      console.error('Failed to send training emails:', emailError);
    }

    revalidatePath('/admin/training');
    return { success: true, message: `Assigned to ${assignments.length} user(s)` };
  } catch (error) {
    console.error('Assign training error:', error);
    return { success: false, error: 'Failed to assign training' };
  }
}

export async function getTrainingAssignments(moduleId?: string) {
  try {
    const supabase = createServerClient();

    let query = supabase
      .from('training_assignments')
      .select(`
        *,
        user:users!training_assignments_user_id_fkey(id, first_name, last_name, email, department),
        module:training_modules!training_assignments_module_id_fkey(id, title)
      `)
      .order('assigned_at', { ascending: false });

    if (moduleId) {
      query = query.eq('module_id', moduleId);
    }

    const { data, error } = await query;

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, data: data || [] };
  } catch (error) {
    console.error('Get assignments error:', error);
    return { success: false, error: 'Failed to fetch assignments' };
  }
}

export async function getTrainingAnalytics() {
  try {
    const supabase = createServerClient();

    const [
      { data: modules },
      { data: allProgress },
      { data: assignments },
      { data: watchProgress },
    ] = await Promise.all([
      supabase.from('training_modules').select('*'),
      supabase.from('training_progress').select('*, user:users!training_progress_user_id_fkey(first_name, last_name, email, department)'),
      supabase.from('training_assignments').select('*'),
      supabase.from('video_watch_progress').select('*'),
    ]);

    const totalModules = modules?.length || 0;
    const totalAssignments = assignments?.length || 0;
    const totalCompletions = allProgress?.filter(p => p.status === 'completed').length || 0;
    const inProgressCount = allProgress?.filter(p => p.status === 'in_progress').length || 0;
    const avgScore = allProgress?.filter(p => p.score != null).reduce((sum, p) => sum + (p.score || 0), 0) /
      (allProgress?.filter(p => p.score != null).length || 1) || 0;
    const avgWatchPercentage = watchProgress?.reduce((sum, w) => sum + (w.watched_percentage || 0), 0) /
      (watchProgress?.length || 1) || 0;

    // Completion rate
    const completionRate = totalAssignments > 0
      ? Math.round((totalCompletions / totalAssignments) * 100)
      : 0;

    return {
      success: true,
      data: {
        totalModules,
        totalAssignments,
        totalCompletions,
        inProgressCount,
        avgScore: Math.round(avgScore),
        avgWatchPercentage: Math.round(avgWatchPercentage),
        completionRate,
        progress: allProgress || [],
        modules: modules || [],
      },
    };
  } catch (error) {
    console.error('Get analytics error:', error);
    return { success: false, error: 'Failed to fetch analytics' };
  }
}

export async function removeAssignment(assignmentId: string) {
  try {
    const { error: authError } = await verifyAdmin();
    if (authError) {
      return { success: false, error: authError };
    }

    const supabase = createServerClient();

    const { error } = await supabase
      .from('training_assignments')
      .delete()
      .eq('id', assignmentId);

    if (error) {
      return { success: false, error: error.message };
    }

    revalidatePath('/admin/training');
    return { success: true, message: 'Assignment removed' };
  } catch (error) {
    console.error('Remove assignment error:', error);
    return { success: false, error: 'Failed to remove assignment' };
  }
}

export async function getAllStaffForAssignment() {
  try {
    const supabase = createServerClient();

    const { data, error } = await supabase
      .from('users')
      .select('id, first_name, last_name, email, department, role')
      .eq('is_active', true)
      .order('first_name', { ascending: true });

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, data: data || [] };
  } catch (error) {
    console.error('Get staff error:', error);
    return { success: false, error: 'Failed to fetch staff' };
  }
}
