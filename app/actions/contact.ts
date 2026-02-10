'use server';

import { z } from 'zod';
import { createServerClient } from '@/lib/supabase/server';
import { rateLimit } from '@/lib/utils/rate-limit';

const contactSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  phone: z.string().optional(),
  subject: z.string().min(5, 'Subject must be at least 5 characters'),
  message: z.string().min(10, 'Message must be at least 10 characters'),
});

export async function submitContactForm(formData: FormData) {
  try {
    // Rate limiting
    const email = formData.get('email') as string;
    const rateCheckResult = rateLimit(`contact:${email}`, 5, 3600000); // 5 requests per hour

    if (!rateCheckResult.success) {
      return { 
        success: false, 
        error: rateCheckResult.error 
      };
    }

    const rawData = {
      name: formData.get('name') as string,
      email: formData.get('email') as string,
      phone: formData.get('phone') as string || undefined,
      subject: formData.get('subject') as string,
      message: formData.get('message') as string,
    };

    const result = contactSchema.safeParse(rawData);
    if (!result.success) {
      return { success: false, error: result.error.errors[0].message };
    }

    const supabase = createServerClient();

    // Store contact inquiry in database
    const { error: dbError } = await supabase.from('contact_inquiries').insert({
      name: result.data.name,
      email: result.data.email,
      phone: result.data.phone,
      subject: result.data.subject,
      message: result.data.message,
      status: 'new',
      created_at: new Date().toISOString(),
    });

    if (dbError) {
      console.error('Database error:', dbError);
      return { 
        success: false, 
        error: 'Failed to submit contact form. Please try again later.' 
      };
    }

    return {
      success: true,
      message: 'Thank you for your message. We will get back to you soon!',
    };
  } catch (error) {
    console.error('Contact form error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'An unexpected error occurred',
    };
  }
}
