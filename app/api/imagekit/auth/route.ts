import { NextRequest, NextResponse } from 'next/server';
import { generateImageKitAuthToken } from '@/lib/imagekit';

export async function GET(request: NextRequest) {
  try {
    const { token, expire, signature } = generateImageKitAuthToken();

    return NextResponse.json({
      token,
      expire,
      signature,
    });
  } catch (error) {
    console.error('ImageKit auth error:', error);
    return NextResponse.json(
      { error: 'Failed to generate auth token' },
      { status: 500 }
    );
  }
}
