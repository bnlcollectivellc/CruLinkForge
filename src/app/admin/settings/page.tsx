'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
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
  Menu,
  X,
  Palette,
  Check,
  ChevronDown,
  ChevronRight,
  Truck,
  Percent,
} from 'lucide-react';

// Import pricing data
import materialsData from '@/data/materials.json';
import servicesData from '@/data/services.json';
import finishesData from '@/data/finishes.json';

// Color palette options
const colorPalette = [
  { id: 'red', name: 'Ruby Red', value: '#dc2626' },
  { id: 'orange', name: 'Sunset Orange', value: '#ea580c' },
  { id: 'amber', name: 'Golden Amber', value: '#d97706' },
  { id: 'emerald', name: 'Emerald Green', value: '#059669' },
  { id: 'teal', name: 'Ocean Teal', value: '#0d9488' },
  { id: 'blue', name: 'Steel Blue', value: '#2563eb' },
  { id: 'indigo', name: 'Deep Indigo', value: '#4f46e5' },
  { id: 'purple', name: 'Royal Purple', value: '#7c3aed' },
  { id: 'pink', name: 'Hot Pink', value: '#db2777' },
  { id: 'slate', name: 'Industrial Slate', value: '#475569' },
];

// Collapsible Section Component for Pricing
function PricingSection({
  title,
  icon: Icon,
  children,
  defaultOpen = false
}: {
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="border border-neutral-200 rounded-lg overflow-hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-3 sm:p-4 bg-neutral-50 hover:bg-neutral-100 transition-colors"
      >
        <div className="flex items-center gap-2">
          <Icon className="w-4 h-4 text-neutral-500" />
          <span className="font-medium text-neutral-900 text-sm sm:text-base">{title}</span>
        </div>
        <ChevronDown className={`w-4 h-4 text-neutral-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      {isOpen && (
        <div className="p-3 sm:p-4 border-t border-neutral-200 bg-white">
          {children}
        </div>
      )}
    </div>
  );
}

// Pricing Tab Component
function PricingTab() {
  const [expandedCategories, setExpandedCategories] = useState<string[]>([]);
  const [expandedSubcategories, setExpandedSubcategories] = useState<string[]>([]);

  const toggleCategory = (id: string) => {
    setExpandedCategories(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const toggleSubcategory = (id: string) => {
    setExpandedSubcategories(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  return (
    <div>
      <h2 className="text-lg font-semibold text-neutral-900 mb-2">Pricing</h2>
      <p className="text-neutral-500 text-sm mb-4">
        View your current pricing configuration. Contact CruLink support to make changes.
      </p>

      <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg mb-6">
        <p className="text-amber-800 text-sm">
          Pricing is managed by CruLink to ensure accuracy. To request changes, please contact support.
        </p>
      </div>

      <div className="space-y-3">
        {/* Materials Section */}
        <PricingSection title="Materials" icon={Layers} defaultOpen={true}>
          <div className="space-y-2">
            {materialsData.categories.map((category) => (
              <div key={category.id} className="border border-neutral-100 rounded-lg overflow-hidden">
                <button
                  onClick={() => toggleCategory(category.id)}
                  className="w-full flex items-center justify-between p-2.5 bg-neutral-50 hover:bg-neutral-100 transition-colors"
                >
                  <span className="font-medium text-neutral-800 text-sm">{category.name}</span>
                  <ChevronRight className={`w-4 h-4 text-neutral-400 transition-transform ${expandedCategories.includes(category.id) ? 'rotate-90' : ''}`} />
                </button>

                {expandedCategories.includes(category.id) && (
                  <div className="border-t border-neutral-100">
                    {category.subcategories.map((sub) => (
                      <div key={sub.id} className="border-b border-neutral-50 last:border-b-0">
                        <button
                          onClick={() => toggleSubcategory(sub.id)}
                          className="w-full flex items-center justify-between p-2 pl-4 hover:bg-neutral-50 transition-colors"
                        >
                          <span className="text-neutral-700 text-sm">{sub.name}</span>
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-neutral-400">
                              {sub.thicknesses.length} gauges
                            </span>
                            <ChevronRight className={`w-3 h-3 text-neutral-400 transition-transform ${expandedSubcategories.includes(sub.id) ? 'rotate-90' : ''}`} />
                          </div>
                        </button>

                        {expandedSubcategories.includes(sub.id) && (
                          <div className="bg-neutral-50 p-2 pl-6">
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
                              {sub.thicknesses.map((t) => (
                                <div key={t.gauge} className="flex justify-between text-xs bg-white rounded px-2 py-1.5 border border-neutral-100">
                                  <span className="text-neutral-600">{t.gauge}</span>
                                  <span className="text-neutral-900 font-medium">${t.pricePerSqIn.toFixed(3)}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </PricingSection>

        {/* Services Section */}
        <PricingSection title="Services" icon={Settings}>
          <div className="space-y-1.5">
            {servicesData.services.map((service) => (
              <div key={service.id} className="flex justify-between items-center text-sm py-1.5 border-b border-neutral-50 last:border-b-0">
                <span className="text-neutral-700">{service.name}</span>
                <span className="text-neutral-900 font-medium text-right">
                  {service.included ? (
                    <span className="text-green-600">Included</span>
                  ) : service.basePrice && service.pricePerCut ? (
                    `$${service.basePrice} + $${service.pricePerCut}/cut`
                  ) : service.basePrice && service.pricePerBend ? (
                    `$${service.basePrice} setup + $${service.pricePerBend}/bend`
                  ) : service.pricePerHole ? (
                    `$${service.pricePerHole}/hole`
                  ) : service.basePrice && service.pricePerSqIn ? (
                    `$${service.basePrice} + $${service.pricePerSqIn}/sq in`
                  ) : service.types ? (
                    <span className="text-neutral-500 text-xs">Multiple types</span>
                  ) : (
                    <span className="text-neutral-500 text-xs">See options</span>
                  )}
                </span>
              </div>
            ))}
          </div>
        </PricingSection>

        {/* Finishes Section */}
        <PricingSection title="Finishes" icon={Palette}>
          <div className="overflow-x-auto -mx-3 sm:-mx-4 px-3 sm:px-4">
            <table className="w-full text-sm min-w-[400px]">
              <thead>
                <tr className="text-left text-neutral-500 text-xs border-b border-neutral-100">
                  <th className="pb-2 font-medium">Finish</th>
                  <th className="pb-2 font-medium text-center">Multiplier</th>
                  <th className="pb-2 font-medium text-center">Lead Time</th>
                  <th className="pb-2 font-medium text-right">Upcharge</th>
                </tr>
              </thead>
              <tbody>
                {finishesData.finishes.map((finish) => {
                  const upcharges = finish.colors?.map(c => c.upcharge).filter(u => u > 0) ||
                                   finish.options?.map(o => o.upcharge).filter(u => u > 0) || [];
                  const maxUpcharge = upcharges.length > 0 ? Math.max(...upcharges) : 0;

                  return (
                    <tr key={finish.id} className="border-b border-neutral-50 last:border-b-0">
                      <td className="py-2 text-neutral-700">{finish.name}</td>
                      <td className="py-2 text-center text-neutral-900">{finish.priceMultiplier.toFixed(2)}x</td>
                      <td className="py-2 text-center text-neutral-600">{finish.leadTimeDays}d</td>
                      <td className="py-2 text-right text-neutral-900">
                        {maxUpcharge > 0 ? `+$0-${maxUpcharge}` : '$0'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </PricingSection>

        {/* Volume Discounts Section */}
        <PricingSection title="Volume Discounts" icon={Percent}>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {materialsData.volumeDiscounts.filter(d => d.discount > 0).map((discount, idx) => (
              <div key={idx} className="flex justify-between items-center bg-green-50 rounded-lg px-3 py-2">
                <span className="text-neutral-700 text-sm">
                  {discount.minQty}-{discount.maxQty || '∞'}
                </span>
                <span className="text-green-600 font-medium text-sm">
                  {(discount.discount * 100).toFixed(0)}% off
                </span>
              </div>
            ))}
          </div>
        </PricingSection>

        {/* Shipping & Tax Section */}
        <PricingSection title="Shipping & Tax" icon={Truck}>
          <div className="space-y-2">
            <div className="text-sm font-medium text-neutral-700 mb-2">Shipping Options</div>
            {servicesData.shipping.options.map((option) => (
              <div key={option.id} className="flex justify-between text-sm py-1.5 border-b border-neutral-50 last:border-b-0">
                <span className="text-neutral-600">{option.name}</span>
                <span className="text-neutral-900 font-medium">
                  {option.price === 0 ? 'Free' : option.calculated ? 'Calculated' : `$${option.price}`}
                </span>
              </div>
            ))}
            <div className="pt-2 mt-2 border-t border-neutral-200">
              <div className="flex justify-between text-sm">
                <span className="text-neutral-600">Sales Tax</span>
                <span className="text-neutral-900 font-medium">
                  {(servicesData.shipping.taxRate * 100).toFixed(1)}% ({servicesData.shipping.taxNote})
                </span>
              </div>
            </div>
          </div>
        </PricingSection>
      </div>

      <button className="mt-6 px-4 py-2 border border-[var(--color-primary)] text-[var(--color-primary)] rounded-lg text-sm font-medium hover:bg-red-50 w-full sm:w-auto">
        Request Pricing Update
      </button>
    </div>
  );
}

export default function AdminSettingsPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('storefront');
  const [isSaving, setIsSaving] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleSignOut = () => {
    localStorage.removeItem('forge_user');
    router.push('/');
  };

  // Brand color
  const [selectedColor, setSelectedColor] = useState('#dc2626');

  // Load saved settings on mount
  useEffect(() => {
    const savedColor = localStorage.getItem('forge_primary_color');
    if (savedColor) {
      setSelectedColor(savedColor);
    }

    // Load storefront settings
    const savedStorefront = localStorage.getItem('forge_storefront');
    if (savedStorefront) {
      const settings = JSON.parse(savedStorefront);
      if (settings.heroHeading) setHeroHeading(settings.heroHeading);
      if (settings.heroAccent) setHeroAccent(settings.heroAccent);
      if (settings.heroSubheading) setHeroSubheading(settings.heroSubheading);
      if (settings.ctaButtonText) setCtaButtonText(settings.ctaButtonText);
      if (settings.ctaSecondaryText) setCtaSecondaryText(settings.ctaSecondaryText);
    }
  }, []);

  // Handle color selection
  const handleColorSelect = (colorValue: string) => {
    setSelectedColor(colorValue);
    localStorage.setItem('forge_primary_color', colorValue);
    // Apply immediately to CSS variable
    document.documentElement.style.setProperty('--color-primary', colorValue);
  };

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

    // Save storefront settings to localStorage
    const storefrontSettings = {
      heroHeading,
      heroAccent,
      heroSubheading,
      ctaButtonText,
      ctaSecondaryText,
      heroImageUrl,
    };
    localStorage.setItem('forge_storefront', JSON.stringify(storefrontSettings));

    // Simulate API call for other settings
    await new Promise((resolve) => setTimeout(resolve, 500));
    setIsSaving(false);
  };

  const tabs = [
    { id: 'storefront', label: 'Storefront', icon: Store },
    { id: 'company', label: 'Company', icon: Building2 },
    { id: 'pricing', label: 'Pricing', icon: DollarSign },
    { id: 'leadtimes', label: 'Lead Times', icon: Clock },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'users', label: 'Users', icon: Users },
  ];

  const navLinks = [
    { href: '/admin', icon: LayoutDashboard, label: 'Dashboard' },
    { href: '/admin/orders', icon: Package, label: 'Orders' },
    { href: '/admin/settings', icon: Settings, label: 'Settings', active: true },
  ];

  return (
    <div className="min-h-screen bg-neutral-100 flex flex-col lg:flex-row">
      {/* Mobile Header */}
      <header className="lg:hidden bg-white border-b border-neutral-200 px-4 py-3 flex items-center justify-between sticky top-0 z-50">
        <Link href="/">
          <Image src="/logo.png" alt="Logo" width={36} height={36} className="h-9 w-auto" />
        </Link>
        <div className="flex items-center gap-2">
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="px-3 py-1.5 bg-[var(--color-primary)] text-white rounded-lg text-sm font-medium hover:opacity-90 disabled:opacity-50 flex items-center gap-1"
          >
            <Save className="w-4 h-4" />
            {isSaving ? 'Saving...' : 'Save'}
          </button>
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
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg ${
                  link.active
                    ? 'bg-[var(--color-primary)] text-white'
                    : 'text-neutral-600 hover:bg-neutral-100'
                }`}
                onClick={() => setMobileMenuOpen(false)}
              >
                <link.icon className="w-5 h-5" />
                {link.label}
              </Link>
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
          <p className="text-xs text-neutral-500 mt-2">Admin Portal</p>
        </div>

        <nav className="flex-1 p-4">
          <ul className="space-y-1">
            {navLinks.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg ${
                    link.active
                      ? 'bg-[var(--color-primary)] text-white'
                      : 'text-neutral-600 hover:bg-neutral-100'
                  }`}
                >
                  <link.icon className="w-5 h-5" />
                  {link.label}
                </Link>
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

        {/* Mobile Title */}
        <div className="lg:hidden mb-4">
          <h1 className="text-xl font-bold text-neutral-900">Settings</h1>
        </div>

        {/* Settings Tabs - Horizontal scroll on mobile */}
        <div className="mb-6 -mx-4 px-4 lg:mx-0 lg:px-0">
          <div className="flex lg:hidden gap-2 overflow-x-auto pb-2 scrollbar-hide">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-full whitespace-nowrap text-sm font-medium transition-colors shrink-0 ${
                  activeTab === tab.id
                    ? 'bg-[var(--color-primary)] text-white'
                    : 'bg-white text-neutral-600 border border-neutral-200'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
          {/* Desktop Settings Nav */}
          <div className="hidden lg:block w-48 shrink-0">
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
          <div className="flex-1 bg-white rounded-xl shadow-sm border border-neutral-200 p-4 sm:p-6">
            {activeTab === 'storefront' && (
              <div>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
                  <div>
                    <h2 className="text-lg font-semibold text-neutral-900">Storefront</h2>
                    <p className="text-sm text-neutral-500">Click any text below to edit it directly</p>
                  </div>
                  <Link
                    href="/"
                    target="_blank"
                    className="flex items-center gap-2 text-sm text-[var(--color-primary)] hover:underline"
                  >
                    <Eye className="w-4 h-4" />
                    View Live
                  </Link>
                </div>

                {/* Brand Color Picker */}
                <div className="flex items-center gap-4 mb-6 p-4 bg-neutral-50 rounded-xl">
                  <div className="flex items-center gap-2">
                    <Palette className="w-4 h-4 text-neutral-500" />
                    <span className="text-sm font-medium text-neutral-700">Brand Color:</span>
                  </div>
                  <div className="flex gap-2">
                    {colorPalette.map((color) => (
                      <button
                        key={color.id}
                        onClick={() => handleColorSelect(color.value)}
                        className={`w-8 h-8 rounded-lg transition-all hover:scale-110 ${
                          selectedColor === color.value
                            ? 'ring-2 ring-offset-2 ring-neutral-900 scale-110'
                            : ''
                        }`}
                        style={{ backgroundColor: color.value }}
                        title={color.name}
                      >
                        {selectedColor === color.value && (
                          <Check className="w-4 h-4 text-white mx-auto" />
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Editable Preview - Looks like the real landing page */}
                <div className="border-2 border-dashed border-neutral-300 rounded-xl overflow-hidden bg-white">
                  <div className="bg-neutral-100 px-4 py-2 border-b border-neutral-200 flex items-center justify-between">
                    <span className="text-xs font-medium text-neutral-500 uppercase tracking-wide">Editable Preview</span>
                    <span className="text-xs text-neutral-400">Click text to edit</span>
                  </div>

                  {/* Simulated Landing Page */}
                  <div className="p-6 sm:p-8 lg:p-10">
                    <div className="max-w-2xl">
                      {/* Editable Hero Heading */}
                      <div className="mb-2">
                        <input
                          type="text"
                          value={heroHeading}
                          onChange={(e) => setHeroHeading(e.target.value)}
                          className="w-full text-3xl sm:text-4xl lg:text-5xl font-bold text-neutral-900 bg-transparent border-2 border-transparent hover:border-neutral-200 focus:border-[var(--color-primary)] focus:outline-none rounded-lg px-2 py-1 -mx-2 transition-colors"
                          placeholder="Your Heading Here"
                        />
                      </div>

                      {/* Editable Accent Line */}
                      <div className="mb-6">
                        <input
                          type="text"
                          value={heroAccent}
                          onChange={(e) => setHeroAccent(e.target.value)}
                          className="w-full text-3xl sm:text-4xl lg:text-5xl font-bold bg-transparent border-2 border-transparent hover:border-neutral-200 focus:border-[var(--color-primary)] focus:outline-none rounded-lg px-2 py-1 -mx-2 transition-colors"
                          style={{ color: selectedColor }}
                          placeholder="Accent Text"
                        />
                      </div>

                      {/* Editable Description */}
                      <div className="mb-8">
                        <textarea
                          value={heroSubheading}
                          onChange={(e) => setHeroSubheading(e.target.value)}
                          rows={2}
                          className="w-full text-lg text-neutral-600 bg-transparent border-2 border-transparent hover:border-neutral-200 focus:border-[var(--color-primary)] focus:outline-none rounded-lg px-2 py-1 -mx-2 resize-none transition-colors"
                          placeholder="Your description text here..."
                        />
                      </div>

                      {/* Preview Cards (non-editable) */}
                      <div className="grid grid-cols-3 gap-4 mb-6">
                        <div className="bg-white border border-neutral-200 rounded-xl p-4 shadow-sm">
                          <div className="w-10 h-10 bg-neutral-100 rounded-lg flex items-center justify-center mb-3">
                            <Layers className="w-5 h-5" style={{ color: selectedColor }} />
                          </div>
                          <h3 className="font-semibold text-neutral-900 mb-1 text-base">Parts Builder</h3>
                          <p className="text-sm text-neutral-500">Customize templates</p>
                        </div>
                        <div className="bg-white border border-neutral-200 rounded-xl p-4 shadow-sm">
                          <div className="w-10 h-10 bg-neutral-100 rounded-lg flex items-center justify-center mb-3">
                            <Type className="w-5 h-5" style={{ color: selectedColor }} />
                          </div>
                          <h3 className="font-semibold text-neutral-900 mb-1 text-base">Design Services</h3>
                          <p className="text-sm text-neutral-500">We create files</p>
                        </div>
                        <div className="bg-white border border-neutral-200 rounded-xl p-4 shadow-sm">
                          <div className="w-10 h-10 bg-neutral-100 rounded-lg flex items-center justify-center mb-3">
                            <ImageIcon className="w-5 h-5" style={{ color: selectedColor }} />
                          </div>
                          <h3 className="font-semibold text-neutral-900 mb-1 text-base">Custom Quote</h3>
                          <p className="text-sm text-neutral-500">Unique projects</p>
                        </div>
                      </div>

                      {/* Preview Drop Zone (non-editable) */}
                      <div className="rounded-xl border-2 border-dashed border-neutral-300 bg-neutral-50 p-4">
                        <div className="flex items-center justify-center gap-3 text-neutral-400">
                          <Upload className="w-5 h-5" />
                          <span className="text-sm">Drop files here for a custom quote</span>
                          <button
                            className="px-4 py-2 text-white rounded-lg text-sm font-medium"
                            style={{ backgroundColor: selectedColor }}
                          >
                            BROWSE
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Tip */}
                <p className="text-xs text-neutral-400 mt-4 text-center">
                  Changes are saved when you click &quot;Save Changes&quot; above
                </p>
              </div>
            )}

            {activeTab === 'company' && (
              <div>
                <h2 className="text-lg font-semibold text-neutral-900 mb-6">Company Profile</h2>

                {/* Logo Upload */}
                <div className="mb-8">
                  <label className="block text-sm font-medium text-neutral-700 mb-3">Logo</label>
                  <div className="flex items-center gap-4 sm:gap-6">
                    <div className="w-16 h-16 sm:w-20 sm:h-20 bg-neutral-100 rounded-xl flex items-center justify-center shrink-0">
                      <Image src="/logo.png" alt="Logo" width={60} height={60} className="w-12 h-12 sm:w-15 sm:h-15" />
                    </div>
                    <button className="px-3 sm:px-4 py-2 border border-neutral-300 text-neutral-700 rounded-lg text-sm font-medium hover:bg-neutral-50 flex items-center gap-2">
                      <Upload className="w-4 h-4" />
                      <span className="hidden sm:inline">Upload New Logo</span>
                      <span className="sm:hidden">Upload</span>
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                  <div className="sm:col-span-2">
                    <label className="block text-sm font-medium text-neutral-700 mb-2">
                      Company Name
                    </label>
                    <input
                      type="text"
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent text-sm sm:text-base"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-2">Email</label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent text-sm sm:text-base"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-2">Phone</label>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent text-sm sm:text-base"
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
                      className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent text-sm sm:text-base"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-2">City</label>
                    <input
                      type="text"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent text-sm sm:text-base"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3 sm:gap-4">
                    <div>
                      <label className="block text-sm font-medium text-neutral-700 mb-2">State</label>
                      <input
                        type="text"
                        value={state}
                        onChange={(e) => setState(e.target.value)}
                        className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent text-sm sm:text-base"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-neutral-700 mb-2">ZIP</label>
                      <input
                        type="text"
                        value={zip}
                        onChange={(e) => setZip(e.target.value)}
                        className="w-full px-3 sm:px-4 py-2.5 sm:py-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent text-sm sm:text-base"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'pricing' && (
              <PricingTab />
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
                      className="w-full sm:w-32 px-3 sm:px-4 py-2.5 sm:py-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent"
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
                      className="w-full sm:w-32 px-3 sm:px-4 py-2.5 sm:py-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent"
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
                      className="w-full sm:w-32 px-3 sm:px-4 py-2.5 sm:py-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent"
                    />
                    <p className="text-sm text-neutral-500 mt-1">+50% super rush fee applies</p>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'notifications' && (
              <div>
                <h2 className="text-lg font-semibold text-neutral-900 mb-6">Email Notifications</h2>

                <div className="space-y-3 sm:space-y-4">
                  <label className="flex items-start sm:items-center justify-between p-3 sm:p-4 bg-neutral-50 rounded-lg cursor-pointer gap-3">
                    <div className="flex-1">
                      <p className="font-medium text-neutral-900 text-sm sm:text-base">New Orders</p>
                      <p className="text-xs sm:text-sm text-neutral-500">
                        Get notified when a new order is placed
                      </p>
                    </div>
                    <input
                      type="checkbox"
                      checked={emailNewOrders}
                      onChange={(e) => setEmailNewOrders(e.target.checked)}
                      className="w-5 h-5 rounded text-[var(--color-primary)] focus:ring-[var(--color-primary)] shrink-0"
                    />
                  </label>

                  <label className="flex items-start sm:items-center justify-between p-3 sm:p-4 bg-neutral-50 rounded-lg cursor-pointer gap-3">
                    <div className="flex-1">
                      <p className="font-medium text-neutral-900 text-sm sm:text-base">Customer Messages</p>
                      <p className="text-xs sm:text-sm text-neutral-500">
                        Get notified when a customer sends a message
                      </p>
                    </div>
                    <input
                      type="checkbox"
                      checked={emailMessages}
                      onChange={(e) => setEmailMessages(e.target.checked)}
                      className="w-5 h-5 rounded text-[var(--color-primary)] focus:ring-[var(--color-primary)] shrink-0"
                    />
                  </label>

                  <label className="flex items-start sm:items-center justify-between p-3 sm:p-4 bg-neutral-50 rounded-lg cursor-pointer gap-3">
                    <div className="flex-1">
                      <p className="font-medium text-neutral-900 text-sm sm:text-base">Payments</p>
                      <p className="text-xs sm:text-sm text-neutral-500">
                        Get notified when payments are processed
                      </p>
                    </div>
                    <input
                      type="checkbox"
                      checked={emailPayments}
                      onChange={(e) => setEmailPayments(e.target.checked)}
                      className="w-5 h-5 rounded text-[var(--color-primary)] focus:ring-[var(--color-primary)] shrink-0"
                    />
                  </label>
                </div>
              </div>
            )}

            {activeTab === 'users' && (
              <div>
                <h2 className="text-lg font-semibold text-neutral-900 mb-6">Team Members</h2>

                <div className="space-y-3 sm:space-y-4 mb-6">
                  <div className="flex items-center justify-between p-3 sm:p-4 bg-neutral-50 rounded-lg">
                    <div className="flex items-center gap-3 sm:gap-4">
                      <div className="w-9 h-9 sm:w-10 sm:h-10 bg-[var(--color-primary)] rounded-full flex items-center justify-center text-white font-medium text-sm">
                        JB
                      </div>
                      <div className="min-w-0">
                        <p className="font-medium text-neutral-900 text-sm sm:text-base truncate">John Browning</p>
                        <p className="text-xs sm:text-sm text-neutral-500 truncate">john@browningswelding.com</p>
                      </div>
                    </div>
                    <span className="text-xs sm:text-sm text-neutral-500 shrink-0 ml-2">Owner</span>
                  </div>

                  <div className="flex items-center justify-between p-3 sm:p-4 bg-neutral-50 rounded-lg">
                    <div className="flex items-center gap-3 sm:gap-4">
                      <div className="w-9 h-9 sm:w-10 sm:h-10 bg-neutral-400 rounded-full flex items-center justify-center text-white font-medium text-sm">
                        MB
                      </div>
                      <div className="min-w-0">
                        <p className="font-medium text-neutral-900 text-sm sm:text-base truncate">Mike Brown</p>
                        <p className="text-xs sm:text-sm text-neutral-500 truncate">mike@browningswelding.com</p>
                      </div>
                    </div>
                    <span className="text-xs sm:text-sm text-neutral-500 shrink-0 ml-2">Admin</span>
                  </div>
                </div>

                <button className="px-4 py-2 border border-neutral-300 text-neutral-700 rounded-lg text-sm font-medium hover:bg-neutral-50 w-full sm:w-auto">
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
