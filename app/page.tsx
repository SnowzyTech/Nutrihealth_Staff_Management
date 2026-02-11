'use client';

import { useAuth } from '@/lib/context/auth-context';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, Users, BookOpen, Zap, Shield, TrendingUp, Heart } from 'lucide-react';
import { PublicNavbar } from '@/components/public-navbar';
import { PublicFooter } from '@/components/public-footer';

export default function Home() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) {
      router.push('/dashboard');
    }
  }, [user, loading, router]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 via-white to-slate-50">
      <PublicNavbar />

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 animate-fade-up">
        <div className="max-w-4xl mx-auto text-center space-y-6">
          <h1 className="text-5xl md:text-6xl font-bold text-slate-900 text-balance">
            Staff Management Made Simple
          </h1>
          <p className="text-xl text-slate-600 text-balance">
            Streamline your staff onboarding, training, and handbook management all in one place
          </p>
          <div className="flex justify-center gap-4 pt-4">
            <Link href="/contact">
              <Button size="lg">Contact Us</Button>
            </Link>
            <Link href="/features">
              <Button size="lg" variant="outline" className="bg-transparent">Learn More</Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 bg-white animate-fade-up-delay-1">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-slate-900 mb-12 text-center">Key Features</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card>
              <CardHeader>
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                  <CheckCircle className="h-6 w-6 text-blue-600" />
                </div>
                <CardTitle>Onboarding</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Streamline new employee onboarding with automated document management and progress tracking
                </CardDescription>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                  <Zap className="h-6 w-6 text-green-600" />
                </div>
                <CardTitle>Training Modules</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Create, assign, and track mandatory training with expiry dates and completion scores
                </CardDescription>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                  <BookOpen className="h-6 w-6 text-purple-600" />
                </div>
                <CardTitle>Digital Handbook</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Keep company policies, procedures, and benefits organized in an easy-to-access handbook
                </CardDescription>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mb-4">
                  <Users className="h-6 w-6 text-orange-600" />
                </div>
                <CardTitle>Staff Management</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Manage staff profiles, roles, departments, and HR records all in one centralized system
                </CardDescription>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mb-4">
                  <CheckCircle className="h-6 w-6 text-red-600" />
                </div>
                <CardTitle>HR Records</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Store and manage employee HR documents, contracts, and important records securely
                </CardDescription>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="w-12 h-12 bg-cyan-100 rounded-lg flex items-center justify-center mb-4">
                  <Zap className="h-6 w-6 text-cyan-600" />
                </div>
                <CardTitle>Audit & Compliance</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Complete audit logs track all actions for compliance and accountability
                </CardDescription>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-blue-600 text-white animate-fade-up-delay-2">
        <div className="max-w-4xl mx-auto text-center space-y-6">
          <h2 className="text-3xl md:text-4xl font-bold">
            Ready to Transform Your Staff Management?
          </h2>
          <p className="text-lg text-blue-100">
            Join companies that trust Nutrihealth Consult for their staff management needs
          </p>
          <Link href="/contact">
            <Button size="lg" variant="secondary">
              Contact Us
            </Button>
          </Link>
        </div>
      </section>

      <PublicFooter />
    </div>
  );
}
