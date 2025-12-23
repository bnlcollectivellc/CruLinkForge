'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowRight, Upload, Zap, Shield, Clock, User, LogOut, Package, ChevronDown, Wrench, PenTool, MessageSquare } from 'lucide-react';

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

const optionCards = [
  {
    id: 'builder',
    icon: Wrench,
    title: 'Sheet Metal Parts Builder',
    description: 'Customize one of our simple parts templates',
    href: '/builder',
  },
  {
    id: 'design',
    icon: PenTool,
    title: 'Try our Design Services',
    description: "Send us a sketch or template and we'll create a file",
    href: '/design-services',
  },
  {
    id: 'quote',
    icon: MessageSquare,
    title: 'Request a Custom Quote',
    description: 'For projects with unique needs or requirements',
    href: '/quote',
  },
];

export default function LandingPage() {
  const router = useRouter();
  const [user, setUser] = useState<{ email: string; name: string; role: string } | null>(null);
  const [showAccountMenu, setShowAccountMenu] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const dropZoneRef = useRef<HTMLDivElement>(null);

  // Check for logged in user on mount
  useEffect(() => {
    const userData = localStorage.getItem('forge_user');
    if (userData) {
      setUser(JSON.parse(userData));
    }
  }, []);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowAccountMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSignOut = () => {
    localStorage.removeItem('forge_user');
    setUser(null);
    setShowAccountMenu(false);
  };

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      // Store files info in session and redirect to quote page
      const fileNames = files.map(f => f.name).join(',');
      router.push(`/quote?files=${encodeURIComponent(fileNames)}`);
    }
  }, [router]);

  const handleBrowseFiles = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.multiple = true;
    input.accept = '.ai,.dxf,.dwg,.eps,.stp,.step';
    input.onchange = (e) => {
      const files = Array.from((e.target as HTMLInputElement).files || []);
      if (files.length > 0) {
        const fileNames = files.map(f => f.name).join(',');
        router.push(`/quote?files=${encodeURIComponent(fileNames)}`);
      }
    };
    input.click();
  };

  return (
    <div className="min-h-screen bg-neutral-900">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-neutral-900/95 backdrop-blur-md border-b border-neutral-800">
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
              {user ? (
                <div className="relative" ref={menuRef}>
                  <button
                    onClick={() => setShowAccountMenu(!showAccountMenu)}
                    className="flex items-center gap-2 text-sm text-neutral-300 hover:text-white transition-colors"
                  >
                    <div className="w-8 h-8 bg-[var(--color-primary)] rounded-full flex items-center justify-center text-white text-sm font-medium">
                      {user.name?.charAt(0) || user.email.charAt(0).toUpperCase()}
                    </div>
                    <span className="hidden sm:inline">{user.name || 'My Account'}</span>
                    <ChevronDown className={`w-4 h-4 transition-transform ${showAccountMenu ? 'rotate-180' : ''}`} />
                  </button>

                  {/* Account Dropdown Menu */}
                  {showAccountMenu && (
                    <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-neutral-200 py-2 z-50">
                      <div className="px-4 py-2 border-b border-neutral-100">
                        <p className="text-sm font-medium text-neutral-900 truncate">{user.name || user.email}</p>
                        <p className="text-xs text-neutral-500 truncate">{user.email}</p>
                      </div>

                      {user.role === 'admin' ? (
                        <Link
                          href="/admin"
                          className="flex items-center gap-3 px-4 py-2.5 text-sm text-neutral-700 hover:bg-neutral-50"
                          onClick={() => setShowAccountMenu(false)}
                        >
                          <User className="w-4 h-4" />
                          Admin Dashboard
                        </Link>
                      ) : (
                        <>
                          <Link
                            href="/account"
                            className="flex items-center gap-3 px-4 py-2.5 text-sm text-neutral-700 hover:bg-neutral-50"
                            onClick={() => setShowAccountMenu(false)}
                          >
                            <Package className="w-4 h-4" />
                            My Orders
                          </Link>
                          <Link
                            href="/account"
                            className="flex items-center gap-3 px-4 py-2.5 text-sm text-neutral-700 hover:bg-neutral-50"
                            onClick={() => setShowAccountMenu(false)}
                          >
                            <User className="w-4 h-4" />
                            Account Settings
                          </Link>
                        </>
                      )}

                      <div className="border-t border-neutral-100 mt-1 pt-1">
                        <button
                          onClick={handleSignOut}
                          className="flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 w-full"
                        >
                          <LogOut className="w-4 h-4" />
                          Sign Out
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <Link
                  href="/login"
                  className="text-sm text-neutral-300 hover:text-white transition-colors"
                >
                  Login
                </Link>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section with Drop Zone */}
      <section className="pt-24 pb-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          {/* Tagline */}
          <p className="text-center text-neutral-400 mb-6">or choose how to start</p>

          {/* Drop Zone */}
          <div
            ref={dropZoneRef}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`relative rounded-2xl border-2 border-dashed p-12 sm:p-16 text-center transition-all ${
              isDragging
                ? 'border-[var(--color-primary)] bg-red-500/10'
                : 'border-neutral-600 bg-neutral-800/50 hover:border-neutral-500'
            }`}
          >
            <Upload className="w-12 h-12 text-neutral-500 mx-auto mb-4" />
            <h2 className="text-xl sm:text-2xl font-semibold text-white mb-2">
              Drop up to 10 files here to get started
            </h2>
            <p className="text-neutral-400 mb-6">or</p>
            <button
              onClick={handleBrowseFiles}
              className="px-8 py-3 bg-[var(--color-primary)] text-white rounded-lg font-semibold hover:opacity-90 transition-opacity"
            >
              BROWSE FILES
            </button>
            <p className="text-neutral-500 text-sm mt-4">
              .ai .dxf .dwg .eps .stp .step
            </p>
          </div>

          {/* Security Message */}
          <p className="text-center text-neutral-500 text-sm mt-4">
            Your design is safe! Any design uploaded is secure, and you retain 100% of the intellectual property.
          </p>
        </div>
      </section>

      {/* Three Option Cards */}
      <section className="py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {optionCards.map((card) => (
              <Link
                key={card.id}
                href={card.href}
                className="group bg-neutral-800/50 hover:bg-neutral-800 border border-neutral-700 rounded-xl p-6 transition-all hover:border-neutral-600"
              >
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-neutral-700 group-hover:bg-[var(--color-primary)] rounded-lg flex items-center justify-center transition-colors">
                    <card.icon className="w-5 h-5 text-neutral-300 group-hover:text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-white mb-1">{card.title}</h3>
                    <p className="text-sm text-neutral-400">{card.description}</p>
                    <div className="mt-3 text-[var(--color-primary)] text-sm font-medium flex items-center gap-1 group-hover:gap-2 transition-all">
                      <ArrowRight className="w-4 h-4" />
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {/* Pricing Note */}
          <p className="text-center text-neutral-500 text-sm mt-6">
            Note: Pricing examples are general estimates. Upload your file for instant current pricing.
          </p>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 border-t border-neutral-800">
        <div className="max-w-4xl mx-auto">
          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature) => (
              <div key={feature.title} className="text-center">
                <div className="w-14 h-14 mx-auto mb-4 bg-neutral-800 rounded-xl flex items-center justify-center">
                  <feature.icon className="w-7 h-7 text-[var(--color-primary)]" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">{feature.title}</h3>
                <p className="text-neutral-400 text-sm">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 sm:px-6 lg:px-8 border-t border-neutral-800">
        <div className="max-w-4xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <Image
              src="/logo.png"
              alt="Logo"
              width={40}
              height={40}
              className="h-10 w-auto opacity-75"
            />
            <p className="text-sm text-neutral-500">
              Powered by CruLink: Forge
            </p>
            <div className="flex gap-6 text-sm text-neutral-500">
              <Link href="#" className="hover:text-neutral-300">Terms</Link>
              <Link href="#" className="hover:text-neutral-300">Privacy</Link>
              <Link href="#" className="hover:text-neutral-300">Contact</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
