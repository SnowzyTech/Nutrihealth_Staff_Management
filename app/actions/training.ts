'use server';

import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function getTrainingModules(userId?: string) {
  try {
    let query = supabase.from('training_modules').select('*');

    if (userId) {
      query = query.eq('created_by', userId);
    }

    const { data, error } = await query.order('created_at', { ascending: false });

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, data };
  } catch (error) {
    return { success: false, error: 'Failed to fetch training modules' };
  }
}

export async function getTrainingProgress(userId: string) {
  try {
    const { data, error } = await supabase
      .from('training_progress')
      .select('*')
      .eq('user_id', userId)
      .order('started_at', { ascending: false });

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, data };
  } catch (error) {
    return { success: false, error: 'Failed to fetch training progress' };
  }
}

export async function getAssignedModules(userId: string) {
  try {
    const { data, error } = await supabase
      .from('training_assignments')
      .select(`
        *,
        module:training_modules(*)
      `)
      .eq('user_id', userId)
      .order('assigned_at', { ascending: false });

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, data };
  } catch (error) {
    return { success: false, error: 'Failed to fetch assigned modules' };
  }
}

export async function startTraining(userId: string, moduleId: string) {
  try {
    // Check if progress already exists
    const { data: existing } = await supabase
      .from('training_progress')
      .select('id')
      .eq('user_id', userId)
      .eq('module_id', moduleId)
      .single();

    if (existing) {
      const { data, error } = await supabase
        .from('training_progress')
        .update({
          status: 'in_progress',
          started_at: new Date().toISOString(),
        })
        .eq('id', existing.id)
        .select();

      if (error) return { success: false, error: error.message };
      return { success: true, data };
    }

    const { data, error } = await supabase
      .from('training_progress')
      .insert({
        user_id: userId,
        module_id: moduleId,
        started_at: new Date().toISOString(),
        status: 'in_progress',
      })
      .select();

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, data };
  } catch (error) {
    return { success: false, error: 'Failed to start training' };
  }
}

export async function completeTraining(
  userId: string,
  moduleId: string,
  score: number,
  certificateUrl?: string
) {
  try {
    // Get module expiry info
    const { data: module } = await supabase
      .from('training_modules')
      .select('expiry_months')
      .eq('id', moduleId)
      .single();

    const expiresAt = module?.expiry_months
      ? new Date(Date.now() + module.expiry_months * 30 * 24 * 60 * 60 * 1000).toISOString()
      : null;

    const { data: existing } = await supabase
      .from('training_progress')
      .select('id')
      .eq('user_id', userId)
      .eq('module_id', moduleId)
      .single();

    if (existing) {
      const { data, error } = await supabase
        .from('training_progress')
        .update({
          completed_at: new Date().toISOString(),
          status: 'completed',
          score,
          certificate_url: certificateUrl,
          expires_at: expiresAt,
        })
        .eq('id', existing.id)
        .select();

      if (error) return { success: false, error: error.message };
      return { success: true, message: 'Training completed successfully', data };
    }

    const { data, error } = await supabase
      .from('training_progress')
      .insert({
        user_id: userId,
        module_id: moduleId,
        completed_at: new Date().toISOString(),
        started_at: new Date().toISOString(),
        status: 'completed',
        score,
        certificate_url: certificateUrl,
        expires_at: expiresAt,
      })
      .select();

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, message: 'Training completed successfully', data };
  } catch (error) {
    return { success: false, error: 'Failed to complete training' };
  }
}

export async function saveVideoProgress(
  userId: string,
  moduleId: string,
  currentTimeSeconds: number,
  durationSeconds: number,
  watchedPercentage: number
) {
  try {
    const { data, error } = await supabase
      .from('video_watch_progress')
      .upsert(
        {
          user_id: userId,
          module_id: moduleId,
          current_time_seconds: currentTimeSeconds,
          duration_seconds: durationSeconds,
          watched_percentage: watchedPercentage,
          last_watched_at: new Date().toISOString(),
        },
        { onConflict: 'user_id,module_id' }
      )
      .select()
      .single();

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, data };
  } catch (error) {
    return { success: false, error: 'Failed to save video progress' };
  }
}

export async function getVideoProgress(userId: string, moduleId: string) {
  try {
    const { data, error } = await supabase
      .from('video_watch_progress')
      .select('*')
      .eq('user_id', userId)
      .eq('module_id', moduleId)
      .single();

    if (error && error.code !== 'PGRST116') {
      return { success: false, error: error.message };
    }

    return { success: true, data: data || null };
  } catch (error) {
    return { success: false, error: 'Failed to fetch video progress' };
  }
}

export async function createTrainingModule(
  title: string,
  description: string,
  category: string,
  isMandatory: boolean,
  durationMinutes: number,
  contentUrl: string,
  userId: string
) {
  try {
    const { data, error } = await supabase
      .from('training_modules')
      .insert({
        title,
        description,
        category,
        is_mandatory: isMandatory,
        duration_minutes: durationMinutes,
        content_url: contentUrl,
        created_by: userId,
        created_at: new Date().toISOString(),
      })
      .select();

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, message: 'Training module created successfully', data };
  } catch (error) {
    return { success: false, error: 'Failed to create training module' };
  }
}
