'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle2 } from 'lucide-react';
import { PublicNavbar } from '@/components/public-navbar';
import { PublicFooter } from '@/components/public-footer';

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
    <div className="min-h-screen bg-white">
      <PublicNavbar />

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 bg-white animate-fade-up">
        <div className="max-w-4xl mx-auto text-center space-y-6">
          <h1 className="text-5xl md:text-6xl font-bold text-[#43005F] text-balance">
            Simple, Transparent Pricing
          </h1>
          <p className="text-xl text-gray-600 text-balance">
            Choose the perfect plan for your organization. No hidden fees.
          </p>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="py-20 px-4 animate-fade-up-delay-1 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {plans.map((plan) => (
              <Card
                key={plan.name}
                className={`transition-all border-gray-200 ${
                  plan.featured ? 'ring-2 ring-[#FE871F] md:scale-105 shadow-lg' : ''
                }`}
              >
                <CardHeader>
                  <CardTitle className="text-[#43005F]">{plan.name}</CardTitle>
                  <CardDescription>{plan.description}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <div className="text-4xl font-bold text-[#43005F]">{plan.price}</div>
                    <p className="text-gray-600 text-sm">{plan.period}</p>
                  </div>

                  <ul className="space-y-3">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex items-start gap-3">
                        <CheckCircle2 className="h-5 w-5 text-[#FE871F] flex-shrink-0 mt-0.5" />
                        <span className="text-gray-700 text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <Link href="/contact">
                    <Button
                      className="w-full"
                      variant={plan.featured ? 'default' : 'outline'}
                      {...(plan.featured ? { className: 'w-full bg-[#FE871F] text-[#43005F] hover:bg-orange-600' } : { className: 'w-full border-[#FE871F] text-[#FE871F]' })}
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
      <section className="py-20 px-4 bg-white animate-fade-up-delay-2">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-[#43005F] mb-12">
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
              <div key={i} className="p-4 border border-gray-200 rounded-lg">
                <h3 className="font-bold text-[#43005F] mb-2">{faq.q}</h3>
                <p className="text-gray-600 text-sm">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-[#43005F] text-white animate-fade-up-delay-3">
        <div className="max-w-4xl mx-auto text-center space-y-6">
          <h2 className="text-3xl md:text-4xl font-bold">
            Ready to Get Started?
          </h2>
          <p className="text-lg text-orange-100">
            Join organizations that trust us with their staff management
          </p>
          <Link href="/contact">
            <Button size="lg" variant="secondary" className="bg-[#FE871F] text-[#43005F] hover:bg-orange-600">
              Contact Us
            </Button>
          </Link>
        </div>
      </section>

      <PublicFooter />
    </div>
  );
}
