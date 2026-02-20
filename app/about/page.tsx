'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Target, Lightbulb, Award } from 'lucide-react';
import { PublicNavbar } from '@/components/public-navbar';
import { PublicFooter } from '@/components/public-footer';

export default function AboutPage() {
  const values = [
    {
      icon: Target,
      title: 'Focused',
      description: 'Dedicated to helping organizations manage staff effectively and efficiently.',
    },
    {
      icon: Lightbulb,
      title: 'Innovative',
      description: 'Leveraging modern technology to solve traditional HR challenges.',
    },
    {
      icon: Users,
      title: 'Collaborative',
      description: 'Building tools that bring teams together and improve communication.',
    },
    {
      icon: Award,
      title: 'Reliable',
      description: 'Providing secure, trustworthy solutions for sensitive HR data.',
    },
  ];

  return (
    <div className="min-h-screen bg-white">
      <PublicNavbar />
      
      {/* Hero Section */}
      <section className="bg-white py-20 pt-32 animate-fade-up">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-5xl font-bold text-[#43005F] mb-6">About Nutrihealth Consult</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            We're on a mission to transform how organizations manage their staff through innovative,
            secure, and user-friendly solutions.
          </p>
        </div>
      </section>

      {/* Story Section */}
      <section className="py-16 animate-fade-up-delay-1 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-[#43005F] mb-4">Our Story</h2>
              <p className="text-gray-600 mb-4">
                Founded in 2024, Nutrihealth Consult began with a simple vision: to make staff management
                simpler, more transparent, and more effective for organizations of all sizes.
              </p>
              <p className="text-gray-600 mb-4">
                Our team of experienced professionals in healthcare, HR, and technology came together to
                build a platform that addresses real challenges faced by modern organizations.
              </p>
              <p className="text-gray-600">
                Today, Nutrihealth Consult serves organizations across the healthcare sector, helping them
                streamline onboarding, training, and staff development processes.
              </p>
            </div>
            <div className="bg-gradient-to-br from-[#43005F] to-[#FE871F] h-96 rounded-lg" />
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-16 bg-white animate-fade-up-delay-2">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-[#43005F] mb-4">Our Values</h2>
            <p className="text-gray-600 text-lg">What drives us every day</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((value) => {
              const Icon = value.icon;
              return (
                <Card key={value.title} className="border-gray-200">
                  <CardHeader>
                    <Icon className="h-8 w-8 text-[#43005F] mb-2" />
                    <CardTitle className="text-[#43005F]">{value.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600">{value.description}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-16 animate-fade-up-delay-3 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-[#43005F] mb-4">Led by Experts</h2>
            <p className="text-gray-600 text-lg">A team passionate about transforming HR</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="border-gray-200">
                <CardHeader>
                  <div className="h-32 bg-gradient-to-br from-[#43005F] to-[#FE871F] rounded-lg mb-4" />
                  <CardTitle className="text-[#43005F]">Team Member {i}</CardTitle>
                  <CardDescription>Position</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">
                    Experienced professional with a passion for HR transformation and staff development.
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-[#43005F] py-16 animate-fade-up-delay-4">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">Ready to Transform Your HR?</h2>
          <p className="text-orange-100 mb-8 text-lg">
            Join organizations that are already using Nutrihealth Consult to streamline their operations.
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
