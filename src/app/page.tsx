'use client';

import { useState, useEffect, useRef, useCallback, Suspense } from 'react';
import dynamic from 'next/dynamic';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowRight, Upload, User, LogOut, Package, ChevronDown, Wrench, PenTool, MessageSquare } from 'lucide-react';

// Dynamically import 3D background to avoid SSR issues
const Landing3DBackground = dynamic(() => import('@/components/3d/Landing3DBackground'), {
  ssr: false,
  loading: () => null,
});

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

  // Storefront settings with defaults
  const [heroHeading, setHeroHeading] = useState('Custom Metal Parts,');
  const [heroAccent, setHeroAccent] = useState('Instant Quotes');
  const [heroSubheading, setHeroSubheading] = useState('Get precision-cut metal parts fabricated to your exact specifications. Use our template builder or upload your CAD files for an instant quote.');

  // Check for logged in user and load storefront settings on mount
  useEffect(() => {
    const userData = localStorage.getItem('forge_user');
    if (userData) {
      setUser(JSON.parse(userData));
    }

    // Load storefront settings
    const savedStorefront = localStorage.getItem('forge_storefront');
    if (savedStorefront) {
      const settings = JSON.parse(savedStorefront);
      if (settings.heroHeading) setHeroHeading(settings.heroHeading);
      if (settings.heroAccent) setHeroAccent(settings.heroAccent);
      if (settings.heroSubheading) setHeroSubheading(settings.heroSubheading);
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
    <div className="h-screen bg-white overflow-hidden flex flex-col relative">
      {/* 3D Background */}
      <div className="absolute inset-0 z-0">
        <Suspense fallback={null}>
          <Landing3DBackground />
        </Suspense>
      </div>

      {/* Content Overlay */}
      <div className="relative z-10 flex flex-col h-full">
        {/* Navigation */}
        <nav className="bg-white/80 backdrop-blur-md border-b border-neutral-200 shrink-0">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
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
                      className="flex items-center gap-2 text-sm text-neutral-700 hover:text-neutral-900 transition-colors"
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
                    className="text-sm text-neutral-700 hover:text-neutral-900 transition-colors"
                  >
                    Login
                  </Link>
                )}
              </div>
            </div>
          </div>
        </nav>

        {/* Main Content - Centered */}
        <main className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl w-full">
            <div className="text-center">
              {/* Hero Text */}
              <h1 className="text-[40px] sm:text-[52px] lg:text-[66px] font-bold text-neutral-900 mb-4 leading-tight">
                {heroHeading}
                <br />
                <span className="text-[var(--color-primary)]">{heroAccent}</span>
              </h1>
              <p className="text-xl text-neutral-600 mb-8 max-w-2xl mx-auto">
                {heroSubheading}
              </p>

                {/* Three Option Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                  {optionCards.map((card) => (
                    <Link
                      key={card.id}
                      href={card.href}
                      className="group bg-white hover:bg-[var(--color-primary)] border border-neutral-200 hover:border-[var(--color-primary)] rounded-xl p-6 transition-all duration-200 shadow-sm flex flex-col h-full"
                    >
                      <div className="w-14 h-14 bg-neutral-100 group-hover:bg-white rounded-lg flex items-center justify-center transition-colors mb-4">
                        <card.icon className="w-7 h-7 text-[var(--color-primary)]" />
                      </div>
                      <h3 className="font-semibold text-neutral-900 group-hover:text-white mb-2 text-lg transition-colors">{card.title}</h3>
                      <p className="text-[15px] text-neutral-500 group-hover:text-white/80 transition-colors flex-1">{card.description}</p>
                      <div className="mt-4 text-[var(--color-primary)] group-hover:text-white text-base font-medium flex items-center gap-1 transition-colors">
                        <ArrowRight className="w-5 h-5" />
                      </div>
                    </Link>
                  ))}
                </div>

                {/* Drop Zone */}
                <div
                  ref={dropZoneRef}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  className={`group relative rounded-xl border-2 border-dashed p-4 text-center transition-all cursor-pointer ${
                    isDragging
                      ? 'border-[var(--color-primary)] bg-[var(--color-primary)]/10'
                      : 'border-neutral-300 bg-neutral-50 hover:border-[var(--color-primary)] hover:bg-[var(--color-primary)]/5'
                  }`}
                  onClick={handleBrowseFiles}
                >
                  <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                    <Upload className="w-7 h-7 text-neutral-400 group-hover:text-[var(--color-primary)] transition-colors" />
                    <div className="text-center sm:text-left">
                      <p className="text-neutral-700 group-hover:text-[var(--color-primary)] text-base font-medium transition-colors">
                        Drop files here for a custom quote
                      </p>
                      <p className="text-neutral-400 text-sm">
                        .ai .dxf .dwg .eps .stp .step
                      </p>
                    </div>
                    <button
                      onClick={(e) => { e.stopPropagation(); handleBrowseFiles(); }}
                      className="px-5 py-2.5 bg-[var(--color-primary)] text-white rounded-lg font-medium hover:opacity-90 transition-colors text-base"
                    >
                      BROWSE
                    </button>
                  </div>
                </div>

              {/* Security Note */}
              <p className="text-neutral-400 text-sm mt-3">
                Your design is safe! Files are secure and you retain 100% of intellectual property.
              </p>
            </div>
          </div>
        </main>

        {/* Footer - Minimal */}
        <footer className="py-4 px-4 bg-white/80 backdrop-blur-md border-t border-neutral-200 shrink-0">
          <div className="max-w-6xl mx-auto flex items-center justify-between text-xs text-neutral-500">
            <span>Powered by CruLink: Forge</span>
            <div className="flex gap-4">
              <Link href="#" className="hover:text-neutral-900">Terms</Link>
              <Link href="#" className="hover:text-neutral-900">Privacy</Link>
              <Link href="#" className="hover:text-neutral-900">Contact</Link>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
