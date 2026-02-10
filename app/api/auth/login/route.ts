import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// Create admin client that bypasses RLS
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    // Sign in with Supabase Auth
    const { data: authData, error: authError } = await supabaseAdmin.auth.signInWithPassword({
      email,
      password,
    });

    if (authError) {
      return NextResponse.json(
        { error: authError.message },
        { status: 401 }
      );
    }

    if (!authData.user) {
      return NextResponse.json(
        { error: 'Login failed. Please try again.' },
        { status: 401 }
      );
    }

    // Fetch user profile using admin client (bypasses RLS)
    const { data: userData, error: userError } = await supabaseAdmin
      .from('users')
      .select('id, email, first_name, last_name, role, is_active')
      .eq('id', authData.user.id)
      .single();

    if (userError || !userData) {
      return NextResponse.json(
        { error: 'User profile not found. Please contact administrator.' },
        { status: 404 }
      );
    }

    if (!userData.is_active) {
      return NextResponse.json(
        { error: 'Your account has been deactivated. Please contact administrator.' },
        { status: 403 }
      );
    }

    // Determine redirect based on role
    const redirectTo = userData.role === 'admin' ? '/admin' : '/dashboard';

    // Return success with session and user data
    return NextResponse.json({
      success: true,
      user: userData,
      session: authData.session,
      redirectTo,
    });

  } catch (error) {
    console.error('Login API error:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}
