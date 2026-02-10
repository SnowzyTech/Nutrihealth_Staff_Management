import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { IMAGEKIT_UPLOAD_FOLDERS } from '@/lib/imagekit';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { signatureData, userId, documentId } = body;

    if (!signatureData || !userId || !documentId) {
      return NextResponse.json(
        { error: 'Signature data, userId, and documentId are required' },
        { status: 400 }
      );
    }

    // Convert base64 data URL to buffer
    const base64Data = signatureData.replace(/^data:image\/\w+;base64,/, '');
    const buffer = Buffer.from(base64Data, 'base64');

    // Upload to Supabase Storage
    const fileName = `${userId}-${documentId}-${Date.now()}.png`;
    const { data, error } = await supabase.storage
      .from('signatures')
      .upload(`${IMAGEKIT_UPLOAD_FOLDERS.SIGNATURES}/${fileName}`, buffer, {
        contentType: 'image/png',
      });

    if (error) {
      console.error('Upload error:', error);
      return NextResponse.json(
        { error: 'Failed to upload signature' },
        { status: 500 }
      );
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from('signatures')
      .getPublicUrl(`${IMAGEKIT_UPLOAD_FOLDERS.SIGNATURES}/${fileName}`);

    return NextResponse.json({
      success: true,
      url: urlData.publicUrl,
      fileName,
    });
  } catch (error) {
    console.error('Signature upload error:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}
