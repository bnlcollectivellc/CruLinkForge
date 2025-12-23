'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useParams, useSearchParams } from 'next/navigation';
import {
  CheckCircle,
  Circle,
  Package,
  Truck,
  MapPin,
  Clock,
  MessageSquare,
  Download,
  ArrowLeft,
  ExternalLink,
} from 'lucide-react';

interface OrderStatus {
  id: string;
  label: string;
  date: string | null;
  completed: boolean;
  current: boolean;
}

interface OrderMessage {
  id: string;
  from: 'fabricator' | 'customer';
  message: string;
  timestamp: string;
}

// Mock order data - in real app this would come from API
const mockOrder = {
  id: 'FOR-ABC123',
  status: 'in_production',
  placedAt: '2025-12-21T10:32:00Z',
  estimatedDelivery: '2026-01-15',
  part: {
    name: 'Mounting Plate',
    template: 'mounting-plate',
    dimensions: '6" × 4"',
    material: 'Mild Steel 14ga',
    finish: 'Powder Coating (Black)',
    quantity: 50,
  },
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
    tracking: null,
  },
  payment: {
    subtotal: 1698.0,
    shipping: 45.0,
    tax: 165.61,
    total: 1908.61,
    method: 'Visa ****1234',
  },
  timeline: [
    { id: 'received', label: 'Order Received', date: '2025-12-21T10:32:00Z', completed: true, current: false },
    { id: 'confirmed', label: 'Order Confirmed', date: '2025-12-21T11:47:00Z', completed: true, current: false },
    { id: 'production', label: 'In Production', date: '2025-12-22T09:15:00Z', completed: true, current: true },
    { id: 'quality', label: 'Quality Check', date: null, completed: false, current: false },
    { id: 'shipped', label: 'Shipped', date: null, completed: false, current: false },
    { id: 'delivered', label: 'Delivered', date: null, completed: false, current: false },
  ],
  messages: [
    {
      id: '1',
      from: 'fabricator' as const,
      message: 'Your parts are in powder coating. Will ship early!',
      timestamp: '2026-01-02T14:30:00Z',
    },
  ],
};

export default function OrderTrackingPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const isNewOrder = searchParams.get('new') === 'true';
  const orderId = params.id as string;

  const [order] = useState(mockOrder);
  const [newMessage, setNewMessage] = useState('');
  const [showSuccess, setShowSuccess] = useState(isNewOrder);

  useEffect(() => {
    if (isNewOrder) {
      const timer = setTimeout(() => setShowSuccess(false), 5000);
      return () => clearTimeout(timer);
    }
  }, [isNewOrder]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
  };

  const handleSendMessage = () => {
    if (!newMessage.trim()) return;
    // In real app, would send to API
    setNewMessage('');
  };

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Navigation */}
      <nav className="bg-white border-b border-neutral-200">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
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

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Success Banner */}
        {showSuccess && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl flex items-center gap-3">
            <CheckCircle className="w-6 h-6 text-green-500" />
            <div>
              <p className="font-medium text-green-800">Order Confirmed!</p>
              <p className="text-sm text-green-600">
                We&apos;ve sent a confirmation email to {order.customer.email}
              </p>
            </div>
          </div>
        )}

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold text-neutral-900">Order #{orderId}</h1>
            <p className="text-neutral-600">
              Placed on {formatDate(order.placedAt)}
            </p>
          </div>
          <div className="flex gap-3">
            <button className="px-4 py-2 border border-neutral-300 text-neutral-700 rounded-lg text-sm font-medium hover:bg-neutral-50 flex items-center gap-2">
              <Download className="w-4 h-4" />
              Invoice
            </button>
            <button className="px-4 py-2 border border-neutral-300 text-neutral-700 rounded-lg text-sm font-medium hover:bg-neutral-50 flex items-center gap-2">
              <Download className="w-4 h-4" />
              Drawing
            </button>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Status Timeline */}
            <div className="bg-white rounded-2xl shadow-sm border border-neutral-200 p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-neutral-900">Order Status</h2>
                <div className="flex items-center gap-2 text-sm">
                  <Clock className="w-4 h-4 text-neutral-400" />
                  <span className="text-neutral-600">
                    Est. Delivery: {new Date(order.estimatedDelivery).toLocaleDateString('en-US', {
                      month: 'long',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </span>
                </div>
              </div>

              <div className="relative">
                {order.timeline.map((step, index) => (
                  <div key={step.id} className="flex gap-4 pb-8 last:pb-0">
                    {/* Line */}
                    {index < order.timeline.length - 1 && (
                      <div
                        className={`absolute left-[15px] top-8 w-0.5 h-[calc(100%-2rem)] ${
                          step.completed ? 'bg-green-500' : 'bg-neutral-200'
                        }`}
                        style={{ top: `${index * 64 + 32}px`, height: '48px' }}
                      />
                    )}
                    {/* Icon */}
                    <div className="relative z-10">
                      {step.completed ? (
                        <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center">
                          <CheckCircle className="w-5 h-5 text-white" />
                        </div>
                      ) : step.current ? (
                        <div className="w-8 h-8 rounded-full bg-[var(--color-primary)] flex items-center justify-center">
                          <Circle className="w-5 h-5 text-white" />
                        </div>
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-neutral-200 flex items-center justify-center">
                          <Circle className="w-5 h-5 text-neutral-400" />
                        </div>
                      )}
                    </div>
                    {/* Content */}
                    <div className="flex-1">
                      <p
                        className={`font-medium ${
                          step.completed || step.current ? 'text-neutral-900' : 'text-neutral-400'
                        }`}
                      >
                        {step.label}
                      </p>
                      {step.date && (
                        <p className="text-sm text-neutral-500">{formatDate(step.date)}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {order.shipping.tracking && (
                <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-xl">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Truck className="w-5 h-5 text-blue-600" />
                      <div>
                        <p className="font-medium text-blue-800">Tracking Available</p>
                        <p className="text-sm text-blue-600">{order.shipping.tracking}</p>
                      </div>
                    </div>
                    <a
                      href="#"
                      className="text-blue-600 hover:text-blue-800 flex items-center gap-1 text-sm font-medium"
                    >
                      Track Package
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  </div>
                </div>
              )}
            </div>

            {/* Messages */}
            <div className="bg-white rounded-2xl shadow-sm border border-neutral-200 p-6">
              <h2 className="text-lg font-semibold text-neutral-900 mb-4">Messages</h2>

              {order.messages.length > 0 ? (
                <div className="space-y-4 mb-6">
                  {order.messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`p-4 rounded-xl ${
                        msg.from === 'fabricator' ? 'bg-neutral-100' : 'bg-blue-50 ml-8'
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <span className="font-medium text-sm text-neutral-900">
                          {msg.from === 'fabricator' ? "Browning's Welding" : 'You'}
                        </span>
                        <span className="text-xs text-neutral-500">{formatDate(msg.timestamp)}</span>
                      </div>
                      <p className="text-neutral-700">{msg.message}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-neutral-500 mb-6">No messages yet</p>
              )}

              <div className="flex gap-3">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type a message..."
                  className="flex-1 px-4 py-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent"
                />
                <button
                  onClick={handleSendMessage}
                  disabled={!newMessage.trim()}
                  className="px-4 py-3 bg-[var(--color-primary)] text-white rounded-lg font-medium hover:opacity-90 disabled:opacity-50"
                >
                  <MessageSquare className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Part Details */}
            <div className="bg-white rounded-2xl shadow-sm border border-neutral-200 p-6">
              <h3 className="text-lg font-semibold text-neutral-900 mb-4">Part Details</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-neutral-500">Template</span>
                  <span className="text-neutral-900 font-medium">{order.part.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-500">Dimensions</span>
                  <span className="text-neutral-900">{order.part.dimensions}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-500">Material</span>
                  <span className="text-neutral-900">{order.part.material}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-500">Finish</span>
                  <span className="text-neutral-900">{order.part.finish}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-500">Quantity</span>
                  <span className="text-neutral-900">{order.part.quantity} pieces</span>
                </div>
              </div>
            </div>

            {/* Shipping */}
            <div className="bg-white rounded-2xl shadow-sm border border-neutral-200 p-6">
              <h3 className="text-lg font-semibold text-neutral-900 mb-4">Shipping</h3>
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-neutral-400 shrink-0 mt-0.5" />
                <div className="text-sm">
                  <p className="font-medium text-neutral-900">{order.customer.name}</p>
                  <p className="text-neutral-600">{order.shipping.address}</p>
                  <p className="text-neutral-600">
                    {order.shipping.city}, {order.shipping.state} {order.shipping.zip}
                  </p>
                  <p className="text-neutral-500 mt-2">{order.shipping.method}</p>
                </div>
              </div>
            </div>

            {/* Payment */}
            <div className="bg-white rounded-2xl shadow-sm border border-neutral-200 p-6">
              <h3 className="text-lg font-semibold text-neutral-900 mb-4">Payment</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-neutral-500">Subtotal</span>
                  <span className="text-neutral-900">${order.payment.subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-500">Shipping</span>
                  <span className="text-neutral-900">${order.payment.shipping.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-500">Tax</span>
                  <span className="text-neutral-900">${order.payment.tax.toFixed(2)}</span>
                </div>
                <div className="border-t border-neutral-200 pt-2 flex justify-between">
                  <span className="font-semibold text-neutral-900">Total</span>
                  <span className="font-semibold text-neutral-900">
                    ${order.payment.total.toFixed(2)}
                  </span>
                </div>
                <p className="text-neutral-500 pt-2">{order.payment.method}</p>
              </div>
            </div>

            {/* Need Help */}
            <div className="bg-neutral-100 rounded-2xl p-6">
              <h3 className="font-semibold text-neutral-900 mb-2">Need Help?</h3>
              <p className="text-sm text-neutral-600 mb-4">
                Contact us within 2 hours of placing your order to make changes.
              </p>
              <p className="text-sm">
                <span className="text-neutral-500">Email:</span>{' '}
                <a href="mailto:orders@browningswelding.com" className="text-[var(--color-primary)]">
                  orders@browningswelding.com
                </a>
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
