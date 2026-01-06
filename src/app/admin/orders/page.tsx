'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  Package,
  Settings,
  Search,
  Filter,
  ChevronDown,
  LogOut,
} from 'lucide-react';

const orders = [
  {
    id: 'FOR-0045',
    customer: 'John Smith',
    email: 'jsmith@email.com',
    part: 'Mounting Plate',
    qty: 50,
    total: 1908,
    status: 'new',
    placedAt: '2025-12-21T10:32:00Z',
  },
  {
    id: 'FOR-0044',
    customer: 'Acme Corp',
    email: 'orders@acme.com',
    part: 'L-Bracket',
    qty: 100,
    total: 3420,
    status: 'production',
    placedAt: '2025-12-20T14:15:00Z',
  },
  {
    id: 'FOR-0043',
    customer: 'Jane Doe',
    email: 'jane@company.com',
    part: 'U-Channel',
    qty: 25,
    total: 1250,
    status: 'shipped',
    placedAt: '2025-12-19T09:45:00Z',
  },
  {
    id: 'FOR-0042',
    customer: 'Bob Wilson',
    email: 'bob@wilson.com',
    part: 'Gusset Plate',
    qty: 200,
    total: 4800,
    status: 'delivered',
    placedAt: '2025-12-16T11:20:00Z',
  },
  {
    id: 'FOR-0041',
    customer: 'Tech Industries',
    email: 'purchasing@tech.com',
    part: 'Enclosure Panel',
    qty: 30,
    total: 2150,
    status: 'production',
    placedAt: '2025-12-15T16:00:00Z',
  },
  {
    id: 'FOR-0040',
    customer: 'Sarah Johnson',
    email: 'sarah@email.com',
    part: 'Washer',
    qty: 500,
    total: 890,
    status: 'delivered',
    placedAt: '2025-12-14T08:30:00Z',
  },
];

const statusColors: Record<string, { bg: string; text: string; label: string }> = {
  new: { bg: 'bg-blue-100', text: 'text-blue-700', label: 'New' },
  production: { bg: 'bg-purple-100', text: 'text-purple-700', label: 'In Production' },
  shipped: { bg: 'bg-orange-100', text: 'text-orange-700', label: 'Shipped' },
  delivered: { bg: 'bg-green-100', text: 'text-green-700', label: 'Delivered' },
  cancelled: { bg: 'bg-red-100', text: 'text-red-700', label: 'Cancelled' },
};

export default function AdminOrdersPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const handleSignOut = () => {
    localStorage.removeItem('forge_user');
    router.push('/');
  };

  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.customer.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
  };

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
                className="flex items-center gap-3 px-4 py-3 rounded-lg text-neutral-600 hover:bg-neutral-100 transition-colors"
              >
                <LayoutDashboard className="w-5 h-5" />
                Dashboard
              </Link>
            </li>
            <li>
              <Link
                href="/admin/orders"
                className="flex items-center gap-3 px-4 py-3 rounded-lg bg-[var(--color-primary)] text-white transition-colors"
              >
                <Package className="w-5 h-5" />
                Orders
                <span className="ml-auto bg-white/20 text-white text-xs px-2 py-0.5 rounded-full">
                  1
                </span>
              </Link>
            </li>
            <li>
              <Link
                href="/admin/settings"
                className="flex items-center gap-3 px-4 py-3 rounded-lg text-neutral-600 hover:bg-neutral-100 transition-colors"
              >
                <Settings className="w-5 h-5" />
                Settings
              </Link>
            </li>
          </ul>
        </nav>

        <div className="p-4 border-t border-neutral-200">
          <button
            onClick={handleSignOut}
            className="flex items-center gap-3 px-4 py-3 rounded-lg text-neutral-600 hover:bg-neutral-100 w-full transition-colors"
          >
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
            <h1 className="text-2xl font-bold text-neutral-900">Orders</h1>
            <p className="text-neutral-600">{orders.length} total orders</p>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm border border-neutral-200 p-4 mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
              <input
                type="text"
                placeholder="Search orders, customers..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent"
              />
            </div>
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="pl-10 pr-10 py-2.5 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent appearance-none bg-white"
              >
                <option value="all">All Status</option>
                <option value="new">New</option>
                <option value="production">In Production</option>
                <option value="shipped">Shipped</option>
                <option value="delivered">Delivered</option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Orders Table */}
        <div className="bg-white rounded-xl shadow-sm border border-neutral-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-neutral-200 bg-neutral-50">
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
                {filteredOrders.map((order) => (
                  <tr key={order.id} className="border-b border-neutral-100 hover:bg-neutral-50">
                    <td className="px-6 py-4">
                      <Link
                        href={`/admin/orders/${order.id}`}
                        className="font-medium text-neutral-900 hover:text-[var(--color-primary)]"
                      >
                        #{order.id}
                      </Link>
                      <p className="text-xs text-neutral-500">{formatDate(order.placedAt)}</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-neutral-900">{order.customer}</p>
                      <p className="text-xs text-neutral-500">{order.email}</p>
                    </td>
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
                        className="text-sm text-[var(--color-primary)] hover:underline font-medium"
                      >
                        {order.status === 'new' ? 'Review' : 'View'}
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredOrders.length === 0 && (
            <div className="p-12 text-center">
              <p className="text-neutral-500">No orders found matching your criteria</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
