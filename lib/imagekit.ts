import crypto from 'crypto';

const IMAGEKIT_PRIVATE_KEY = process.env.IMAGEKIT_PRIVATE_KEY;
const IMAGEKIT_PUBLIC_KEY = process.env.IMAGEKIT_PUBLIC_KEY;
const IMAGEKIT_URL_ENDPOINT = process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT;

export function generateImageKitAuthToken() {
  if (!IMAGEKIT_PRIVATE_KEY || !IMAGEKIT_PUBLIC_KEY) {
    throw new Error('ImageKit credentials are not configured');
  }

  const token = IMAGEKIT_PUBLIC_KEY;
  const expire = Math.floor(Date.now() / 1000) + 30 * 60; // 30 minutes
  const authPayload = `${token}${expire}`;
  
  const signature = crypto
    .createHmac('sha1', IMAGEKIT_PRIVATE_KEY)
    .update(authPayload)
    .digest('hex');

  return {
    token,
    expire,
    signature,
  };
}

export function getImageKitUrl(filePath: string, options?: Record<string, unknown>) {
  if (!IMAGEKIT_URL_ENDPOINT) {
    throw new Error('ImageKit URL endpoint is not configured');
  }

  const baseUrl = new URL(IMAGEKIT_URL_ENDPOINT);
  baseUrl.pathname = `/tr:${buildTransformString(options)}/${filePath}`;

  return baseUrl.toString();
}

function buildTransformString(options?: Record<string, unknown>): string {
  if (!options) return 'c-maintain,q-80';

  const transforms: string[] = [];

  if (options.width) transforms.push(`w-${options.width}`);
  if (options.height) transforms.push(`h-${options.height}`);
  if (options.quality) transforms.push(`q-${options.quality}`);
  if (options.crop) transforms.push(`c-${options.crop}`);
  if (options.aspectRatio) transforms.push(`ar-${options.aspectRatio}`);
  if (options.gravity) transforms.push(`g-${options.gravity}`);

  return transforms.length > 0 ? transforms.join(',') : 'c-maintain,q-80';
}

export const IMAGEKIT_UPLOAD_FOLDERS = {
  AVATARS: '/avatars',
  HR_DOCUMENTS: '/hr-documents',
  SIGNATURES: '/signatures',
  TRAINING_MATERIALS: '/training',
  HANDBOOK_ATTACHMENTS: '/handbook',
} as const;
