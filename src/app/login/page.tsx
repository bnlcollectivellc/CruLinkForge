'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Mail, Lock, Eye, EyeOff } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    // Simulate auth - in production, use NextAuth.js or similar
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Demo: admin@browningswelding.com goes to admin, others to order history
    if (email.includes('admin') || email.includes('browningswelding')) {
      router.push('/admin');
    } else if (email && password) {
      // Regular user would go to their order history
      router.push('/order/FOR-0045'); // Demo: redirect to sample order
    } else {
      setError('Please enter your email and password');
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-50 flex flex-col">
      {/* Navigation */}
      <nav className="bg-white border-b border-neutral-200">
        <div className="max-w-md mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center gap-3">
              <Image src="/logo.png" alt="Logo" width={40} height={40} className="h-10 w-auto" />
            </Link>
            <Link
              href="/"
              className="text-sm text-neutral-600 hover:text-neutral-900 flex items-center gap-1"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Home
            </Link>
          </div>
        </div>
      </nav>

      {/* Login Form */}
      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-2xl shadow-sm border border-neutral-200 p-8">
            <div className="text-center mb-8">
              <h1 className="text-2xl font-bold text-neutral-900 mb-2">Welcome Back</h1>
              <p className="text-neutral-600">Sign in to view your orders or manage your store</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="w-full pl-11 pr-4 py-3 border border-neutral-300 rounded-xl focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    className="w-full pl-11 pr-11 py-3 border border-neutral-300 rounded-xl focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 bg-[var(--color-primary)] text-white rounded-xl font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
              >
                {isLoading ? 'Signing in...' : 'Sign In'}
              </button>
            </form>

            <div className="mt-6 text-center">
              <Link
                href="/forgot-password"
                className="text-sm text-[var(--color-primary)] hover:underline"
              >
                Forgot your password?
              </Link>
            </div>

            <div className="mt-8 pt-6 border-t border-neutral-200">
              <p className="text-center text-sm text-neutral-500 mb-4">
                Don&apos;t have an account?
              </p>
              <Link
                href="/builder"
                className="block w-full py-3 border border-neutral-300 text-neutral-700 rounded-xl font-medium text-center hover:bg-neutral-50 transition-colors"
              >
                Get a Quote (No Account Needed)
              </Link>
            </div>
          </div>

          {/* Demo hint */}
          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-xl">
            <p className="text-sm text-blue-800">
              <strong>Demo:</strong> Use any email with &quot;admin&quot; to access the admin portal,
              or any other email to view customer order history.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
