# Nutrihealth Consult - Complete Setup Guide

## Overview

This is a production-ready staff management platform built with Next.js 16, Supabase, ImageKit, and Resend. It includes a public website, secure staff portal, admin dashboard, and comprehensive management tools.

---

## 🚀 Quick Start

### 1. Prerequisites

- Node.js 18+ 
- Supabase account
- ImageKit account
- Resend account (for emails)

### 2. Install Dependencies

\`\`\`bash
npm install
\`\`\`

### 3. Configure Environment Variables

Create a `.env.local` file with:

\`\`\`env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# ImageKit
NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY=your_public_key
IMAGEKIT_PRIVATE_KEY=your_private_key
NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT=https://ik.imagekit.io/your_id

# Resend
RESEND_API_KEY=your_resend_api_key
EMAIL_FROM=noreply@nutrihealth.com
EMAIL_FROM_NAME=Nutrihealth Consult

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
\`\`\`

### 4. Setup Supabase Database

1. Go to Supabase console
2. Create a new project
3. Run the migration script from `/supabase/migrations/create_schema.sql` in the SQL editor
4. Enable RLS on all tables (already configured in migration)

### 5. Run Development Server

\`\`\`bash
npm run dev
\`\`\`

Visit `http://localhost:3000`

---

## 📁 Project Structure

\`\`\`
nutrihealth-consult/
├── app/
│   ├── (public)/           # Public pages (landing, about, etc)
│   ├── auth/               # Auth pages (login, signup)
│   ├── dashboard/          # Staff dashboard
│   │   ├── onboarding/
│   │   ├── training/
│   │   ├── handbook/
│   │   ├── hr-records/
│   │   └── profile/
│   ├── admin/              # Admin dashboard
│   │   ├── staff/
│   │   ├── documents/
│   │   ├── training/
│   │   └── settings/
│   ├── api/                # API routes (uploads, webhooks)
│   │   ├── uploads/
│   │   │   ├── avatar/
│   │   │   ├── hr-document/
│   │   │   └── signature/
│   │   ├── imagekit/
│   │   └── webhooks/
│   ├── actions/            # Server actions
│   │   ├── auth.ts
│   │   ├── user.ts
│   │   ├── onboarding.ts
│   │   ├── training.ts
│   │   ├── handbook.ts
│   │   ├── hr.ts
│   │   └── contact.ts
│   └── layout.tsx
├── lib/
│   ├── supabase/
│   │   ├── client.ts       # Browser client
│   │   └── server.ts       # Server client
│   ├── schemas/            # Zod validation schemas
│   ├── stores/             # Zustand stores
│   ├── email/
│   │   └── send-email.ts   # Email templates & sending
│   ├── auth/
│   │   └── generate-password.ts
│   ├── imagekit.ts         # ImageKit utilities
│   └── utils/
│       ├── rate-limit.ts
│       ├── audit-log.ts
│       ├── pdf-download.ts
│       └── ...
├── components/
│   ├── ui/                 # shadcn/ui components
│   ├── signature-pad.tsx    # Digital signature
│   ├── video-embed.tsx      # Video player
│   └── notifications-toast.tsx
├── supabase/
│   └── migrations/
│       └── create_schema.sql
├── public/
├── proxy.ts                # Route protection
├── package.json
└── tsconfig.json
\`\`\`

---

## 🔐 Authentication Flow

### User Signup
1. User fills signup form
2. Form submitted via Server Action
3. Supabase Auth user created
4. User profile inserted in `users` table
5. Welcome email sent via Resend
6. Redirect to login

### Staff Creation (Admin)
1. Admin creates new staff account
2. Temporary password generated
3. Auth user created with password
4. User profile created
5. Onboarding documents created
6. Welcome email sent (optional)
7. Initial notification created

### Login
1. Email and password submitted
2. Supabase Auth validates
3. User role fetched from database
4. Redirect to dashboard or admin based on role

---

## 📊 Key Features

### 1. Onboarding System
- Multiple document types (NDA, Contract, Biodata, etc)
- Digital signature capture
- Draft saving
- Admin review and approval
- Document status tracking
- Email notifications

### 2. Training Management
- Create training courses with YouTube/Vimeo videos
- Assign courses to staff (mandatory or optional)
- Track training progress
- Set completion deadlines
- Difficulty levels
- Email notifications on assignment

### 3. Handbook System
- Organize content in categories
- Full-text search
- Publish/unpublish content
- Metadata and timestamps
- Staff access tracking

### 4. HR Documents
- Store personnel documents
- Performance reviews
- Salary information
- Document archival
- Audit trails

### 5. Admin Dashboard
- Staff directory with search and filters
- Document management
- Training analytics
- System settings
- Audit logs

---

## 🔑 User Roles

### Admin
- Full access to all features
- Create and manage staff
- Approve/reject documents
- Create and assign training
- Manage handbook
- View audit logs
- System settings

### Staff
- Complete onboarding documents
- View assigned training
- Track training progress
- Access handbook
- View HR documents
- Update profile

---

## 📧 Email Templates

### 1. Welcome Email
- New staff greeting
- Login credentials
- Direct login link
- Password reset reminder

### 2. Password Reset
- Reset link
- Expiration time
- Security notice

### 3. Document Notification
- Document assigned
- Deadline (if any)
- Direct link to document

### 4. Training Assignment
- Course title
- Deadline (if mandatory)
- Direct course link

---

## 🛡️ Security Features

### Authentication
- Supabase Auth with secure passwords
- Role-based access control
- Session management via HTTP-only cookies
- Automatic logout on inactivity

### Database
- Row Level Security (RLS) on all tables
- User data isolation
- Admin-only operations protected

### Validation
- Zod schema validation
- Input sanitization
- Type safety with TypeScript

### File Uploads
- ImageKit for secure file storage
- File type validation
- Signed URLs for private documents

### Rate Limiting
- Contact form rate limiting
- Configurable per-endpoint
- IP-based tracking

### Audit Logging
- All admin actions logged
- User identification
- Timestamp tracking
- Entity-based logging

---

## 🚀 Deployment

### To Vercel

\`\`\`bash
# 1. Push to GitHub
git add .
git commit -m "Initial commit"
git push origin main

# 2. Connect GitHub to Vercel
# https://vercel.com/new

# 3. Set environment variables in Vercel dashboard
# 4. Deploy
\`\`\`

### Database Backup
- Supabase automatically backs up data
- Set up regular backups in Supabase settings
- Monitor storage usage

---

## 📱 Responsive Design

The application is fully responsive:
- **Mobile:** 320px and up
- **Tablet:** 768px and up
- **Desktop:** 1024px and up

All forms, tables, and components adapt to screen size.

---

## 🧪 Testing

### Manual Testing Checklist

**Authentication**
- [ ] Signup with valid email
- [ ] Signup validation errors
- [ ] Login with correct credentials
- [ ] Login with wrong password
- [ ] Password reset flow
- [ ] Change password

**Onboarding**
- [ ] Staff can see assigned documents
- [ ] Can save draft
- [ ] Can submit document
- [ ] Can sign with signature pad
- [ ] Admin can review and approve
- [ ] Email notifications sent

**Training**
- [ ] Create training course
- [ ] Assign to staff
- [ ] View progress
- [ ] Complete module
- [ ] Download certificate

**Admin Features**
- [ ] Create new staff
- [ ] Edit staff details
- [ ] Deactivate staff
- [ ] View audit logs
- [ ] Manage handbook
- [ ] View statistics

---

## 🐛 Troubleshooting

### Email Not Sending
1. Check Resend API key in .env.local
2. Verify EMAIL_FROM matches Resend domain
3. Check email console in Resend dashboard
4. Look for error logs in server

### File Upload Failed
1. Verify ImageKit credentials
2. Check file size limits (default 25MB)
3. Ensure correct file type
4. Check browser console for CORS errors

### Login Redirects to /auth/login
1. Verify SUPABASE_SERVICE_ROLE_KEY exists
2. Check user exists in database
3. Clear browser cookies
4. Try incognito mode

### Database Migration Failed
1. Ensure you're in SQL editor in Supabase
2. Copy entire migration script
3. Run one section at a time if errors occur
4. Check Supabase logs for specific errors

---

## 📚 Documentation Links

- [Next.js 16 Docs](https://nextjs.org)
- [Supabase Docs](https://supabase.com/docs)
- [ImageKit Docs](https://docs.imagekit.io)
- [Resend Docs](https://resend.com/docs)
- [Zustand Docs](https://github.com/pmndrs/zustand)
- [Zod Docs](https://zod.dev)

---

## 📝 License

This project is for Nutrihealth Consult. All rights reserved.

---

## 🤝 Support

For issues or questions:
1. Check the IMPLEMENTATION_CHECKLIST.md for feature list
2. Review error logs in console
3. Check Supabase dashboard for database issues
4. Verify environment variables are correct

---

**Version:** 1.0.0  
**Last Updated:** January 30, 2026  
**Status:** Production Ready ✅
