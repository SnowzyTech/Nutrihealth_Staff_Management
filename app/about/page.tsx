import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Target, Lightbulb, Award } from 'lucide-react';

export const metadata = {
  title: 'About Us - Nutrihealth Consult',
  description: 'Learn about Nutrihealth Consult and our mission to revolutionize staff management.',
};

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
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-50 to-indigo-100 py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">About Nutrihealth Consult</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            We're on a mission to transform how organizations manage their staff through innovative,
            secure, and user-friendly solutions.
          </p>
        </div>
      </section>

      {/* Story Section */}
      <section className="py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Our Story</h2>
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
            <div className="bg-gradient-to-br from-blue-400 to-indigo-600 h-96 rounded-lg" />
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Our Values</h2>
            <p className="text-gray-600 text-lg">What drives us every day</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((value) => {
              const Icon = value.icon;
              return (
                <Card key={value.title}>
                  <CardHeader>
                    <Icon className="h-8 w-8 text-blue-600 mb-2" />
                    <CardTitle>{value.title}</CardTitle>
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
      <section className="py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Led by Experts</h2>
            <p className="text-gray-600 text-lg">A team passionate about transforming HR</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[1, 2, 3].map((i) => (
              <Card key={i}>
                <CardHeader>
                  <div className="h-32 bg-gradient-to-br from-blue-400 to-indigo-600 rounded-lg mb-4" />
                  <CardTitle>Team Member {i}</CardTitle>
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
      <section className="bg-gradient-to-r from-blue-600 to-indigo-600 py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">Ready to Transform Your HR?</h2>
          <p className="text-blue-100 mb-8 text-lg">
            Join organizations that are already using Nutrihealth Consult to streamline their operations.
          </p>
          <Link href="/contact">
            <Button size="lg" variant="secondary">
              Contact Us
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
