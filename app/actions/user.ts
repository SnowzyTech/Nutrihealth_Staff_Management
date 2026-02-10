'use server';

import { createServerClient, createServerClientWithCookies } from '@/lib/supabase/server';
import { sendWelcomeEmail } from '@/lib/email/send-email';
import { generateSecurePassword } from '@/lib/auth/generate-password';
import { UserProfileSchema, StaffMemberSchema } from '@/lib/schemas/user';
import { z } from 'zod';
import { revalidatePath } from 'next/cache';

export async function getUserProfile(userId: string) {
  try {
    const supabase = createServerClient();
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, data };
  } catch (error) {
    console.error('Get user profile error:', error);
    return { success: false, error: 'Failed to fetch user profile' };
  }
}

export async function updateUserProfile(userId: string, input: z.infer<typeof UserProfileSchema>) {
  try {
    const supabase = createServerClient();
    const validatedInput = UserProfileSchema.parse(input);

    const { data, error } = await supabase
      .from('users')
      .update({
        first_name: validatedInput.firstName,
        last_name: validatedInput.lastName,
        email: validatedInput.email,
        phone: validatedInput.phone,
        department: validatedInput.department,
        position: validatedInput.position,
        date_of_hire: validatedInput.startDate,
        profile_image_url: validatedInput.avatarUrl,
        bio: validatedInput.bio,
        updated_at: new Date().toISOString(),
      })
      .eq('id', userId)
      .select();
    
    revalidatePath('/dashboard/profile');

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, message: 'Profile updated successfully', data };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: error.errors[0].message };
    }
    return { success: false, error: 'Failed to update profile' };
  }
}

export async function getAllStaff(departmentFilter?: string) {
  try {
    const supabase = createServerClient();
    let query = supabase
      .from('users')
      .select('*')
      .eq('is_active', true);

    if (departmentFilter) {
      query = query.eq('department', departmentFilter);
    }

    const { data, error } = await query.order('first_name', { ascending: true });

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, data };
  } catch (error) {
    console.error('Get staff error:', error);
    return { success: false, error: 'Failed to fetch staff' };
  }
}

export async function createStaffMember(input: z.infer<typeof StaffMemberSchema> & { sendEmail?: boolean }) {
  try {
    // Use cookie-based client to get current user session
    const supabaseWithCookies = await createServerClientWithCookies();
    const { data: { user: currentUser } } = await supabaseWithCookies.auth.getUser();

    if (!currentUser) {
      return { success: false, error: 'Unauthorized - Please log in' };
    }

    // Use admin client for database operations
    const supabase = createServerClient();
    
    const { data: currentUserData } = await supabase
      .from('users')
      .select('role')
      .eq('id', currentUser.id)
      .single();

    if (currentUserData?.role !== 'admin') {
      return { success: false, error: 'Only admins can create staff accounts' };
    }

    const validatedInput = StaffMemberSchema.parse(input);
    const tempPassword = generateSecurePassword(12);

    // Check if employee_id already exists and generate a unique one if needed
    if (validatedInput.employeeId) {
      const { data: existingUser } = await supabase
        .from('users')
        .select('id')
        .eq('employee_id', validatedInput.employeeId)
        .maybeSingle();

      if (existingUser) {
        // Auto-generate a unique employee ID by appending a timestamp suffix
        const timestamp = Date.now().toString().slice(-4);
        const baseId = validatedInput.employeeId.replace(/\d+$/, '');
        const { data: maxEmp } = await supabase
          .from('users')
          .select('employee_id')
          .ilike('employee_id', `${baseId}%`)
          .order('employee_id', { ascending: false })
          .limit(1)
          .maybeSingle();
        
        if (maxEmp?.employee_id) {
          const numMatch = maxEmp.employee_id.match(/(\d+)$/);
          const nextNum = numMatch ? parseInt(numMatch[1], 10) + 1 : parseInt(timestamp, 10);
          validatedInput.employeeId = `${baseId}${String(nextNum).padStart(4, '0')}`;
        } else {
          validatedInput.employeeId = `${validatedInput.employeeId}_${timestamp}`;
        }
      }
    }

    // Create auth user with requires_password_change flag
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: validatedInput.email,
      password: tempPassword,
      email_confirm: true,
      user_metadata: {
        full_name: `${validatedInput.firstName} ${validatedInput.lastName}`,
        requires_password_change: true,
      },
    });

    if (authError) {
      return { success: false, error: authError.message };
    }

    // Create user profile in database
    const { data, error } = await supabase
      .from('users')
      .insert({
        id: authData.user.id,
        first_name: validatedInput.firstName,
        last_name: validatedInput.lastName,
        email: validatedInput.email,
        employee_id: validatedInput.employeeId,
        department: validatedInput.department,
        position: validatedInput.position,
        date_of_hire: validatedInput.startDate,
        role: validatedInput.role,
        phone: validatedInput.phone,
        is_active: validatedInput.isActive,
        created_at: new Date().toISOString(),
      })
      .select();

    if (error) {
      await supabase.auth.admin.deleteUser(authData.user.id);
      return { success: false, error: error.message };
    }

    // Create initial onboarding documents for the new staff member
    const documentTypes = [
      { type: 'nda', title: 'Non-Disclosure Agreement', description: 'Please review and sign the Non-Disclosure Agreement' },
      { type: 'guarantor_form', title: 'Guarantor Form', description: 'Please complete your guarantor information' },
      { type: 'biodata', title: 'Biodata Form', description: 'Please complete your personal biodata information' },
      { type: 'contract', title: 'Employment Contract', description: 'Please review and sign your employment contract' },
      { type: 'offer_letter', title: 'Offer Letter', description: 'Please review and acknowledge your offer letter' },
    ];

    const onboardingDocs = documentTypes.map((doc, index) => ({
      user_id: authData.user.id,
      title: doc.title,
      document_type: 'onboarding',
      order_index: index + 1,
      is_required: true,
      description: doc.description,
    }));

    await supabase.from('onboarding_documents').insert(onboardingDocs);

    // Create welcome notification
    await supabase.from('notifications').insert({
      user_id: authData.user.id,
      title: 'Welcome to Nutrihealth Consult',
      message: 'Please complete your onboarding documents and change your password.',
      type: 'info',
      is_read: false,
    });

    // Create audit log for staff creation
    await supabase.from('audit_logs').insert({
      user_id: currentUser.id,
      action: 'create_staff',
      entity_type: 'user',
      entity_id: authData.user.id,
      details: {
        staff_email: validatedInput.email,
        staff_name: `${validatedInput.firstName} ${validatedInput.lastName}`,
        email_sent: !!input.sendEmail,
      },
    });

    // Send welcome email if requested
    let emailSent = false;
    if (input.sendEmail) {
      try {
        const emailResult = await sendWelcomeEmail({
          to: validatedInput.email,
          name: `${validatedInput.firstName} ${validatedInput.lastName}`,
          email: validatedInput.email,
          temporaryPassword: tempPassword,
          loginUrl: `${process.env.NEXT_PUBLIC_APP_URL}/auth/login`,
        });
        emailSent = emailResult.success;
        if (!emailResult.success) {
          console.error('Failed to send welcome email:', emailResult.error);
        }
      } catch (emailError) {
        console.error('Email sending error:', emailError);
      }
    }

    revalidatePath('/admin/staff');

    // Always return the temporary password so admin can share it manually if email fails
    return { 
      success: true, 
      message: emailSent 
        ? 'Staff member created. Welcome email sent.' 
        : 'Staff member created successfully. Please share the temporary password manually.', 
      data,
      temporaryPassword: tempPassword,
      emailSent 
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: error.errors[0].message };
    }
    console.error('Create staff error:', error);
    return { success: false, error: 'Failed to create staff member' };
  }
}

export async function deactivateStaff(userId: string) {
  try {
    // Use cookie-based client to get current user session
    const supabaseWithCookies = await createServerClientWithCookies();
    const { data: { user: currentUser } } = await supabaseWithCookies.auth.getUser();

    if (!currentUser) {
      return { success: false, error: 'Unauthorized - Please log in' };
    }

    // Use admin client for database operations
    const supabase = createServerClient();
    
    const { data: currentUserData } = await supabase
      .from('users')
      .select('role')
      .eq('id', currentUser.id)
      .single();

    if (currentUserData?.role !== 'admin') {
      return { success: false, error: 'Only admins can deactivate staff accounts' };
    }

    const { data, error } = await supabase
      .from('users')
      .update({ is_active: false, updated_at: new Date().toISOString() })
      .eq('id', userId)
      .select();

    if (error) {
      return { success: false, error: error.message };
    }

    // Create audit log for deactivation
    await supabase.from('audit_logs').insert({
      user_id: currentUser.id,
      action: 'deactivate_staff',
      entity_type: 'user',
      entity_id: userId,
      details: {
        deactivated_at: new Date().toISOString(),
      },
    });

    revalidatePath('/admin/staff');

    return { success: true, message: 'Staff member deactivated', data };
  } catch (error) {
    console.error('Deactivate staff error:', error);
    return { success: false, error: 'Failed to deactivate staff' };
  }
}
