'use server';

import { createServerClient } from '@/lib/supabase/server';

export async function getRecentAuditLogs(limit: number = 5) {
  try {
    const supabase = createServerClient();

    const { data, error } = await supabase
      .from('audit_logs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Fetch audit logs error:', error);
      return { success: false, error: error.message, data: [] };
    }

    return { success: true, data: data || [] };
  } catch (error) {
    console.error('Failed to fetch audit logs:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to fetch audit logs',
      data: []
    };
  }
}
