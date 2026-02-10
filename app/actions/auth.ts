'use server';

import { createServerClient, createServerClientWithCookies } from '@/lib/supabase/server';
import { sendWelcomeEmail, sendPasswordResetEmail } from '@/lib/email/send-email';
import { generateSecurePassword } from '@/lib/auth/generate-password';
import { LoginSchema, SignupSchema, ResetPasswordSchema, ChangePasswordSchema } from '@/lib/schemas/auth';
import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

const supabase = createServerClient();

export async function loginAction(input: z.infer<typeof LoginSchema>) {
  try {
    const supabase = createServerClient();
    const validatedInput = LoginSchema.parse(input);
    
    // Use admin client to sign in (bypasses RLS)
    const { data, error } = await supabase.auth.signInWithPassword({
      email: validatedInput.email,
      password: validatedInput.password,
    });

    if (error) {
      return { success: false, error: error.message };
    }

    if (!data.user) {
      return { success: false, error: 'Login failed. Please try again.' };
    }

    // Fetch user profile using admin client (bypasses RLS)
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('id, email, first_name, last_name, role, is_active')
      .eq('id', data.user.id)
      .single();

    if (userError || !userData) {
      return { success: false, error: 'User profile not found. Please contact administrator.' };
    }

    if (!userData.is_active) {
      return { success: false, error: 'Your account has been deactivated. Please contact administrator.' };
    }

    revalidatePath('/dashboard');
    revalidatePath('/admin');

    // Return success with redirect URL based on role
    const redirectTo = userData.role === 'admin' ? '/admin' : '/dashboard';
    
    return { 
      success: true, 
      user: userData,
      session: data.session,
      redirectTo 
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: error.errors[0].message };
    }
    console.error('Login error:', error);
    return { success: false, error: 'An unexpected error occurred' };
  }
}

export async function signupAction(input: z.infer<typeof SignupSchema>) {
  try {
    const supabase = createServerClient();
    const validatedInput = SignupSchema.parse(input);

    const { data, error } = await supabase.auth.signUp({
      email: validatedInput.email,
      password: validatedInput.password,
      options: {
        data: {
          firstName: validatedInput.firstName,
          lastName: validatedInput.lastName,
          employeeId: validatedInput.employeeId,
        },
      },
    });

    if (error) {
      return { success: false, error: error.message };
    }

    // Send welcome email
    if (data.user) {
      await sendWelcomeEmail({
        to: validatedInput.email,
        name: `${validatedInput.firstName} ${validatedInput.lastName}`,
        email: validatedInput.email,
        loginUrl: `${process.env.NEXT_PUBLIC_APP_URL}/auth/login`,
      });
    }

    revalidatePath('/auth/login');

    return { 
      success: true, 
      message: 'Signup successful. Welcome email sent. Please check your email.',
      data 
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: error.errors[0].message };
    }
    console.error('Signup error:', error);
    return { success: false, error: 'An unexpected error occurred' };
  }
}

export async function logoutAction() {
  try {
    const supabase = createServerClient();
    const { error } = await supabase.auth.signOut();

    if (error) {
      return { success: false, error: error.message };
    }

    revalidatePath('/');
    redirect('/auth/login');
  } catch (error) {
    console.error('Logout error:', error);
    return { success: false, error: 'Failed to logout' };
  }
}

export async function resetPasswordAction(input: z.infer<typeof ResetPasswordSchema>) {
  try {
    const supabase = createServerClient();
    const validatedInput = ResetPasswordSchema.parse(input);

    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('id')
      .eq('email', validatedInput.email)
      .single();

    if (userError || !userData) {
      return { 
        success: true,
        message: 'If an account exists with this email, a password reset link will be sent.'
      };
    }

    const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL}/auth/reset-password?email=${encodeURIComponent(validatedInput.email)}`;
    
    await sendPasswordResetEmail({
      to: validatedInput.email,
      resetUrl,
    });

    revalidatePath('/auth/forgot-password');

    return { 
      success: true,
      message: 'Password reset email sent. Please check your inbox.'
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: error.errors[0].message };
    }
    console.error('Reset password error:', error);
    return { success: false, error: 'An unexpected error occurred' };
  }
}

export async function changePasswordAction(input: z.infer<typeof ChangePasswordSchema>) {
  try {
    const supabaseWithCookies = await createServerClientWithCookies();
    const { data: { user: currentUser } } = await supabaseWithCookies.auth.getUser();

    if (!currentUser) {
      return { success: false, error: 'Auth session missing!' };
    }

    const validatedInput = ChangePasswordSchema.parse(input);

    // Verify current password by attempting to sign in
    const { error: signInError } = await supabaseWithCookies.auth.signInWithPassword({
      email: currentUser.email || '',
      password: validatedInput.currentPassword,
    });

    if (signInError) {
      return { success: false, error: 'Current password is incorrect' };
    }

    // Update password using admin client
    const supabase = createServerClient();
    const { error } = await supabase.auth.admin.updateUserById(currentUser.id, {
      password: validatedInput.newPassword,
    });

    if (error) {
      return { success: false, error: error.message };
    }

    revalidatePath('/dashboard/profile');

    return { success: true, message: 'Password changed successfully' };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: error.errors[0].message };
    }
    console.error('Change password error:', error);
    return { success: false, error: 'An unexpected error occurred' };
  }
}
