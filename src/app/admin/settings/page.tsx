'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  LayoutDashboard,
  Package,
  Settings,
  Building2,
  DollarSign,
  Clock,
  Bell,
  Users,
  LogOut,
  Save,
  Upload,
  Store,
  ImageIcon,
  Type,
  Eye,
  Layers,
} from 'lucide-react';

export default function AdminSettingsPage() {
  const [activeTab, setActiveTab] = useState('storefront');
  const [isSaving, setIsSaving] = useState(false);

  // Company settings
  const [companyName, setCompanyName] = useState("Browning's Welding & Fabrication");
  const [email, setEmail] = useState('orders@browningswelding.com');
  const [phone, setPhone] = useState('(501) 555-0123');
  const [address, setAddress] = useState('123 Industrial Blvd');
  const [city, setCity] = useState('Conway');
  const [state, setState] = useState('AR');
  const [zip, setZip] = useState('72032');

  // Lead times
  const [standardLeadTime, setStandardLeadTime] = useState('10');
  const [rushLeadTime, setRushLeadTime] = useState('5');
  const [superRushLeadTime, setSuperRushLeadTime] = useState('3');

  // Notifications
  const [emailNewOrders, setEmailNewOrders] = useState(true);
  const [emailMessages, setEmailMessages] = useState(true);
  const [emailPayments, setEmailPayments] = useState(true);

  // Storefront settings
  const [heroHeading, setHeroHeading] = useState('Custom Metal Parts,');
  const [heroAccent, setHeroAccent] = useState('Instant Quotes');
  const [heroSubheading, setHeroSubheading] = useState('Get precision-cut metal parts fabricated to your exact specifications. Use our template builder or upload your CAD files for an instant quote.');
  const [heroImageUrl, setHeroImageUrl] = useState('/images/hero-fabrication.jpg');
  const [ctaButtonText, setCtaButtonText] = useState('Start with Template');
  const [ctaSecondaryText, setCtaSecondaryText] = useState('Upload CAD File');

  const handleSave = async () => {
    setIsSaving(true);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setIsSaving(false);
  };

  const tabs = [
    { id: 'storefront', label: 'Storefront', icon: Store },
    { id: 'company', label: 'Company Profile', icon: Building2 },
    { id: 'pricing', label: 'Pricing', icon: DollarSign },
    { id: 'leadtimes', label: 'Lead Times', icon: Clock },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'users', label: 'Users', icon: Users },
  ];

  return (
    <div className="min-h-screen bg-neutral-100 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-neutral-200 flex flex-col">
        <div className="p-6 border-b border-neutral-200">
          <Link href="/">
            <Image src="/logo.png" alt="Logo" width={48} height={48} className="h-12 w-auto hover:opacity-80 transition-opacity" />
          </Link>
          <p className="text-xs text-neutral-500 mt-2">Admin Portal</p>
        </div>

        <nav className="flex-1 p-4">
          <ul className="space-y-1">
            <li>
              <Link
                href="/admin"
                className="flex items-center gap-3 px-4 py-3 rounded-lg text-neutral-600 hover:bg-neutral-100"
              >
                <LayoutDashboard className="w-5 h-5" />
                Dashboard
              </Link>
            </li>
            <li>
              <Link
                href="/admin/orders"
                className="flex items-center gap-3 px-4 py-3 rounded-lg text-neutral-600 hover:bg-neutral-100"
              >
                <Package className="w-5 h-5" />
                Orders
              </Link>
            </li>
            <li>
              <Link
                href="/admin/settings"
                className="flex items-center gap-3 px-4 py-3 rounded-lg bg-[var(--color-primary)] text-white"
              >
                <Settings className="w-5 h-5" />
                Settings
              </Link>
            </li>
          </ul>
        </nav>

        <div className="p-4 border-t border-neutral-200">
          <button className="flex items-center gap-3 px-4 py-3 rounded-lg text-neutral-600 hover:bg-neutral-100 w-full">
            <LogOut className="w-5 h-5" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-neutral-900">Settings</h1>
            <p className="text-neutral-600">Manage your store settings</p>
          </div>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="px-6 py-2.5 bg-[var(--color-primary)] text-white rounded-lg font-medium hover:opacity-90 disabled:opacity-50 flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            {isSaving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>

        <div className="flex gap-8">
          {/* Settings Nav */}
          <div className="w-48 shrink-0">
            <nav className="space-y-1">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors ${
                    activeTab === tab.id
                      ? 'bg-neutral-200 text-neutral-900 font-medium'
                      : 'text-neutral-600 hover:bg-neutral-100'
                  }`}
                >
                  <tab.icon className="w-5 h-5" />
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          {/* Settings Content */}
          <div className="flex-1 bg-white rounded-xl shadow-sm border border-neutral-200 p-6">
            {activeTab === 'storefront' && (
              <div>
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-lg font-semibold text-neutral-900">Storefront</h2>
                    <p className="text-sm text-neutral-500">Customize your landing page appearance</p>
                  </div>
                  <Link
                    href="/"
                    target="_blank"
                    className="flex items-center gap-2 text-sm text-[var(--color-primary)] hover:underline"
                  >
                    <Eye className="w-4 h-4" />
                    Preview
                  </Link>
                </div>

                {/* Hero Section Editor - Mimics landing page layout */}
                <div className="border border-neutral-200 rounded-xl overflow-hidden mb-6">
                  <div className="bg-neutral-50 px-4 py-2 border-b border-neutral-200">
                    <span className="text-xs font-medium text-neutral-500 uppercase tracking-wide">Hero Section</span>
                  </div>
                  <div className="p-4 md:p-6">
                    <div className="flex flex-col lg:flex-row gap-6">
                      {/* Left side - Text fields stacked */}
                      <div className="flex-1 space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-neutral-700 mb-2">
                              <Type className="w-4 h-4 inline mr-2" />
                              Heading Line 1
                            </label>
                            <input
                              type="text"
                              value={heroHeading}
                              onChange={(e) => setHeroHeading(e.target.value)}
                              className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent font-semibold"
                              placeholder="Custom Metal Parts,"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-neutral-700 mb-2">
                              Heading Line 2 <span className="text-[var(--color-primary)]">(accent color)</span>
                            </label>
                            <input
                              type="text"
                              value={heroAccent}
                              onChange={(e) => setHeroAccent(e.target.value)}
                              className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent font-semibold text-[var(--color-primary)]"
                              placeholder="Instant Quotes"
                            />
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-neutral-700 mb-2">
                            Description
                          </label>
                          <textarea
                            value={heroSubheading}
                            onChange={(e) => setHeroSubheading(e.target.value)}
                            rows={3}
                            className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent resize-none"
                            placeholder="Supporting text..."
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-neutral-700 mb-2">
                              Primary Button
                            </label>
                            <input
                              type="text"
                              value={ctaButtonText}
                              onChange={(e) => setCtaButtonText(e.target.value)}
                              className="w-full px-4 py-2.5 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent text-sm"
                              placeholder="Start with Template"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-neutral-700 mb-2">
                              Secondary Button
                            </label>
                            <input
                              type="text"
                              value={ctaSecondaryText}
                              onChange={(e) => setCtaSecondaryText(e.target.value)}
                              className="w-full px-4 py-2.5 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent text-sm"
                              placeholder="Upload CAD File"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Right side - Hero image upload */}
                      <div className="w-full lg:w-56 shrink-0">
                        <label className="block text-sm font-medium text-neutral-700 mb-2">
                          <ImageIcon className="w-4 h-4 inline mr-2" />
                          Background (optional)
                        </label>
                        <div className="relative aspect-video lg:aspect-[4/3] bg-neutral-100 rounded-xl overflow-hidden border-2 border-dashed border-neutral-300 hover:border-[var(--color-primary)] transition-colors group">
                          {heroImageUrl ? (
                            <Image
                              src={heroImageUrl}
                              alt="Hero preview"
                              fill
                              className="object-cover"
                            />
                          ) : (
                            <div className="absolute inset-0 flex items-center justify-center">
                              <ImageIcon className="w-12 h-12 text-neutral-300" />
                            </div>
                          )}
                          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <button className="px-4 py-2 bg-white rounded-lg text-sm font-medium text-neutral-700 flex items-center gap-2">
                              <Upload className="w-4 h-4" />
                              Replace
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Preview - Matches actual landing page layout */}
                <div className="border border-neutral-200 rounded-xl overflow-hidden">
                  <div className="bg-neutral-50 px-4 py-2 border-b border-neutral-200">
                    <span className="text-xs font-medium text-neutral-500 uppercase tracking-wide">Preview</span>
                  </div>
                  <div className="relative bg-white overflow-hidden">
                    <div className="flex flex-col md:flex-row items-center p-6 md:p-8 gap-6">
                      {/* Left - Content */}
                      <div className="flex-1 text-left">
                        <h3 className="text-2xl md:text-3xl font-bold text-neutral-900 leading-tight">
                          {heroHeading || 'Custom Metal Parts,'}
                          <br />
                          <span className="text-[var(--color-primary)]">{heroAccent || 'Instant Quotes'}</span>
                        </h3>
                        <p className="text-sm text-neutral-600 mt-3 line-clamp-2">{heroSubheading || 'Your description text'}</p>
                        <div className="flex gap-3 mt-4">
                          <span className="px-4 py-2 bg-[var(--color-primary)] text-white text-xs font-medium rounded-lg inline-flex items-center gap-1">
                            {ctaButtonText || 'Primary CTA'} →
                          </span>
                          <span className="px-4 py-2 bg-white text-neutral-700 text-xs font-medium rounded-lg border border-neutral-300 inline-flex items-center gap-1">
                            ↑ {ctaSecondaryText || 'Secondary CTA'}
                          </span>
                        </div>
                      </div>
                      {/* Right - 3D Preview placeholder */}
                      <div className="w-full md:w-48 h-32 bg-neutral-100 rounded-xl flex items-center justify-center shrink-0">
                        <div className="text-center text-neutral-400">
                          <Layers className="w-8 h-8 mx-auto mb-1" />
                          <span className="text-xs">3D Part Preview</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'company' && (
              <div>
                <h2 className="text-lg font-semibold text-neutral-900 mb-6">Company Profile</h2>

                {/* Logo Upload */}
                <div className="mb-8">
                  <label className="block text-sm font-medium text-neutral-700 mb-3">Logo</label>
                  <div className="flex items-center gap-6">
                    <div className="w-20 h-20 bg-neutral-100 rounded-xl flex items-center justify-center">
                      <Image src="/logo.png" alt="Logo" width={60} height={60} className="w-15 h-15" />
                    </div>
                    <button className="px-4 py-2 border border-neutral-300 text-neutral-700 rounded-lg text-sm font-medium hover:bg-neutral-50 flex items-center gap-2">
                      <Upload className="w-4 h-4" />
                      Upload New Logo
                    </button>
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-6">
                  <div className="sm:col-span-2">
                    <label className="block text-sm font-medium text-neutral-700 mb-2">
                      Company Name
                    </label>
                    <input
                      type="text"
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-2">Email</label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-2">Phone</label>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-sm font-medium text-neutral-700 mb-2">
                      Street Address
                    </label>
                    <input
                      type="text"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-2">City</label>
                    <input
                      type="text"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-neutral-700 mb-2">State</label>
                      <input
                        type="text"
                        value={state}
                        onChange={(e) => setState(e.target.value)}
                        className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-neutral-700 mb-2">ZIP</label>
                      <input
                        type="text"
                        value={zip}
                        onChange={(e) => setZip(e.target.value)}
                        className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'pricing' && (
              <div>
                <h2 className="text-lg font-semibold text-neutral-900 mb-2">Pricing</h2>
                <p className="text-neutral-500 mb-6">
                  View your current pricing configuration. Contact CruLink support to make changes.
                </p>

                <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg mb-6">
                  <p className="text-amber-800 text-sm">
                    Pricing is managed by CruLink to ensure accuracy. To request changes, please
                    contact support.
                  </p>
                </div>

                <div className="space-y-6">
                  <div>
                    <h3 className="font-medium text-neutral-900 mb-3">Material Pricing</h3>
                    <div className="bg-neutral-50 rounded-lg p-4 space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-neutral-600">Mild Steel</span>
                        <span className="text-neutral-900">$0.08 - $0.25 / sq in</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-neutral-600">Stainless Steel</span>
                        <span className="text-neutral-900">$0.15 - $0.45 / sq in</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-neutral-600">Aluminum</span>
                        <span className="text-neutral-900">$0.10 - $0.30 / sq in</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-medium text-neutral-900 mb-3">Volume Discounts</h3>
                    <div className="bg-neutral-50 rounded-lg p-4 space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-neutral-600">10-24 pieces</span>
                        <span className="text-green-600">5% off</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-neutral-600">25-49 pieces</span>
                        <span className="text-green-600">10% off</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-neutral-600">50-99 pieces</span>
                        <span className="text-green-600">15% off</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-neutral-600">100+ pieces</span>
                        <span className="text-green-600">20% off</span>
                      </div>
                    </div>
                  </div>
                </div>

                <button className="mt-6 px-4 py-2 border border-[var(--color-primary)] text-[var(--color-primary)] rounded-lg text-sm font-medium hover:bg-red-50">
                  Request Pricing Update
                </button>
              </div>
            )}

            {activeTab === 'leadtimes' && (
              <div>
                <h2 className="text-lg font-semibold text-neutral-900 mb-6">Lead Times</h2>

                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-2">
                      Standard Production Time (business days)
                    </label>
                    <input
                      type="number"
                      value={standardLeadTime}
                      onChange={(e) => setStandardLeadTime(e.target.value)}
                      className="w-32 px-4 py-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent"
                    />
                    <p className="text-sm text-neutral-500 mt-1">
                      Default lead time shown to customers
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-2">
                      Rush Production Time (business days)
                    </label>
                    <input
                      type="number"
                      value={rushLeadTime}
                      onChange={(e) => setRushLeadTime(e.target.value)}
                      className="w-32 px-4 py-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent"
                    />
                    <p className="text-sm text-neutral-500 mt-1">+25% rush fee applies</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-2">
                      Super Rush Production Time (business days)
                    </label>
                    <input
                      type="number"
                      value={superRushLeadTime}
                      onChange={(e) => setSuperRushLeadTime(e.target.value)}
                      className="w-32 px-4 py-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent"
                    />
                    <p className="text-sm text-neutral-500 mt-1">+50% super rush fee applies</p>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'notifications' && (
              <div>
                <h2 className="text-lg font-semibold text-neutral-900 mb-6">Email Notifications</h2>

                <div className="space-y-4">
                  <label className="flex items-center justify-between p-4 bg-neutral-50 rounded-lg cursor-pointer">
                    <div>
                      <p className="font-medium text-neutral-900">New Orders</p>
                      <p className="text-sm text-neutral-500">
                        Get notified when a new order is placed
                      </p>
                    </div>
                    <input
                      type="checkbox"
                      checked={emailNewOrders}
                      onChange={(e) => setEmailNewOrders(e.target.checked)}
                      className="w-5 h-5 rounded text-[var(--color-primary)] focus:ring-[var(--color-primary)]"
                    />
                  </label>

                  <label className="flex items-center justify-between p-4 bg-neutral-50 rounded-lg cursor-pointer">
                    <div>
                      <p className="font-medium text-neutral-900">Customer Messages</p>
                      <p className="text-sm text-neutral-500">
                        Get notified when a customer sends a message
                      </p>
                    </div>
                    <input
                      type="checkbox"
                      checked={emailMessages}
                      onChange={(e) => setEmailMessages(e.target.checked)}
                      className="w-5 h-5 rounded text-[var(--color-primary)] focus:ring-[var(--color-primary)]"
                    />
                  </label>

                  <label className="flex items-center justify-between p-4 bg-neutral-50 rounded-lg cursor-pointer">
                    <div>
                      <p className="font-medium text-neutral-900">Payments</p>
                      <p className="text-sm text-neutral-500">
                        Get notified when payments are processed
                      </p>
                    </div>
                    <input
                      type="checkbox"
                      checked={emailPayments}
                      onChange={(e) => setEmailPayments(e.target.checked)}
                      className="w-5 h-5 rounded text-[var(--color-primary)] focus:ring-[var(--color-primary)]"
                    />
                  </label>
                </div>
              </div>
            )}

            {activeTab === 'users' && (
              <div>
                <h2 className="text-lg font-semibold text-neutral-900 mb-6">Team Members</h2>

                <div className="space-y-4 mb-6">
                  <div className="flex items-center justify-between p-4 bg-neutral-50 rounded-lg">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-[var(--color-primary)] rounded-full flex items-center justify-center text-white font-medium">
                        JB
                      </div>
                      <div>
                        <p className="font-medium text-neutral-900">John Browning</p>
                        <p className="text-sm text-neutral-500">john@browningswelding.com</p>
                      </div>
                    </div>
                    <span className="text-sm text-neutral-500">Owner</span>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-neutral-50 rounded-lg">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-neutral-400 rounded-full flex items-center justify-center text-white font-medium">
                        MB
                      </div>
                      <div>
                        <p className="font-medium text-neutral-900">Mike Brown</p>
                        <p className="text-sm text-neutral-500">mike@browningswelding.com</p>
                      </div>
                    </div>
                    <span className="text-sm text-neutral-500">Admin</span>
                  </div>
                </div>

                <button className="px-4 py-2 border border-neutral-300 text-neutral-700 rounded-lg text-sm font-medium hover:bg-neutral-50">
                  + Invite Team Member
                </button>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
