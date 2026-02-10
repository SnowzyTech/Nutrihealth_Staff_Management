'use server';

import { createServerClient } from '@/lib/supabase/server';

export async function getAdminDashboardStats() {
  try {
    const supabase = createServerClient();

    // 1. Total active staff count
    const { count: totalStaff } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true })
      .eq('role', 'staff')
      .eq('is_active', true);

    // 2. Pending documents (submissions with status 'submitted' - awaiting review)
    const { count: pendingDocuments } = await supabase
      .from('onboarding_progress')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'submitted');

    // 3. Total submitted documents
    const { count: totalSubmitted } = await supabase
      .from('onboarding_progress')
      .select('*', { count: 'exact', head: true })
      .not('completed_at', 'is', null);

    // 4. Approved documents
    const { count: approvedDocuments } = await supabase
      .from('onboarding_progress')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'approved');

    // 5. Total onboarding document assignments
    const { count: totalOnboardingAssignments } = await supabase
      .from('onboarding_progress')
      .select('*, onboarding_documents!inner(document_type)', { count: 'exact', head: true })
      .eq('onboarding_documents.document_type', 'onboarding');

    // 6. Completed onboarding assignments
    const { count: completedOnboardingAssignments } = await supabase
      .from('onboarding_progress')
      .select('*, onboarding_documents!inner(document_type)', { count: 'exact', head: true })
      .eq('onboarding_documents.document_type', 'onboarding')
      .not('completed_at', 'is', null);

    // 7. Training modules count
    const { count: trainingModules } = await supabase
      .from('training_modules')
      .select('*', { count: 'exact', head: true });

    // 8. Submission rate: submitted / total assigned * 100
    const { count: totalAssignments } = await supabase
      .from('onboarding_progress')
      .select('*', { count: 'exact', head: true });

    const submissionRate = totalAssignments && totalAssignments > 0
      ? Math.round(((totalSubmitted || 0) / totalAssignments) * 100)
      : 0;

    // Calculate onboarding rate
    const onboardingRate = totalOnboardingAssignments && totalOnboardingAssignments > 0
      ? Math.round(((completedOnboardingAssignments || 0) / totalOnboardingAssignments) * 100)
      : 0;

    return {
      success: true,
      data: {
        totalStaff: totalStaff || 0,
        pendingDocuments: pendingDocuments || 0,
        onboardingRate,
        trainingModules: trainingModules || 0,
        submissionRate,
        approvedDocuments: approvedDocuments || 0,
        totalSubmitted: totalSubmitted || 0,
      },
    };
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    return {
      success: false,
      data: {
        totalStaff: 0,
        pendingDocuments: 0,
        onboardingRate: 0,
        trainingModules: 0,
        submissionRate: 0,
        approvedDocuments: 0,
        totalSubmitted: 0,
      },
    };
  }
}

export async function getRecentActivities(limit: number = 10) {
  try {
    const supabase = createServerClient();

    // Get recent audit logs
    const { data: auditLogs, error: auditError } = await supabase
      .from('audit_logs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (auditError) {
      console.error('Fetch audit logs error:', auditError);
    }

    // Get recent document submissions (onboarding progress)
    const { data: recentSubmissions, error: subError } = await supabase
      .from('onboarding_progress')
      .select(`
        id,
        user_id,
        document_id,
        completed_at,
        status,
        users:user_id (first_name, last_name),
        onboarding_documents:document_id (title, document_type)
      `)
      .not('completed_at', 'is', null)
      .order('completed_at', { ascending: false })
      .limit(limit);

    if (subError) {
      console.error('Fetch submissions error:', subError);
    }

    // Get recent HR record acknowledgments (stored directly on hr_records table)
    const { data: recentHRAcks, error: hrError } = await supabase
      .from('hr_records')
      .select(`
        id,
        user_id,
        record_type,
        title,
        acknowledged_at,
        users:user_id (first_name, last_name)
      `)
      .not('acknowledged_at', 'is', null)
      .order('acknowledged_at', { ascending: false })
      .limit(limit);

    if (hrError) {
      console.error('Fetch HR acks error:', hrError);
    }

    // Combine all activities into a unified timeline
    const activities: Array<{
      id: string;
      type: 'audit' | 'submission' | 'hr_acknowledgment';
      action: string;
      description: string;
      timestamp: string;
      user_name?: string;
    }> = [];

    // Add audit logs
    if (auditLogs) {
      for (const log of auditLogs) {
        activities.push({
          id: `audit-${log.id}`,
          type: 'audit',
          action: log.action,
          description: formatAuditAction(log.action, log.changes),
          timestamp: log.created_at,
        });
      }
    }

    // Add document submissions
    if (recentSubmissions) {
      for (const sub of recentSubmissions) {
        const user = Array.isArray(sub.users) ? sub.users[0] : sub.users;
        const doc = Array.isArray(sub.onboarding_documents) ? sub.onboarding_documents[0] : sub.onboarding_documents;
        const userName = user ? `${user.first_name} ${user.last_name}` : 'Unknown';
        const docTitle = doc?.title || 'Unknown Document';
        const docType = doc?.document_type || 'document';
        
        activities.push({
          id: `sub-${sub.id}`,
          type: 'submission',
          action: 'document_submitted',
          description: `${userName} submitted "${docTitle}" (${formatDocType(docType)})`,
          timestamp: sub.completed_at || '',
          user_name: userName,
        });
      }
    }

    // Add HR record acknowledgments
    if (recentHRAcks) {
      for (const ack of recentHRAcks) {
        const user = Array.isArray(ack.users) ? ack.users[0] : ack.users;
        const userName = user ? `${user.first_name} ${user.last_name}` : 'Unknown';
        const recordTitle = ack.title || ack.record_type?.replace(/_/g, ' ') || 'Unknown HR Record';
        
        activities.push({
          id: `hr-${ack.id}`,
          type: 'hr_acknowledgment',
          action: 'hr_record_acknowledged',
          description: `${userName} acknowledged HR record "${recordTitle}"`,
          timestamp: ack.acknowledged_at || '',
          user_name: userName,
        });
      }
    }

    // Sort by timestamp descending and take the most recent
    activities.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    return {
      success: true,
      data: activities.slice(0, limit),
    };
  } catch (error) {
    console.error('Error fetching recent activities:', error);
    return {
      success: false,
      data: [],
    };
  }
}

function formatAuditAction(action: string, changes?: Record<string, unknown> | null): string {
  const actionMap: Record<string, string> = {
    create_user: 'New staff member added',
    update_user: 'Staff member updated',
    delete_user: 'Staff member deleted',
    deactivate_user: 'Staff member deactivated',
    create_document: 'Document created',
    update_document: 'Document updated',
    approve_document: 'Document approved',
    reject_document: 'Document rejected',
    create_training: 'Training module created',
    update_training: 'Training module updated',
    assign_training: 'Training assigned',
    create_handbook: 'Handbook created',
    update_handbook: 'Handbook updated',
    assign_document: 'Document assigned to staff',
    create_hr_record: 'HR record created',
  };
  
  let desc = actionMap[action] || action;
  
  if (changes) {
    if (changes.title) {
      desc += `: ${changes.title}`;
    }
    if (changes.name) {
      desc += `: ${changes.name}`;
    }
  }
  
  return desc;
}

function formatDocType(type: string): string {
  const typeMap: Record<string, string> = {
    onboarding: 'Onboarding',
    handbook: 'Handbook',
    hr_records: 'HR Records',
    training: 'Training',
    policy: 'Policy',
    other: 'Other',
  };
  return typeMap[type] || type;
}
