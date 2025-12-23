'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Package,
  Clock,
  Truck,
  CheckCircle,
  ChevronRight,
  LogOut,
  User,
  Settings,
  ArrowLeft,
  X,
} from 'lucide-react';

// Sample orders data (would come from API)
const sampleOrders = [
  {
    id: 'FOR-0045',
    status: 'new',
    date: '2024-12-23',
    items: 'Mounting Plate × 50',
    total: 1908.61,
  },
  {
    id: 'FOR-0043',
    status: 'shipped',
    date: '2024-12-21',
    items: 'U-Channel × 25',
    total: 1250.00,
    trackingNumber: '1Z999AA10123456784',
  },
  {
    id: 'FOR-0042',
    status: 'delivered',
    date: '2024-12-18',
    items: 'Gusset Plate × 200',
    total: 4800.00,
  },
  {
    id: 'FOR-0038',
    status: 'delivered',
    date: '2024-12-10',
    items: 'L-Bracket × 100',
    total: 3200.00,
  },
];

const statusConfig: Record<string, { icon: typeof Package; color: string; bgColor: string; label: string }> = {
  new: { icon: Clock, color: 'text-blue-600', bgColor: 'bg-blue-100', label: 'Processing' },
  accepted: { icon: Clock, color: 'text-blue-600', bgColor: 'bg-blue-100', label: 'Accepted' },
  production: { icon: Package, color: 'text-purple-600', bgColor: 'bg-purple-100', label: 'In Production' },
  shipped: { icon: Truck, color: 'text-orange-600', bgColor: 'bg-orange-100', label: 'Shipped' },
  delivered: { icon: CheckCircle, color: 'text-green-600', bgColor: 'bg-green-100', label: 'Delivered' },
};

export default function AccountPage() {
  const router = useRouter();
  const [user, setUser] = useState<{ email: string; name: string } | null>(null);
  const [activeTab, setActiveTab] = useState<'orders' | 'settings'>('orders');

  useEffect(() => {
    // Check for logged in user
    const userData = localStorage.getItem('forge_user');
    if (userData) {
      setUser(JSON.parse(userData));
    } else {
      // Redirect to login if not logged in
      router.push('/login');
    }
  }, [router]);

  const handleSignOut = () => {
    localStorage.removeItem('forge_user');
    router.push('/');
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-neutral-100 flex items-center justify-center">
        <div className="text-neutral-500">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-100">
      {/* Header */}
      <header className="bg-white border-b border-neutral-200 sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center gap-3">
              <Image src="/logo.png" alt="Logo" width={40} height={40} className="h-10 w-auto" />
            </Link>
            <div className="flex items-center gap-3">
              <Link
                href="/"
                className="text-sm text-neutral-600 hover:text-neutral-900 flex items-center gap-1"
              >
                <ArrowLeft className="w-4 h-4" />
                <span className="hidden sm:inline">Back to Store</span>
              </Link>
              <button
                onClick={handleSignOut}
                className="flex items-center gap-2 px-3 py-1.5 text-sm text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 rounded-lg transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">Sign Out</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {/* User Info */}
        <div className="bg-white rounded-xl border border-neutral-200 p-4 sm:p-6 mb-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 sm:w-14 sm:h-14 bg-[var(--color-primary)] rounded-full flex items-center justify-center text-white text-lg sm:text-xl font-semibold">
              {user.name?.charAt(0) || user.email.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="text-lg sm:text-xl font-semibold text-neutral-900 truncate">
                {user.name || 'Welcome back!'}
              </h1>
              <p className="text-sm text-neutral-500 truncate">{user.email}</p>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setActiveTab('orders')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeTab === 'orders'
                ? 'bg-[var(--color-primary)] text-white'
                : 'bg-white text-neutral-600 border border-neutral-200 hover:bg-neutral-50'
            }`}
          >
            <Package className="w-4 h-4" />
            My Orders
          </button>
          <button
            onClick={() => setActiveTab('settings')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeTab === 'settings'
                ? 'bg-[var(--color-primary)] text-white'
                : 'bg-white text-neutral-600 border border-neutral-200 hover:bg-neutral-50'
            }`}
          >
            <Settings className="w-4 h-4" />
            Settings
          </button>
        </div>

        {/* Orders Tab */}
        {activeTab === 'orders' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-neutral-900">Order History</h2>
              <Link
                href="/builder"
                className="text-sm text-[var(--color-primary)] hover:underline font-medium"
              >
                + New Order
              </Link>
            </div>

            {sampleOrders.length === 0 ? (
              <div className="bg-white rounded-xl border border-neutral-200 p-8 text-center">
                <Package className="w-12 h-12 text-neutral-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-neutral-900 mb-2">No orders yet</h3>
                <p className="text-neutral-500 mb-4">Start by creating your first custom part order.</p>
                <Link
                  href="/builder"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-[var(--color-primary)] text-white rounded-lg font-medium hover:opacity-90"
                >
                  Get Started
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {sampleOrders.map((order) => {
                  const status = statusConfig[order.status] || statusConfig.new;
                  const StatusIcon = status.icon;

                  return (
                    <Link
                      key={order.id}
                      href={`/order/${order.id}`}
                      className="block bg-white rounded-xl border border-neutral-200 p-4 hover:border-neutral-300 hover:shadow-sm transition-all"
                    >
                      <div className="flex items-center justify-between gap-4">
                        <div className="flex items-center gap-3 sm:gap-4 min-w-0 flex-1">
                          <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl ${status.bgColor} flex items-center justify-center shrink-0`}>
                            <StatusIcon className={`w-5 h-5 sm:w-6 sm:h-6 ${status.color}`} />
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-semibold text-neutral-900 text-sm sm:text-base">{order.id}</span>
                              <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${status.bgColor} ${status.color}`}>
                                {status.label}
                              </span>
                            </div>
                            <p className="text-sm text-neutral-500 truncate mt-0.5">{order.items}</p>
                            <p className="text-xs text-neutral-400 mt-0.5 sm:hidden">
                              {new Date(order.date).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 sm:gap-4 shrink-0">
                          <div className="text-right hidden sm:block">
                            <p className="font-semibold text-neutral-900">${order.total.toLocaleString('en-US', { minimumFractionDigits: 2 })}</p>
                            <p className="text-xs text-neutral-400">{new Date(order.date).toLocaleDateString()}</p>
                          </div>
                          <p className="font-semibold text-neutral-900 sm:hidden">${order.total.toLocaleString('en-US', { minimumFractionDigits: 2 })}</p>
                          <ChevronRight className="w-5 h-5 text-neutral-400" />
                        </div>
                      </div>
                      {order.trackingNumber && (
                        <div className="mt-3 pt-3 border-t border-neutral-100">
                          <p className="text-xs text-neutral-500">
                            Tracking: <span className="font-medium text-neutral-700">{order.trackingNumber}</span>
                          </p>
                        </div>
                      )}
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Settings Tab */}
        {activeTab === 'settings' && (
          <div className="space-y-6">
            <h2 className="text-lg font-semibold text-neutral-900">Account Settings</h2>

            <div className="bg-white rounded-xl border border-neutral-200 divide-y divide-neutral-200">
              <div className="p-4 sm:p-6">
                <h3 className="text-sm font-medium text-neutral-900 mb-4">Profile Information</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm text-neutral-600 mb-1">Full Name</label>
                    <input
                      type="text"
                      defaultValue={user.name || ''}
                      placeholder="Enter your name"
                      className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-neutral-600 mb-1">Email</label>
                    <input
                      type="email"
                      defaultValue={user.email}
                      disabled
                      className="w-full px-3 py-2 border border-neutral-200 rounded-lg bg-neutral-50 text-neutral-500 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-neutral-600 mb-1">Phone</label>
                    <input
                      type="tel"
                      placeholder="(555) 123-4567"
                      className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent text-sm"
                    />
                  </div>
                </div>
              </div>

              <div className="p-4 sm:p-6">
                <h3 className="text-sm font-medium text-neutral-900 mb-4">Default Shipping Address</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm text-neutral-600 mb-1">Street Address</label>
                    <input
                      type="text"
                      placeholder="123 Main St"
                      className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent text-sm"
                    />
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div className="col-span-2 sm:col-span-2">
                      <label className="block text-sm text-neutral-600 mb-1">City</label>
                      <input
                        type="text"
                        placeholder="City"
                        className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-neutral-600 mb-1">State</label>
                      <input
                        type="text"
                        placeholder="ST"
                        className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-neutral-600 mb-1">ZIP</label>
                      <input
                        type="text"
                        placeholder="12345"
                        className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent text-sm"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-4 sm:p-6">
                <button className="w-full sm:w-auto px-6 py-2 bg-[var(--color-primary)] text-white rounded-lg font-medium hover:opacity-90 transition-opacity">
                  Save Changes
                </button>
              </div>
            </div>

            {/* Danger Zone */}
            <div className="bg-white rounded-xl border border-red-200 p-4 sm:p-6">
              <h3 className="text-sm font-medium text-red-600 mb-2">Danger Zone</h3>
              <p className="text-sm text-neutral-500 mb-4">
                Once you delete your account, there is no going back. Please be certain.
              </p>
              <button className="px-4 py-2 border border-red-300 text-red-600 rounded-lg text-sm font-medium hover:bg-red-50">
                Delete Account
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
