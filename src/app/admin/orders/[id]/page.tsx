'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  Package,
  Settings,
  ArrowLeft,
  Check,
  X,
  Clock,
  MessageSquare,
  FileText,
  Download,
  Send,
  LogOut,
  AlertTriangle,
  Truck,
  ChevronDown,
} from 'lucide-react';

// Mock order data
const mockOrder = {
  id: 'FOR-0045',
  status: 'new',
  placedAt: '2025-12-21T10:32:00Z',
  autoDeclineAt: '2025-12-22T10:32:00Z',
  customer: {
    name: 'John Smith',
    email: 'jsmith@email.com',
    phone: '(555) 123-4567',
  },
  shipping: {
    address: '123 Main St',
    city: 'Conway',
    state: 'AR',
    zip: '72032',
    method: 'UPS Ground',
  },
  part: {
    template: 'Mounting Plate',
    width: 6.0,
    height: 4.0,
    thickness: '14ga (0.075")',
    material: 'Mild Steel A36',
    holes: '4x corner holes, 0.25" diameter',
    cornerRadius: '0.25"',
    finish: 'Powder Coating - Black (Matte)',
    quantity: 50,
  },
  pricing: {
    material: 1020.0,
    cutting: 200.0,
    finish: 600.0,
    subtotal: 1820.0,
    discount: 122.0,
    discountLabel: 'Volume Discount (10%)',
    subtotalAfterDiscount: 1698.0,
    shipping: 45.0,
    tax: 165.61,
    total: 1908.61,
    payout: 1813.18,
    platformFee: 95.43,
  },
  production: {
    cuttingTime: '15 minutes',
    materialRequired: '1/2 sheet 14ga HR',
    inStock: true,
  },
  messages: [] as { id: string; from: string; message: string; timestamp: string }[],
  files: {
    customerUploads: [],
    generated: [
      { name: 'mounting-plate-50qty.dxf', type: 'DXF' },
      { name: 'technical-drawing.pdf', type: 'PDF' },
    ],
  },
};

const statusOptions = [
  { value: 'production', label: 'In Production' },
  { value: 'quality', label: 'Quality Check' },
  { value: 'ready', label: 'Ready to Ship' },
  { value: 'shipped', label: 'Shipped' },
  { value: 'delivered', label: 'Delivered' },
];

export default function AdminOrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const orderId = params.id as string;

  const [order] = useState(mockOrder);
  const [activeTab, setActiveTab] = useState<'overview' | 'files' | 'messages' | 'history'>(
    'overview'
  );
  const [showAcceptModal, setShowAcceptModal] = useState(false);
  const [showDeclineModal, setShowDeclineModal] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [newMessage, setNewMessage] = useState('');
  const [newStatus, setNewStatus] = useState('');
  const [trackingNumber, setTrackingNumber] = useState('');

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
  };

  const handleAccept = () => {
    // In real app, would call API
    setShowAcceptModal(false);
    router.push('/admin/orders');
  };

  const handleDecline = () => {
    // In real app, would call API
    setShowDeclineModal(false);
    router.push('/admin/orders');
  };

  const handleStatusUpdate = () => {
    // In real app, would call API
    setShowStatusModal(false);
  };

  const handleSendMessage = () => {
    if (!newMessage.trim()) return;
    // In real app, would call API
    setNewMessage('');
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
                className="flex items-center gap-3 px-4 py-3 rounded-lg text-neutral-600 hover:bg-neutral-100"
              >
                <LayoutDashboard className="w-5 h-5" />
                Dashboard
              </Link>
            </li>
            <li>
              <Link
                href="/admin/orders"
                className="flex items-center gap-3 px-4 py-3 rounded-lg bg-[var(--color-primary)] text-white"
              >
                <Package className="w-5 h-5" />
                Orders
              </Link>
            </li>
            <li>
              <Link
                href="/admin/settings"
                className="flex items-center gap-3 px-4 py-3 rounded-lg text-neutral-600 hover:bg-neutral-100"
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
        <div className="flex items-center gap-4 mb-6">
          <Link
            href="/admin/orders"
            className="p-2 hover:bg-white rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-neutral-600" />
          </Link>
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-neutral-900">Order #{orderId}</h1>
            <p className="text-neutral-600">{order.part.template} • {order.part.quantity} qty</p>
          </div>

          {order.status === 'new' && (
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeclineModal(true)}
                className="px-4 py-2 border border-red-300 text-red-600 rounded-lg font-medium hover:bg-red-50 flex items-center gap-2"
              >
                <X className="w-4 h-4" />
                Decline
              </button>
              <button
                onClick={() => setShowAcceptModal(true)}
                className="px-6 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 flex items-center gap-2"
              >
                <Check className="w-4 h-4" />
                Accept Order
              </button>
            </div>
          )}

          {order.status !== 'new' && (
            <button
              onClick={() => setShowStatusModal(true)}
              className="px-4 py-2 bg-[var(--color-primary)] text-white rounded-lg font-medium hover:opacity-90 flex items-center gap-2"
            >
              Update Status
              <ChevronDown className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Status Banner */}
        {order.status === 'new' && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6 flex items-center gap-3">
            <Clock className="w-5 h-5 text-amber-600" />
            <div className="flex-1">
              <p className="font-medium text-amber-800">Awaiting Your Confirmation</p>
              <p className="text-sm text-amber-600">
                Auto-decline in:{' '}
                {Math.round(
                  (new Date(order.autoDeclineAt).getTime() - Date.now()) / (1000 * 60 * 60)
                )}{' '}
                hours
              </p>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="bg-white rounded-xl shadow-sm border border-neutral-200 mb-6">
          <div className="flex border-b border-neutral-200">
            {[
              { id: 'overview', label: 'Overview', icon: FileText },
              { id: 'files', label: 'Files', icon: Download },
              { id: 'messages', label: 'Messages', icon: MessageSquare },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as typeof activeTab)}
                className={`flex items-center gap-2 px-6 py-4 text-sm font-medium border-b-2 -mb-px transition-colors ${
                  activeTab === tab.id
                    ? 'border-[var(--color-primary)] text-[var(--color-primary)]'
                    : 'border-transparent text-neutral-500 hover:text-neutral-700'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </div>

          <div className="p-6">
            {activeTab === 'overview' && (
              <div className="grid lg:grid-cols-2 gap-8">
                {/* Left Column */}
                <div className="space-y-6">
                  {/* Customer Info */}
                  <div>
                    <h3 className="text-sm font-medium text-neutral-500 mb-3">Customer</h3>
                    <div className="space-y-2">
                      <p className="text-neutral-900 font-medium">{order.customer.name}</p>
                      <p className="text-neutral-600">{order.customer.email}</p>
                      <p className="text-neutral-600">{order.customer.phone}</p>
                    </div>
                  </div>

                  {/* Shipping */}
                  <div>
                    <h3 className="text-sm font-medium text-neutral-500 mb-3">Ship To</h3>
                    <div className="space-y-1">
                      <p className="text-neutral-900">{order.shipping.address}</p>
                      <p className="text-neutral-600">
                        {order.shipping.city}, {order.shipping.state} {order.shipping.zip}
                      </p>
                      <p className="text-neutral-500 text-sm mt-2">{order.shipping.method}</p>
                    </div>
                  </div>

                  {/* Part Specs */}
                  <div>
                    <h3 className="text-sm font-medium text-neutral-500 mb-3">Part Specifications</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-neutral-500">Template</span>
                        <span className="text-neutral-900">{order.part.template}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-neutral-500">Dimensions</span>
                        <span className="text-neutral-900">
                          {order.part.width}&quot; × {order.part.height}&quot;
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-neutral-500">Thickness</span>
                        <span className="text-neutral-900">{order.part.thickness}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-neutral-500">Material</span>
                        <span className="text-neutral-900">{order.part.material}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-neutral-500">Holes</span>
                        <span className="text-neutral-900">{order.part.holes}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-neutral-500">Finish</span>
                        <span className="text-neutral-900">{order.part.finish}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-neutral-500">Quantity</span>
                        <span className="text-neutral-900 font-medium">{order.part.quantity} pcs</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right Column */}
                <div className="space-y-6">
                  {/* Pricing */}
                  <div>
                    <h3 className="text-sm font-medium text-neutral-500 mb-3">Pricing Breakdown</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-neutral-500">Material Cost</span>
                        <span className="text-neutral-900">${order.pricing.material.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-neutral-500">Cutting</span>
                        <span className="text-neutral-900">${order.pricing.cutting.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-neutral-500">Powder Coating</span>
                        <span className="text-neutral-900">${order.pricing.finish.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between border-t border-neutral-200 pt-2">
                        <span className="text-neutral-500">Subtotal</span>
                        <span className="text-neutral-900">${order.pricing.subtotal.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-green-600">
                        <span>{order.pricing.discountLabel}</span>
                        <span>-${order.pricing.discount.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-neutral-500">Shipping</span>
                        <span className="text-neutral-900">${order.pricing.shipping.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-neutral-500">Tax</span>
                        <span className="text-neutral-900">${order.pricing.tax.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between border-t border-neutral-200 pt-2 font-semibold">
                        <span className="text-neutral-900">Total</span>
                        <span className="text-neutral-900">${order.pricing.total.toFixed(2)}</span>
                      </div>
                    </div>

                    <div className="mt-4 p-3 bg-green-50 rounded-lg">
                      <div className="flex justify-between text-sm">
                        <span className="text-green-700">Your Payout</span>
                        <span className="text-green-700 font-semibold">
                          ${order.pricing.payout.toFixed(2)}
                        </span>
                      </div>
                      <p className="text-xs text-green-600 mt-1">
                        After 5% platform fee (${order.pricing.platformFee.toFixed(2)})
                      </p>
                    </div>
                  </div>

                  {/* Production Notes */}
                  <div>
                    <h3 className="text-sm font-medium text-neutral-500 mb-3">Production Notes</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-neutral-500">Est. Cutting Time</span>
                        <span className="text-neutral-900">{order.production.cuttingTime}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-neutral-500">Material Required</span>
                        <span className="text-neutral-900">{order.production.materialRequired}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-neutral-500">Stock Status</span>
                        <span className={order.production.inStock ? 'text-green-600' : 'text-red-600'}>
                          {order.production.inStock ? '✓ In Stock' : '✗ Out of Stock'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'files' && (
              <div>
                <h3 className="font-medium text-neutral-900 mb-4">Generated Files</h3>
                <div className="space-y-3">
                  {order.files.generated.map((file) => (
                    <div
                      key={file.name}
                      className="flex items-center justify-between p-4 bg-neutral-50 rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <FileText className="w-5 h-5 text-neutral-400" />
                        <div>
                          <p className="font-medium text-neutral-900">{file.name}</p>
                          <p className="text-xs text-neutral-500">{file.type}</p>
                        </div>
                      </div>
                      <button className="text-[var(--color-primary)] hover:underline text-sm font-medium">
                        Download
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'messages' && (
              <div>
                {order.messages.length === 0 ? (
                  <p className="text-neutral-500 text-center py-8">No messages yet</p>
                ) : (
                  <div className="space-y-4 mb-6">
                    {order.messages.map((msg) => (
                      <div key={msg.id} className="p-4 bg-neutral-50 rounded-lg">
                        <p className="text-neutral-700">{msg.message}</p>
                        <p className="text-xs text-neutral-500 mt-2">{formatDate(msg.timestamp)}</p>
                      </div>
                    ))}
                  </div>
                )}

                <div className="flex gap-3">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type a message to the customer..."
                    className="flex-1 px-4 py-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent"
                  />
                  <button
                    onClick={handleSendMessage}
                    disabled={!newMessage.trim()}
                    className="px-4 py-3 bg-[var(--color-primary)] text-white rounded-lg font-medium hover:opacity-90 disabled:opacity-50 flex items-center gap-2"
                  >
                    <Send className="w-4 h-4" />
                    Send
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Accept Modal */}
      {showAcceptModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowAcceptModal(false)} />
          <div className="relative bg-white rounded-2xl shadow-xl max-w-md w-full mx-4 p-6">
            <h2 className="text-xl font-semibold text-neutral-900 mb-4">Accept Order #{orderId}?</h2>
            <p className="text-neutral-600 mb-6">
              Confirming will notify the customer and commit to the quoted lead time.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowAcceptModal(false)}
                className="flex-1 px-4 py-3 border border-neutral-300 text-neutral-700 rounded-xl font-medium hover:bg-neutral-50"
              >
                Cancel
              </button>
              <button
                onClick={handleAccept}
                className="flex-1 px-4 py-3 bg-green-600 text-white rounded-xl font-medium hover:bg-green-700"
              >
                Accept Order
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Decline Modal */}
      {showDeclineModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowDeclineModal(false)} />
          <div className="relative bg-white rounded-2xl shadow-xl max-w-md w-full mx-4 p-6">
            <h2 className="text-xl font-semibold text-neutral-900 mb-4">Decline Order #{orderId}?</h2>
            <div className="flex items-start gap-3 p-4 bg-amber-50 border border-amber-200 rounded-lg mb-6">
              <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <p className="text-sm text-amber-800">
                The customer will receive a full refund. This may impact your seller rating.
              </p>
            </div>
            <div className="mb-6">
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Reason for declining
              </label>
              <textarea
                rows={3}
                placeholder="Explain why you're declining this order..."
                className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent"
              />
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeclineModal(false)}
                className="flex-1 px-4 py-3 border border-neutral-300 text-neutral-700 rounded-xl font-medium hover:bg-neutral-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDecline}
                className="flex-1 px-4 py-3 bg-red-600 text-white rounded-xl font-medium hover:bg-red-700"
              >
                Decline Order
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Status Update Modal */}
      {showStatusModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowStatusModal(false)} />
          <div className="relative bg-white rounded-2xl shadow-xl max-w-md w-full mx-4 p-6">
            <h2 className="text-xl font-semibold text-neutral-900 mb-4">Update Order Status</h2>
            <div className="mb-4">
              <label className="block text-sm font-medium text-neutral-700 mb-2">New Status</label>
              <select
                value={newStatus}
                onChange={(e) => setNewStatus(e.target.value)}
                className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent"
              >
                <option value="">Select status...</option>
                {statusOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            {newStatus === 'shipped' && (
              <div className="mb-4">
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  <Truck className="w-4 h-4 inline mr-1" />
                  Tracking Number
                </label>
                <input
                  type="text"
                  value={trackingNumber}
                  onChange={(e) => setTrackingNumber(e.target.value)}
                  placeholder="1Z999AA10123456784"
                  className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent"
                />
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={() => setShowStatusModal(false)}
                className="flex-1 px-4 py-3 border border-neutral-300 text-neutral-700 rounded-xl font-medium hover:bg-neutral-50"
              >
                Cancel
              </button>
              <button
                onClick={handleStatusUpdate}
                disabled={!newStatus}
                className="flex-1 px-4 py-3 bg-[var(--color-primary)] text-white rounded-xl font-medium hover:opacity-90 disabled:opacity-50"
              >
                Update Status
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
