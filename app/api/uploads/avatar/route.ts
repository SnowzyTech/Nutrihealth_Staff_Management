import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { IMAGEKIT_UPLOAD_FOLDERS } from '@/lib/imagekit';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const userId = formData.get('userId') as string;

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        { error: 'File size must not exceed 5MB' },
        { status: 400 }
      );
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Only JPEG, PNG, and WebP images are allowed' },
        { status: 400 }
      );
    }

    // Convert file to buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Upload to Supabase Storage
    const fileName = `${userId}-${Date.now()}-${file.name}`;
    const { data, error } = await supabase.storage
      .from('avatars')
      .upload(`${IMAGEKIT_UPLOAD_FOLDERS.AVATARS}/${fileName}`, buffer, {
        contentType: file.type,
      });

    if (error) {
      console.error('Upload error:', error);
      return NextResponse.json(
        { error: 'Failed to upload file' },
        { status: 500 }
      );
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from('avatars')
      .getPublicUrl(`${IMAGEKIT_UPLOAD_FOLDERS.AVATARS}/${fileName}`);

    // Update user profile
    await supabase
      .from('users')
      .update({ avatar_url: urlData.publicUrl })
      .eq('id', userId);

    return NextResponse.json({
      success: true,
      url: urlData.publicUrl,
      fileName,
    });
  } catch (error) {
    console.error('Avatar upload error:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}
