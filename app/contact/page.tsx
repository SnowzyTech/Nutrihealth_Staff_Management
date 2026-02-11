'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Mail, Phone, MapPin } from 'lucide-react';
import { PublicNavbar } from '@/components/public-navbar';
import { PublicFooter } from '@/components/public-footer';

export default function ContactPage() {
  const contacts = [
    {
      icon: Mail,
      title: 'Email',
      value: 'support@nutrihealthconsult.com',
      description: 'We respond within 24 hours',
    },
    {
      icon: Phone,
      title: 'Phone',
      value: '+1 (555) 123-4567',
      description: 'Available 9AM - 5PM EST',
    },
    {
      icon: MapPin,
      title: 'Location',
      value: 'New York, USA',
      description: 'Serving global clients',
    },
  ];

  return (
    <div className="min-h-screen bg-white">
      <PublicNavbar />
      
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-50 to-indigo-100 py-20 pt-32 animate-fade-up opacity-0 [animation-delay:200ms] [animation-fill-mode:forwards]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">Get in Touch</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Have questions about Nutrihealth Consult? We would love to hear from you. Send us a message
            and we will respond as soon as possible.
          </p>
        </div>
      </section>

      {/* Contact Info Section */}
      <section className="py-16 animate-fade-up opacity-0 [animation-delay:400ms] [animation-fill-mode:forwards]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-8 mb-16">
            {contacts.map((contact) => {
              const Icon = contact.icon;
              return (
                <Card key={contact.title}>
                  <CardHeader>
                    <Icon className="h-8 w-8 text-blue-600 mb-2" />
                    <CardTitle>{contact.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="font-semibold text-gray-900">{contact.value}</p>
                    <p className="text-sm text-gray-600 mt-2">{contact.description}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Contact Form */}
          <div className="max-w-2xl mx-auto">
            <Card>
              <CardHeader>
                <CardTitle>Send us a Message</CardTitle>
              </CardHeader>
              <CardContent>
                <form className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Full Name</Label>
                      <Input id="name" placeholder="Your name" required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email Address</Label>
                      <Input id="email" type="email" placeholder="your@email.com" required />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="subject">Subject</Label>
                    <Input id="subject" placeholder="How can we help?" required />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="message">Message</Label>
                    <textarea
                      id="message"
                      placeholder="Tell us more about your inquiry..."
                      rows={6}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>

                  <Button type="submit" className="w-full">
                    Send Message
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 bg-gray-50 animate-fade-up opacity-0 [animation-delay:600ms] [animation-fill-mode:forwards]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Frequently Asked Questions</h2>
            <p className="text-gray-600 text-lg">Find answers to common questions</p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {[
              {
                q: 'How quickly can we get started?',
                a: 'Most organizations are up and running within 1-2 weeks of sign-up.',
              },
              {
                q: 'Is there a free trial available?',
                a: 'Yes, we offer a 14-day free trial for all new accounts.',
              },
              {
                q: 'How secure is the platform?',
                a: 'We use enterprise-grade security with encryption and regular audits.',
              },
              {
                q: 'Do you offer customer support?',
                a: 'Yes, we provide 24/7 email support and phone support during business hours.',
              },
            ].map((faq, i) => (
              <Card key={i}>
                <CardHeader>
                  <CardTitle className="text-lg">{faq.q}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">{faq.a}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <PublicFooter />
    </div>
  );
}
