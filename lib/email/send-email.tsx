import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export interface EmailOptions {
  to: string;
  subject?: string;
  name?: string;
  email?: string;
  temporaryPassword?: string;
  loginUrl?: string;
  documentTitle?: string;
  actionUrl?: string;
  message?: string;
}

export async function sendWelcomeEmail({
  to,
  name,
  email,
  temporaryPassword,
  loginUrl,
}: EmailOptions) {
  try {
    const result = await resend.emails.send({
      from: `${process.env.EMAIL_FROM_NAME} <${process.env.EMAIL_FROM}>`,
      to,
      subject: 'Welcome to Nutrihealth Consult',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Welcome to Nutrihealth Consult</h2>
          <p>Dear ${name},</p>
          <p>Your account has been created successfully. Please use the credentials below to log in and complete your onboarding.</p>
          
          <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <p><strong>Email:</strong> ${email}</p>
            <p><strong>Temporary Password:</strong> ${temporaryPassword}</p>
          </div>
          
          <p>
            <a href="${loginUrl}" style="background-color: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">
              Log In Now
            </a>
          </p>
          
          <p>You will be required to change your password on first login.</p>
          <p>If you have any questions, please contact our HR department.</p>
          
          <hr style="margin-top: 30px; border: none; border-top: 1px solid #ddd;">
          <p style="color: #666; font-size: 12px;">This is an automated message. Please do not reply directly to this email.</p>
        </div>
      `,
    });

    if (result.error) {
      console.error('Email send error:', result.error);
      return { success: false, error: result.error.message };
    }

    return { success: true, messageId: result.data?.id };
  } catch (error) {
    console.error('Email service error:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Failed to send email' };
  }
}

export async function sendPasswordResetEmail({
  to,
  name,
  resetUrl,
}: EmailOptions & { resetUrl?: string }) {
  try {
    const result = await resend.emails.send({
      from: `${process.env.EMAIL_FROM_NAME} <${process.env.EMAIL_FROM}>`,
      to,
      subject: 'Reset Your Password',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Password Reset Request</h2>
          <p>Hello ${name},</p>
          <p>We received a request to reset your password. Click the link below to proceed:</p>
          
          <p style="margin: 30px 0;">
            <a href="${resetUrl}" style="background-color: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">
              Reset Password
            </a>
          </p>
          
          <p style="color: #666; font-size: 14px;">This link will expire in 1 hour.</p>
          <p style="color: #666; font-size: 14px;">If you didn't request this, you can safely ignore this email.</p>
          
          <hr style="margin-top: 30px; border: none; border-top: 1px solid #ddd;">
          <p style="color: #666; font-size: 12px;">This is an automated message. Please do not reply directly to this email.</p>
        </div>
      `,
    });

    if (result.error) {
      console.error('Email send error:', result.error);
      return { success: false, error: result.error.message };
    }

    return { success: true, messageId: result.data?.id };
  } catch (error) {
    console.error('Email service error:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Failed to send email' };
  }
}

export async function sendDocumentNotificationEmail({
  to,
  name,
  documentTitle,
  actionUrl,
}: EmailOptions) {
  try {
    const result = await resend.emails.send({
      from: `${process.env.EMAIL_FROM_NAME} <${process.env.EMAIL_FROM}>`,
      to,
      subject: `Action Required: ${documentTitle}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Document Requiring Attention</h2>
          <p>Hello ${name},</p>
          <p>You have been assigned a document that requires your attention:</p>
          
          <div style="background-color: #fff3cd; padding: 15px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #ffc107;">
            <p><strong>${documentTitle}</strong></p>
          </div>
          
          <p>Please review and complete this document at your earliest convenience.</p>
          
          <p>
            <a href="${actionUrl}" style="background-color: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">
              View Document
            </a>
          </p>
          
          <hr style="margin-top: 30px; border: none; border-top: 1px solid #ddd;">
          <p style="color: #666; font-size: 12px;">This is an automated message. Please do not reply directly to this email.</p>
        </div>
      `,
    });

    if (result.error) {
      console.error('Email send error:', result.error);
      return { success: false, error: result.error.message };
    }

    return { success: true, messageId: result.data?.id };
  } catch (error) {
    console.error('Email service error:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Failed to send email' };
  }
}

export async function sendTrainingAssignmentEmail({
  to,
  name,
  documentTitle,
  deadline,
  actionUrl,
}: EmailOptions & { deadline?: string }) {
  try {
    const result = await resend.emails.send({
      from: `${process.env.EMAIL_FROM_NAME} <${process.env.EMAIL_FROM}>`,
      to,
      subject: `New Training Assignment: ${documentTitle}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>New Training Course Assigned</h2>
          <p>Hello ${name},</p>
          <p>You have been assigned a new training course:</p>
          
          <div style="background-color: #e3f2fd; padding: 15px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #2196F3;">
            <p><strong>${documentTitle}</strong></p>
            ${deadline ? `<p>Deadline: ${deadline}</p>` : ''}
          </div>
          
          <p>Please complete this training course as soon as possible.</p>
          
          <p>
            <a href="${actionUrl}" style="background-color: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">
              Start Course
            </a>
          </p>
          
          <hr style="margin-top: 30px; border: none; border-top: 1px solid #ddd;">
          <p style="color: #666; font-size: 12px;">This is an automated message. Please do not reply directly to this email.</p>
        </div>
      `,
    });

    if (result.error) {
      console.error('Email send error:', result.error);
      return { success: false, error: result.error.message };
    }

    return { success: true, messageId: result.data?.id };
  } catch (error) {
    console.error('Email service error:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Failed to send email' };
  }
}
