'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  LayoutDashboard,
  Package,
  Settings,
  TrendingUp,
  Clock,
  DollarSign,
  AlertCircle,
  CheckCircle,
  ChevronRight,
  LogOut,
} from 'lucide-react';

// Mock data
const stats = [
  { label: 'New Orders Today', value: '3', change: '+$2,847', icon: Package, color: 'blue' },
  { label: 'Pending Review', value: '1', sublabel: 'Requires attention', icon: AlertCircle, color: 'amber' },
  { label: 'In Production', value: '12', sublabel: 'orders', icon: Clock, color: 'purple' },
  { label: 'This Month', value: '$42,315', sublabel: '87 orders', icon: DollarSign, color: 'green' },
];

const recentOrders = [
  {
    id: 'FOR-0045',
    customer: 'John Smith',
    part: 'Mounting Plate',
    qty: 50,
    total: 1908,
    status: 'new',
    time: '2 hours ago',
  },
  {
    id: 'FOR-0044',
    customer: 'Acme Corp',
    part: 'L-Bracket',
    qty: 100,
    total: 3420,
    status: 'production',
    time: '1 day ago',
  },
  {
    id: 'FOR-0043',
    customer: 'Jane Doe',
    part: 'U-Channel',
    qty: 25,
    total: 1250,
    status: 'shipped',
    time: '2 days ago',
  },
  {
    id: 'FOR-0042',
    customer: 'Bob Wilson',
    part: 'Gusset Plate',
    qty: 200,
    total: 4800,
    status: 'delivered',
    time: '5 days ago',
  },
];

const statusColors: Record<string, { bg: string; text: string; label: string }> = {
  new: { bg: 'bg-blue-100', text: 'text-blue-700', label: 'New' },
  production: { bg: 'bg-purple-100', text: 'text-purple-700', label: 'In Production' },
  shipped: { bg: 'bg-orange-100', text: 'text-orange-700', label: 'Shipped' },
  delivered: { bg: 'bg-green-100', text: 'text-green-700', label: 'Delivered' },
};

export default function AdminDashboard() {
  const [activeNav, setActiveNav] = useState('dashboard');

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
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  activeNav === 'dashboard'
                    ? 'bg-[var(--color-primary)] text-white'
                    : 'text-neutral-600 hover:bg-neutral-100'
                }`}
                onClick={() => setActiveNav('dashboard')}
              >
                <LayoutDashboard className="w-5 h-5" />
                Dashboard
              </Link>
            </li>
            <li>
              <Link
                href="/admin/orders"
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  activeNav === 'orders'
                    ? 'bg-[var(--color-primary)] text-white'
                    : 'text-neutral-600 hover:bg-neutral-100'
                }`}
                onClick={() => setActiveNav('orders')}
              >
                <Package className="w-5 h-5" />
                Orders
                <span className="ml-auto bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
                  1
                </span>
              </Link>
            </li>
            <li>
              <Link
                href="/admin/settings"
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  activeNav === 'settings'
                    ? 'bg-[var(--color-primary)] text-white'
                    : 'text-neutral-600 hover:bg-neutral-100'
                }`}
                onClick={() => setActiveNav('settings')}
              >
                <Settings className="w-5 h-5" />
                Settings
              </Link>
            </li>
          </ul>
        </nav>

        <div className="p-4 border-t border-neutral-200">
          <button className="flex items-center gap-3 px-4 py-3 rounded-lg text-neutral-600 hover:bg-neutral-100 w-full transition-colors">
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
            <h1 className="text-2xl font-bold text-neutral-900">Dashboard</h1>
            <p className="text-neutral-600">Welcome back, Browning&apos;s Welding</p>
          </div>
          <Link
            href="/"
            className="px-4 py-2 text-sm text-neutral-600 hover:text-neutral-900 border border-neutral-300 rounded-lg hover:bg-neutral-50"
          >
            View Store
          </Link>
        </div>

        {/* Stats Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="bg-white rounded-xl p-6 shadow-sm border border-neutral-200"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-neutral-500">{stat.label}</p>
                  <p className="text-2xl font-bold text-neutral-900 mt-1">{stat.value}</p>
                  {stat.change && (
                    <p className="text-sm text-green-600 flex items-center gap-1 mt-1">
                      <TrendingUp className="w-4 h-4" />
                      {stat.change}
                    </p>
                  )}
                  {stat.sublabel && (
                    <p className="text-sm text-neutral-500 mt-1">{stat.sublabel}</p>
                  )}
                </div>
                <div
                  className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                    stat.color === 'blue'
                      ? 'bg-blue-100'
                      : stat.color === 'amber'
                      ? 'bg-amber-100'
                      : stat.color === 'green'
                      ? 'bg-green-100'
                      : 'bg-purple-100'
                  }`}
                >
                  <stat.icon
                    className={`w-6 h-6 ${
                      stat.color === 'blue'
                        ? 'text-blue-600'
                        : stat.color === 'amber'
                        ? 'text-amber-600'
                        : stat.color === 'green'
                        ? 'text-green-600'
                        : 'text-purple-600'
                    }`}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Recent Orders */}
        <div className="bg-white rounded-xl shadow-sm border border-neutral-200">
          <div className="p-6 border-b border-neutral-200 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-neutral-900">Recent Orders</h2>
            <Link
              href="/admin/orders"
              className="text-sm text-[var(--color-primary)] hover:underline flex items-center gap-1"
            >
              View All
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-neutral-200">
                  <th className="text-left text-sm font-medium text-neutral-500 px-6 py-4">
                    Order
                  </th>
                  <th className="text-left text-sm font-medium text-neutral-500 px-6 py-4">
                    Customer
                  </th>
                  <th className="text-left text-sm font-medium text-neutral-500 px-6 py-4">Part</th>
                  <th className="text-left text-sm font-medium text-neutral-500 px-6 py-4">Qty</th>
                  <th className="text-left text-sm font-medium text-neutral-500 px-6 py-4">
                    Total
                  </th>
                  <th className="text-left text-sm font-medium text-neutral-500 px-6 py-4">
                    Status
                  </th>
                  <th className="text-left text-sm font-medium text-neutral-500 px-6 py-4">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.map((order) => (
                  <tr key={order.id} className="border-b border-neutral-100 hover:bg-neutral-50">
                    <td className="px-6 py-4">
                      <Link
                        href={`/admin/orders/${order.id}`}
                        className="font-medium text-neutral-900 hover:text-[var(--color-primary)]"
                      >
                        #{order.id}
                      </Link>
                      <p className="text-xs text-neutral-500">{order.time}</p>
                    </td>
                    <td className="px-6 py-4 text-neutral-700">{order.customer}</td>
                    <td className="px-6 py-4 text-neutral-700">{order.part}</td>
                    <td className="px-6 py-4 text-neutral-700">{order.qty}</td>
                    <td className="px-6 py-4 text-neutral-900 font-medium">
                      ${order.total.toLocaleString()}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                          statusColors[order.status].bg
                        } ${statusColors[order.status].text}`}
                      >
                        {statusColors[order.status].label}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <Link
                        href={`/admin/orders/${order.id}`}
                        className="text-sm text-[var(--color-primary)] hover:underline"
                      >
                        {order.status === 'new' ? 'Review' : 'View'}
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}
