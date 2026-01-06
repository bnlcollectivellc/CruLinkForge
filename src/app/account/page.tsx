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
  Home,
  Menu,
  X,
  MapPin,
  Save,
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
  const [activeTab, setActiveTab] = useState('orders');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

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

  const handleSave = async () => {
    setIsSaving(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setIsSaving(false);
  };

  const navLinks = [
    { id: 'orders', icon: Package, label: 'Orders' },
    { id: 'profile', icon: User, label: 'Profile' },
    { id: 'addresses', icon: MapPin, label: 'Addresses' },
  ];

  if (!user) {
    return (
      <div className="min-h-screen bg-neutral-100 flex items-center justify-center">
        <div className="text-neutral-500">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-100 flex flex-col lg:flex-row">
      {/* Mobile Header */}
      <header className="lg:hidden bg-white border-b border-neutral-200 px-4 py-3 flex items-center justify-between sticky top-0 z-50">
        <Link href="/">
          <Image src="/logo.png" alt="Logo" width={36} height={36} className="h-9 w-auto" />
        </Link>
        <div className="flex items-center gap-2">
          {activeTab !== 'orders' && (
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="px-3 py-1.5 bg-[var(--color-primary)] text-white rounded-lg text-sm font-medium hover:opacity-90 disabled:opacity-50 flex items-center gap-1"
            >
              <Save className="w-4 h-4" />
              {isSaving ? 'Saving...' : 'Save'}
            </button>
          )}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 hover:bg-neutral-100 rounded-lg"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </header>

      {/* Mobile Navigation Dropdown */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-white border-b border-neutral-200 px-4 py-3">
          <nav className="space-y-1">
            {navLinks.map((link) => (
              <button
                key={link.id}
                onClick={() => { setActiveTab(link.id); setMobileMenuOpen(false); }}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg w-full ${
                  activeTab === link.id
                    ? 'bg-[var(--color-primary)] text-white'
                    : 'text-neutral-600 hover:bg-neutral-100'
                }`}
              >
                <link.icon className="w-5 h-5" />
                {link.label}
              </button>
            ))}
            <button
              onClick={handleSignOut}
              className="flex items-center gap-3 px-4 py-3 rounded-lg text-neutral-600 hover:bg-neutral-100 w-full"
            >
              <LogOut className="w-5 h-5" />
              Sign Out
            </button>
          </nav>
        </div>
      )}

      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex w-64 bg-white border-r border-neutral-200 flex-col shrink-0">
        <div className="p-6 border-b border-neutral-200">
          <Link href="/">
            <Image src="/logo.png" alt="Logo" width={48} height={48} className="h-12 w-auto hover:opacity-80 transition-opacity" />
          </Link>
          <p className="text-xs text-neutral-500 mt-2">Customer Portal</p>
        </div>

        {/* User Info */}
        <div className="p-4 border-b border-neutral-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[var(--color-primary)] rounded-full flex items-center justify-center text-white font-medium">
              {user.name?.charAt(0) || user.email.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className="font-medium text-neutral-900 truncate text-sm">{user.name || 'Customer'}</p>
              <p className="text-xs text-neutral-500 truncate">{user.email}</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-4">
          <ul className="space-y-1">
            {navLinks.map((link) => (
              <li key={link.id}>
                <button
                  onClick={() => setActiveTab(link.id)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg w-full ${
                    activeTab === link.id
                      ? 'bg-[var(--color-primary)] text-white'
                      : 'text-neutral-600 hover:bg-neutral-100'
                  }`}
                >
                  <link.icon className="w-5 h-5" />
                  {link.label}
                </button>
              </li>
            ))}
          </ul>
        </nav>

        <div className="p-4 border-t border-neutral-200">
          <button
            onClick={handleSignOut}
            className="flex items-center gap-3 px-4 py-3 rounded-lg text-neutral-600 hover:bg-neutral-100 w-full"
          >
            <LogOut className="w-5 h-5" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-4 lg:p-8 overflow-x-hidden">
        {/* Desktop Header */}
        <div className="hidden lg:flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-neutral-900">My Account</h1>
            <p className="text-neutral-600">Manage your orders and profile</p>
          </div>
          {activeTab !== 'orders' && (
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="px-6 py-2.5 bg-[var(--color-primary)] text-white rounded-lg font-medium hover:opacity-90 disabled:opacity-50 flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              {isSaving ? 'Saving...' : 'Save Changes'}
            </button>
          )}
        </div>

        {/* Content */}
        <div className="bg-white rounded-xl shadow-sm border border-neutral-200 p-4 sm:p-6">
            {/* Orders Tab */}
            {activeTab === 'orders' && (
              <div>
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-lg font-semibold text-neutral-900">Order History</h2>
                    <p className="text-sm text-neutral-500">View and track your orders</p>
                  </div>
                  <Link
                    href="/builder"
                    className="text-sm text-[var(--color-primary)] hover:underline font-medium"
                  >
                    + New Order
                  </Link>
                </div>

                {sampleOrders.length === 0 ? (
                  <div className="text-center py-12">
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
                          className="block bg-neutral-50 rounded-xl p-4 hover:bg-neutral-100 transition-colors"
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
                              </div>
                            </div>
                            <div className="flex items-center gap-2 sm:gap-4 shrink-0">
                              <div className="text-right">
                                <p className="font-semibold text-neutral-900">${order.total.toLocaleString('en-US', { minimumFractionDigits: 2 })}</p>
                                <p className="text-xs text-neutral-400 hidden sm:block">{new Date(order.date).toLocaleDateString()}</p>
                              </div>
                              <ChevronRight className="w-5 h-5 text-neutral-400" />
                            </div>
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* Profile Tab */}
            {activeTab === 'profile' && (
              <div>
                <div className="mb-6">
                  <h2 className="text-lg font-semibold text-neutral-900">Profile Information</h2>
                  <p className="text-sm text-neutral-500">Update your personal details</p>
                </div>

                <div className="space-y-6">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-16 h-16 bg-[var(--color-primary)] rounded-full flex items-center justify-center text-white text-2xl font-medium">
                      {user.name?.charAt(0) || user.email.charAt(0).toUpperCase()}
                    </div>
                    <button className="px-4 py-2 border border-neutral-300 text-neutral-700 rounded-lg text-sm font-medium hover:bg-neutral-50">
                      Change Photo
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-neutral-700 mb-2">Full Name</label>
                      <input
                        type="text"
                        defaultValue={user.name || ''}
                        placeholder="Enter your name"
                        className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-neutral-700 mb-2">Email</label>
                      <input
                        type="email"
                        defaultValue={user.email}
                        disabled
                        className="w-full px-4 py-3 border border-neutral-200 rounded-lg bg-neutral-50 text-neutral-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-neutral-700 mb-2">Phone</label>
                      <input
                        type="tel"
                        placeholder="(555) 123-4567"
                        className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-neutral-700 mb-2">Company (optional)</label>
                      <input
                        type="text"
                        placeholder="Your company name"
                        className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Addresses Tab */}
            {activeTab === 'addresses' && (
              <div>
                <div className="mb-6">
                  <h2 className="text-lg font-semibold text-neutral-900">Shipping Addresses</h2>
                  <p className="text-sm text-neutral-500">Manage your saved shipping addresses</p>
                </div>

                <div className="space-y-6">
                  <div className="border border-neutral-200 rounded-xl p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 bg-[var(--color-primary)] text-white text-xs font-medium rounded">Default</span>
                        <span className="text-sm font-medium text-neutral-900">Home</span>
                      </div>
                      <button className="text-sm text-[var(--color-primary)] hover:underline">Edit</button>
                    </div>
                    <p className="text-sm text-neutral-600">123 Main Street</p>
                    <p className="text-sm text-neutral-600">Conway, AR 72032</p>
                  </div>

                  <button className="w-full py-3 border-2 border-dashed border-neutral-300 rounded-xl text-neutral-500 hover:border-neutral-400 hover:text-neutral-600 transition-colors">
                    + Add New Address
                  </button>
                </div>
              </div>
            )}
        </div>
      </main>
    </div>
  );
}
