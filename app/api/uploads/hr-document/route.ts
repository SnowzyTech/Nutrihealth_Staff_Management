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
    const documentType = formData.get('documentType') as string;

    if (!file || !userId || !documentType) {
      return NextResponse.json(
        { error: 'File, userId, and documentType are required' },
        { status: 400 }
      );
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json(
        { error: 'File size must not exceed 10MB' },
        { status: 400 }
      );
    }

    // Validate file type
    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'image/jpeg',
      'image/png',
    ];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'File type not allowed' },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Upload to Supabase Storage
    const fileName = `${userId}-${documentType}-${Date.now()}-${file.name}`;
    const { data, error } = await supabase.storage
      .from('hr-documents')
      .upload(`${IMAGEKIT_UPLOAD_FOLDERS.HR_DOCUMENTS}/${fileName}`, buffer, {
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
      .from('hr-documents')
      .getPublicUrl(`${IMAGEKIT_UPLOAD_FOLDERS.HR_DOCUMENTS}/${fileName}`);

    return NextResponse.json({
      success: true,
      url: urlData.publicUrl,
      fileName,
    });
  } catch (error) {
    console.error('HR document upload error:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}
