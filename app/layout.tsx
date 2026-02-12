import React from "react"
import type { Metadata } from 'next'
import { Poppins } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { AuthProvider } from '@/lib/context/auth-context'
import { NotificationsToast } from '@/components/notifications-toast'
import './globals.css'

const poppins = Poppins({ 
  subsets: ["latin"],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-poppins'
});

export const metadata: Metadata = {
  title: 'NutriHealth Consult | Staff Management & Training Platform',
  description: 'Comprehensive HR management platform for staff onboarding, training assignments, document management, and team coordination.',
  keywords: 'staff management, HR platform, training, onboarding, document management',
  applicationName: 'NutriHealth Consult',
  authors: [{ name: 'NutriHealth Consult' }],
  icons: {
    icon: '/nutrihealth-logo.svg',
    apple: '/nutrihealth-logo.svg',
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: process.env.NEXT_PUBLIC_APP_URL || 'https://nutrihealthconsult.com',
    siteName: 'NutriHealth Consult',
    title: 'NutriHealth Consult | Staff Management & Training Platform',
    description: 'Comprehensive HR management platform for staff onboarding, training assignments, document management, and team coordination.',
    images: [
      {
        url: '/nutrihealth-logo.png',
        width: 1200,
        height: 630,
        alt: 'NutriHealth Consult Logo',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'NutriHealth Consult | Staff Management & Training Platform',
    description: 'Comprehensive HR management platform for staff onboarding, training assignments, document management, and team coordination.',
    images: ['/nutrihealth-logo.png'],
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`${poppins.variable} font-sans antialiased`}>
        <AuthProvider>
          <NotificationsToast />
          {children}
        </AuthProvider>
        <Analytics />
      </body>
    </html>
  )
}
