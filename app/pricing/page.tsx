'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle2 } from 'lucide-react';

export default function PricingPage() {
  const plans = [
    {
      name: 'Starter',
      description: 'Perfect for small teams',
      price: '$99',
      period: '/month',
      features: [
        'Up to 50 staff members',
        'Basic onboarding',
        'Training modules',
        'Digital handbook',
        'Email support',
      ],
      cta: 'Start Free Trial',
      featured: false,
    },
    {
      name: 'Professional',
      description: 'For growing organizations',
      price: '$299',
      period: '/month',
      features: [
        'Up to 500 staff members',
        'Advanced onboarding',
        'Training with analytics',
        'Complete handbook',
        'HR records management',
        'Priority email support',
        'Custom branding',
      ],
      cta: 'Start Free Trial',
      featured: true,
    },
    {
      name: 'Enterprise',
      description: 'For large organizations',
      price: 'Custom',
      period: 'Contact us',
      features: [
        'Unlimited staff members',
        'Full feature access',
        '24/7 phone support',
        'Dedicated account manager',
        'Custom integrations',
        'SLA guarantee',
        'Advanced security features',
      ],
      cta: 'Schedule Demo',
      featured: false,
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Navigation */}
      <nav className="fixed top-0 w-full bg-white border-b border-slate-200 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="text-xl font-bold text-blue-600">
              Nutrihealth Consult
            </Link>
            <div className="flex gap-4">
              <Link href="/auth/login">
                <Button>Sign In</Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 bg-gradient-to-b from-blue-50 to-white">
        <div className="max-w-4xl mx-auto text-center space-y-6">
          <h1 className="text-5xl md:text-6xl font-bold text-slate-900 text-balance">
            Simple, Transparent Pricing
          </h1>
          <p className="text-xl text-slate-600 text-balance">
            Choose the perfect plan for your organization. No hidden fees.
          </p>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {plans.map((plan) => (
              <Card
                key={plan.name}
                className={`transition-all ${
                  plan.featured ? 'ring-2 ring-blue-600 md:scale-105 shadow-lg' : ''
                }`}
              >
                <CardHeader>
                  <CardTitle>{plan.name}</CardTitle>
                  <CardDescription>{plan.description}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <div className="text-4xl font-bold text-slate-900">{plan.price}</div>
                    <p className="text-slate-600 text-sm">{plan.period}</p>
                  </div>

                  <ul className="space-y-3">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex items-start gap-3">
                        <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                        <span className="text-slate-700 text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <Link href="/contact">
                    <Button
                      className="w-full"
                      variant={plan.featured ? 'default' : 'outline'}
                    >
                      {plan.cta}
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-slate-900 mb-12">
            Frequently Asked Questions
          </h2>
          <div className="space-y-6">
            {[
              {
                q: 'Can I change plans anytime?',
                a: 'Yes, you can upgrade or downgrade your plan at any time. Changes take effect immediately.',
              },
              {
                q: 'Is there a free trial?',
                a: 'Yes, all plans come with a 14-day free trial. No credit card required.',
              },
              {
                q: 'What payment methods do you accept?',
                a: 'We accept all major credit cards, bank transfers, and wire payments for Enterprise plans.',
              },
              {
                q: 'Do you offer discounts for annual plans?',
                a: 'Yes, we offer 20% discount when you pay annually instead of monthly.',
              },
            ].map((faq, i) => (
              <div key={i} className="p-4 border border-slate-200 rounded-lg">
                <h3 className="font-bold text-slate-900 mb-2">{faq.q}</h3>
                <p className="text-slate-600 text-sm">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-blue-600 text-white">
        <div className="max-w-4xl mx-auto text-center space-y-6">
          <h2 className="text-3xl md:text-4xl font-bold">
            Ready to Get Started?
          </h2>
          <p className="text-lg text-blue-100">
            Join organizations that trust us with their staff management
          </p>
          <Link href="/contact">
            <Button size="lg" variant="secondary">
              Contact Us
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 py-8">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p>&copy; 2024 Nutrihealth Consult. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
