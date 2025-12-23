'use client';

import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, Upload, Layers, Zap, Shield, Clock, CheckCircle } from 'lucide-react';

const steps = [
  {
    number: '1',
    title: 'Design Your Part',
    description: 'Use our template builder or upload your CAD file',
    icon: Layers,
  },
  {
    number: '2',
    title: 'Get Instant Quote',
    description: 'See real-time pricing as you customize',
    icon: Zap,
  },
  {
    number: '3',
    title: 'We Fabricate',
    description: 'Professional quality, delivered to your door',
    icon: CheckCircle,
  },
];

const features = [
  {
    icon: Clock,
    title: 'Fast Turnaround',
    description: 'Most orders ship within 5-10 business days',
  },
  {
    icon: Shield,
    title: 'Quality Guaranteed',
    description: 'Precision cutting and professional finishing',
  },
  {
    icon: Zap,
    title: 'Instant Quotes',
    description: 'Know your price before you order',
  },
];

const templates = [
  { name: 'Mounting Plates', image: '/images/templates/mounting-plate.png' },
  { name: 'L-Brackets', image: '/images/templates/l-bracket.png' },
  { name: 'U-Channels', image: '/images/templates/u-channel.png' },
  { name: 'Enclosure Panels', image: '/images/templates/enclosure.png' },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-md border-b border-neutral-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Image
              src="/logo.png"
              alt="Logo"
              width={48}
              height={48}
              className="h-12 w-auto"
            />
            <div className="flex items-center gap-4">
              <Link
                href="/login"
                className="text-sm text-neutral-600 hover:text-neutral-900 transition-colors"
              >
                Login
              </Link>
              <Link
                href="/builder"
                className="px-4 py-2 bg-[var(--color-primary)] text-white rounded-lg text-sm font-medium hover:opacity-90 transition-opacity"
              >
                Get a Quote
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-neutral-900 leading-tight">
                Custom Metal Parts,{' '}
                <span className="text-[var(--color-primary)]">Instant Quotes</span>
              </h1>
              <p className="mt-6 text-lg text-neutral-600 leading-relaxed">
                Get precision-cut metal parts fabricated to your exact specifications.
                Use our template builder or upload your CAD files for an instant quote.
              </p>
              <div className="mt-8 flex flex-col sm:flex-row gap-4">
                <Link
                  href="/builder"
                  className="inline-flex items-center justify-center gap-2 px-6 py-4 bg-[var(--color-primary)] text-white rounded-xl text-base font-semibold hover:opacity-90 transition-opacity"
                >
                  Start with Template
                  <ArrowRight className="w-5 h-5" />
                </Link>
                <Link
                  href="/upload"
                  className="inline-flex items-center justify-center gap-2 px-6 py-4 bg-neutral-100 text-neutral-900 rounded-xl text-base font-semibold hover:bg-neutral-200 transition-colors"
                >
                  <Upload className="w-5 h-5" />
                  Upload CAD File
                </Link>
              </div>
              <p className="mt-4 text-sm text-neutral-500">
                No account required. Get your quote in minutes.
              </p>
            </div>
            <div className="relative">
              <div className="aspect-square bg-neutral-100 rounded-2xl overflow-hidden">
                {/* 3D Preview or Hero Image */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <div className="w-32 h-32 mx-auto mb-4 bg-neutral-200 rounded-xl flex items-center justify-center">
                      <Layers className="w-16 h-16 text-neutral-400" />
                    </div>
                    <p className="text-neutral-500">3D Part Preview</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-neutral-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-neutral-900">
              How It Works
            </h2>
            <p className="mt-4 text-lg text-neutral-600">
              From design to delivery in three simple steps
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {steps.map((step) => (
              <div
                key={step.number}
                className="relative bg-white rounded-2xl p-8 shadow-sm border border-neutral-200"
              >
                <div className="w-12 h-12 bg-[var(--color-primary)] text-white rounded-xl flex items-center justify-center text-xl font-bold mb-6">
                  {step.number}
                </div>
                <h3 className="text-xl font-semibold text-neutral-900 mb-2">
                  {step.title}
                </h3>
                <p className="text-neutral-600">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Template Gallery */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-neutral-900">
              Popular Templates
            </h2>
            <p className="mt-4 text-lg text-neutral-600">
              Start with a template and customize to your needs
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {templates.map((template) => (
              <Link
                key={template.name}
                href="/builder"
                className="group bg-neutral-100 rounded-xl p-6 hover:bg-neutral-200 transition-colors"
              >
                <div className="aspect-square bg-white rounded-lg mb-4 flex items-center justify-center">
                  <Layers className="w-16 h-16 text-neutral-300 group-hover:text-[var(--color-primary)] transition-colors" />
                </div>
                <h3 className="text-center font-medium text-neutral-900">
                  {template.name}
                </h3>
              </Link>
            ))}
          </div>
          <div className="text-center mt-12">
            <Link
              href="/builder"
              className="inline-flex items-center gap-2 text-[var(--color-primary)] font-medium hover:underline"
            >
              View all templates
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-neutral-900 text-white">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature) => (
              <div key={feature.title} className="text-center">
                <div className="w-16 h-16 mx-auto mb-6 bg-white/10 rounded-xl flex items-center justify-center">
                  <feature.icon className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-neutral-400">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-neutral-900">
            Ready to Get Started?
          </h2>
          <p className="mt-4 text-lg text-neutral-600">
            Get your instant quote today. No account required.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/builder"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-[var(--color-primary)] text-white rounded-xl text-base font-semibold hover:opacity-90 transition-opacity"
            >
              Start Building
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link
              href="/upload"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-neutral-100 text-neutral-900 rounded-xl text-base font-semibold hover:bg-neutral-200 transition-colors"
            >
              Upload Design
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 sm:px-6 lg:px-8 border-t border-neutral-200">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <Image
              src="/logo.png"
              alt="Logo"
              width={40}
              height={40}
              className="h-10 w-auto"
            />
            <p className="text-sm text-neutral-500">
              Powered by CruLink: Forge
            </p>
            <div className="flex gap-6 text-sm text-neutral-600">
              <Link href="#" className="hover:text-neutral-900">Terms</Link>
              <Link href="#" className="hover:text-neutral-900">Privacy</Link>
              <Link href="#" className="hover:text-neutral-900">Contact</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
