'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  CheckCircle2,
  Users,
  BookOpen,
  Zap,
  Shield,
  TrendingUp,
  Heart,
  Clock,
  BarChart3,
  Lock,
} from 'lucide-react';
import { PublicNavbar } from '@/components/public-navbar';
import { PublicFooter } from '@/components/public-footer';

export default function FeaturesPage() {
  const features = [
    {
      icon: CheckCircle2,
      title: 'Onboarding Management',
      description: 'Streamline new employee onboarding with automated document management and progress tracking.',
      benefits: ['Digital document signing', 'Progress tracking', 'Automated workflows'],
    },
    {
      icon: Zap,
      title: 'Training Modules',
      description:
        'Create, assign, and track mandatory training with expiry dates and completion scores.',
      benefits: ['Course creation', 'Progress tracking', 'Certification management'],
    },
    {
      icon: BookOpen,
      title: 'Digital Handbook',
      description:
        'Keep company policies, procedures, and benefits organized in an easy-to-access handbook.',
      benefits: ['Easy updates', 'Searchable content', 'Category organization'],
    },
    {
      icon: Users,
      title: 'Staff Management',
      description: 'Manage staff profiles, roles, departments, and HR records all in one centralized system.',
      benefits: ['Team management', 'Role assignment', 'Department tracking'],
    },
    {
      icon: Shield,
      title: 'Security & Compliance',
      description: 'Enterprise-grade security with role-based access control and audit logs.',
      benefits: ['Row-level security', 'Audit trails', 'Access control'],
    },
    {
      icon: BarChart3,
      title: 'Analytics & Reporting',
      description:
        'Track employee progress with comprehensive analytics and reporting tools.',
      benefits: ['Progress dashboards', 'Completion reports', 'Performance metrics'],
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      <PublicNavbar />

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 bg-gradient-to-b from-blue-50 to-white animate-fade-up">
        <div className="max-w-4xl mx-auto text-center space-y-6">
          <h1 className="text-5xl md:text-6xl font-bold text-slate-900 text-balance">
            Powerful Features for Staff Management
          </h1>
          <p className="text-xl text-slate-600 text-balance">
            Everything you need to manage onboarding, training, and staff development in one platform
          </p>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20 px-4 animate-fade-up-delay-1">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature) => {
              const Icon = feature.icon;
              return (
                <Card key={feature.title} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                      <Icon className="h-6 w-6 text-blue-600" />
                    </div>
                    <CardTitle>{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <CardDescription>{feature.description}</CardDescription>
                    <ul className="space-y-2">
                      {feature.benefits.map((benefit) => (
                        <li key={benefit} className="flex items-center gap-2 text-sm text-slate-600">
                          <CheckCircle2 className="h-4 w-4 text-green-600 flex-shrink-0" />
                          {benefit}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Feature Highlights */}
      <section className="py-20 px-4 bg-white animate-fade-up-delay-2">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-slate-900 mb-12">Why Choose Us?</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div className="flex gap-4">
                <Heart className="h-6 w-6 text-blue-600 flex-shrink-0" />
                <div>
                  <h3 className="font-bold text-slate-900">User-Friendly Interface</h3>
                  <p className="text-slate-600 text-sm">Intuitive design that requires minimal training</p>
                </div>
              </div>
              <div className="flex gap-4">
                <Lock className="h-6 w-6 text-blue-600 flex-shrink-0" />
                <div>
                  <h3 className="font-bold text-slate-900">Enterprise Security</h3>
                  <p className="text-slate-600 text-sm">Bank-level encryption and compliance standards</p>
                </div>
              </div>
              <div className="flex gap-4">
                <Clock className="h-6 w-6 text-blue-600 flex-shrink-0" />
                <div>
                  <h3 className="font-bold text-slate-900">24/7 Support</h3>
                  <p className="text-slate-600 text-sm">Dedicated support team ready to help anytime</p>
                </div>
              </div>
            </div>
            <div className="space-y-6">
              <div className="flex gap-4">
                <TrendingUp className="h-6 w-6 text-blue-600 flex-shrink-0" />
                <div>
                  <h3 className="font-bold text-slate-900">Real-Time Analytics</h3>
                  <p className="text-slate-600 text-sm">Track progress with detailed insights and metrics</p>
                </div>
              </div>
              <div className="flex gap-4">
                <Users className="h-6 w-6 text-blue-600 flex-shrink-0" />
                <div>
                  <h3 className="font-bold text-slate-900">Seamless Integration</h3>
                  <p className="text-slate-600 text-sm">Works with your existing tools and systems</p>
                </div>
              </div>
              <div className="flex gap-4">
                <Zap className="h-6 w-6 text-blue-600 flex-shrink-0" />
                <div>
                  <h3 className="font-bold text-slate-900">Scalable Solution</h3>
                  <p className="text-slate-600 text-sm">Grows with your organization</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-blue-600 text-white animate-fade-up-delay-3">
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
