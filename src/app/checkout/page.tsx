'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, ArrowRight, Check, CreditCard, Building2, Truck, MapPin, Loader2 } from 'lucide-react';
import { useConfigurator } from '@/store/useConfigurator';

type CheckoutStep = 'contact' | 'shipping' | 'payment' | 'review';

const shippingMethods = [
  { id: 'pickup', name: 'Local Pickup', price: 0, time: 'Ready in 5-7 days', icon: MapPin },
  { id: 'ground', name: 'UPS Ground', price: 45, time: '5-7 business days', icon: Truck },
  { id: 'express', name: 'UPS Express', price: 85, time: '2-3 business days', icon: Truck },
];

export default function CheckoutPage() {
  const router = useRouter();
  const { priceBreakdown, selectedTemplate, selectedMaterial, quantity, reset } = useConfigurator();

  const [currentStep, setCurrentStep] = useState<CheckoutStep>('contact');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form state
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [company, setCompany] = useState('');
  const [address, setAddress] = useState('');
  const [apartment, setApartment] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [zip, setZip] = useState('');
  const [shippingMethod, setShippingMethod] = useState('ground');
  const [specialInstructions, setSpecialInstructions] = useState('');
  const [createAccount, setCreateAccount] = useState(false);
  const [password, setPassword] = useState('');

  const steps: { id: CheckoutStep; label: string }[] = [
    { id: 'contact', label: 'Contact' },
    { id: 'shipping', label: 'Shipping' },
    { id: 'payment', label: 'Payment' },
    { id: 'review', label: 'Review' },
  ];

  const currentStepIndex = steps.findIndex((s) => s.id === currentStep);

  const goToStep = (step: CheckoutStep) => {
    setCurrentStep(step);
  };

  const nextStep = () => {
    const nextIndex = currentStepIndex + 1;
    if (nextIndex < steps.length) {
      setCurrentStep(steps[nextIndex].id);
    }
  };

  const prevStep = () => {
    const prevIndex = currentStepIndex - 1;
    if (prevIndex >= 0) {
      setCurrentStep(steps[prevIndex].id);
    }
  };

  const selectedShipping = shippingMethods.find((m) => m.id === shippingMethod);
  const shippingCost = selectedShipping?.price || 0;
  const subtotal = priceBreakdown?.total || 0;
  const tax = subtotal * 0.095; // 9.5% Arkansas tax
  const total = subtotal + shippingCost + tax;

  const handleSubmitOrder = async () => {
    setIsSubmitting(true);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // Generate order ID
    const orderId = `FOR-${Date.now().toString(36).toUpperCase()}`;

    // Reset configurator and redirect to confirmation
    reset();
    router.push(`/order/${orderId}?new=true`);
  };

  if (!priceBreakdown) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-xl font-semibold text-neutral-900 mb-2">No items to checkout</h1>
          <p className="text-neutral-600 mb-4">Please configure your part first.</p>
          <Link
            href="/builder"
            className="inline-flex items-center gap-2 px-6 py-3 bg-[var(--color-primary)] text-white rounded-xl font-medium"
          >
            Go to Builder
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Navigation */}
      <nav className="bg-white border-b border-neutral-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center gap-3">
              <Image src="/logo.png" alt="Logo" width={40} height={40} className="h-10 w-auto" />
            </Link>
            <Link
              href="/builder"
              className="text-sm text-neutral-600 hover:text-neutral-900 flex items-center gap-1"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Builder
            </Link>
          </div>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Progress Steps */}
        <div className="flex items-center justify-center gap-4 mb-8">
          {steps.map((step, index) => (
            <div key={step.id} className="flex items-center">
              <button
                onClick={() => index <= currentStepIndex && goToStep(step.id)}
                disabled={index > currentStepIndex}
                className={`flex items-center gap-2 ${
                  index <= currentStepIndex ? 'cursor-pointer' : 'cursor-not-allowed opacity-50'
                }`}
              >
                <span
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                    index < currentStepIndex
                      ? 'bg-green-500 text-white'
                      : index === currentStepIndex
                      ? 'bg-[var(--color-primary)] text-white'
                      : 'bg-neutral-200 text-neutral-500'
                  }`}
                >
                  {index < currentStepIndex ? <Check className="w-4 h-4" /> : index + 1}
                </span>
                <span
                  className={`text-sm font-medium ${
                    index === currentStepIndex ? 'text-neutral-900' : 'text-neutral-500'
                  }`}
                >
                  {step.label}
                </span>
              </button>
              {index < steps.length - 1 && <div className="w-12 h-px bg-neutral-300 mx-4" />}
            </div>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Form Section */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-sm border border-neutral-200 p-6">
              {/* Contact Step */}
              {currentStep === 'contact' && (
                <div>
                  <h2 className="text-xl font-semibold text-neutral-900 mb-6">Contact Information</h2>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-neutral-700 mb-1">
                        Email Address *
                      </label>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="you@company.com"
                        className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-neutral-700 mb-1">
                        Phone (optional)
                      </label>
                      <input
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="(555) 123-4567"
                        className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent"
                      />
                    </div>
                  </div>
                  <div className="mt-8 flex justify-end">
                    <button
                      onClick={nextStep}
                      disabled={!email}
                      className="px-6 py-3 bg-[var(--color-primary)] text-white rounded-xl font-medium hover:opacity-90 disabled:opacity-50 flex items-center gap-2"
                    >
                      Continue to Shipping
                      <ArrowRight className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              )}

              {/* Shipping Step */}
              {currentStep === 'shipping' && (
                <div>
                  <h2 className="text-xl font-semibold text-neutral-900 mb-6">Shipping Address</h2>
                  <div className="space-y-4">
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-neutral-700 mb-1">
                          First Name *
                        </label>
                        <input
                          type="text"
                          value={firstName}
                          onChange={(e) => setFirstName(e.target.value)}
                          className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-neutral-700 mb-1">
                          Last Name *
                        </label>
                        <input
                          type="text"
                          value={lastName}
                          onChange={(e) => setLastName(e.target.value)}
                          className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-neutral-700 mb-1">
                        Company (optional)
                      </label>
                      <input
                        type="text"
                        value={company}
                        onChange={(e) => setCompany(e.target.value)}
                        className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-neutral-700 mb-1">
                        Street Address *
                      </label>
                      <input
                        type="text"
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-neutral-700 mb-1">
                        Apt / Suite (optional)
                      </label>
                      <input
                        type="text"
                        value={apartment}
                        onChange={(e) => setApartment(e.target.value)}
                        className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent"
                      />
                    </div>
                    <div className="grid sm:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-neutral-700 mb-1">City *</label>
                        <input
                          type="text"
                          value={city}
                          onChange={(e) => setCity(e.target.value)}
                          className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-neutral-700 mb-1">State *</label>
                        <select
                          value={state}
                          onChange={(e) => setState(e.target.value)}
                          className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent"
                        >
                          <option value="">Select</option>
                          <option value="AR">Arkansas</option>
                          <option value="TX">Texas</option>
                          <option value="OK">Oklahoma</option>
                          <option value="MO">Missouri</option>
                          <option value="TN">Tennessee</option>
                          <option value="LA">Louisiana</option>
                          <option value="MS">Mississippi</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-neutral-700 mb-1">ZIP *</label>
                        <input
                          type="text"
                          value={zip}
                          onChange={(e) => setZip(e.target.value)}
                          className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent"
                        />
                      </div>
                    </div>
                  </div>

                  <h3 className="text-lg font-semibold text-neutral-900 mt-8 mb-4">Shipping Method</h3>
                  <div className="space-y-3">
                    {shippingMethods.map((method) => (
                      <label
                        key={method.id}
                        className={`flex items-center p-4 border-2 rounded-xl cursor-pointer transition-colors ${
                          shippingMethod === method.id
                            ? 'border-[var(--color-primary)] bg-red-50'
                            : 'border-neutral-200 hover:border-neutral-300'
                        }`}
                      >
                        <input
                          type="radio"
                          name="shipping"
                          value={method.id}
                          checked={shippingMethod === method.id}
                          onChange={(e) => setShippingMethod(e.target.value)}
                          className="sr-only"
                        />
                        <method.icon className="w-5 h-5 text-neutral-500 mr-4" />
                        <div className="flex-1">
                          <p className="font-medium text-neutral-900">{method.name}</p>
                          <p className="text-sm text-neutral-500">{method.time}</p>
                        </div>
                        <span className="font-medium text-neutral-900">
                          {method.price === 0 ? 'FREE' : `$${method.price.toFixed(2)}`}
                        </span>
                      </label>
                    ))}
                  </div>

                  <div className="mt-8 flex justify-between">
                    <button
                      onClick={prevStep}
                      className="px-6 py-3 border border-neutral-300 text-neutral-700 rounded-xl font-medium hover:bg-neutral-50 flex items-center gap-2"
                    >
                      <ArrowLeft className="w-5 h-5" />
                      Back
                    </button>
                    <button
                      onClick={nextStep}
                      disabled={!firstName || !lastName || !address || !city || !state || !zip}
                      className="px-6 py-3 bg-[var(--color-primary)] text-white rounded-xl font-medium hover:opacity-90 disabled:opacity-50 flex items-center gap-2"
                    >
                      Continue to Payment
                      <ArrowRight className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              )}

              {/* Payment Step */}
              {currentStep === 'payment' && (
                <div>
                  <h2 className="text-xl font-semibold text-neutral-900 mb-6">Payment Information</h2>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-neutral-700 mb-1">
                        Card Number
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          placeholder="1234 5678 9012 3456"
                          className="w-full px-4 py-3 pl-12 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent"
                        />
                        <CreditCard className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-neutral-700 mb-1">
                          Expiration
                        </label>
                        <input
                          type="text"
                          placeholder="MM / YY"
                          className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-neutral-700 mb-1">CVV</label>
                        <input
                          type="text"
                          placeholder="123"
                          className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent"
                        />
                      </div>
                    </div>
                  </div>

                  <h3 className="text-lg font-semibold text-neutral-900 mt-8 mb-4">
                    Special Instructions (optional)
                  </h3>
                  <textarea
                    value={specialInstructions}
                    onChange={(e) => setSpecialInstructions(e.target.value)}
                    placeholder="Any special notes or requirements..."
                    rows={3}
                    className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent"
                  />

                  <div className="mt-8 p-4 bg-neutral-50 rounded-xl">
                    <label className="flex items-start gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={createAccount}
                        onChange={(e) => setCreateAccount(e.target.checked)}
                        className="mt-1"
                      />
                      <div>
                        <p className="font-medium text-neutral-900">Create an account</p>
                        <p className="text-sm text-neutral-500">
                          Track orders, save designs, and checkout faster next time
                        </p>
                      </div>
                    </label>
                    {createAccount && (
                      <div className="mt-4">
                        <label className="block text-sm font-medium text-neutral-700 mb-1">
                          Create Password
                        </label>
                        <input
                          type="password"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent"
                        />
                      </div>
                    )}
                  </div>

                  <div className="mt-8 flex justify-between">
                    <button
                      onClick={prevStep}
                      className="px-6 py-3 border border-neutral-300 text-neutral-700 rounded-xl font-medium hover:bg-neutral-50 flex items-center gap-2"
                    >
                      <ArrowLeft className="w-5 h-5" />
                      Back
                    </button>
                    <button
                      onClick={nextStep}
                      className="px-6 py-3 bg-[var(--color-primary)] text-white rounded-xl font-medium hover:opacity-90 flex items-center gap-2"
                    >
                      Review Order
                      <ArrowRight className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              )}

              {/* Review Step */}
              {currentStep === 'review' && (
                <div>
                  <h2 className="text-xl font-semibold text-neutral-900 mb-6">Review Your Order</h2>

                  <div className="space-y-6">
                    <div className="p-4 bg-neutral-50 rounded-xl">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-medium text-neutral-900">Contact</h3>
                        <button
                          onClick={() => goToStep('contact')}
                          className="text-sm text-[var(--color-primary)] hover:underline"
                        >
                          Edit
                        </button>
                      </div>
                      <p className="text-neutral-600">{email}</p>
                      {phone && <p className="text-neutral-600">{phone}</p>}
                    </div>

                    <div className="p-4 bg-neutral-50 rounded-xl">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-medium text-neutral-900">Ship to</h3>
                        <button
                          onClick={() => goToStep('shipping')}
                          className="text-sm text-[var(--color-primary)] hover:underline"
                        >
                          Edit
                        </button>
                      </div>
                      <p className="text-neutral-600">
                        {firstName} {lastName}
                        {company && <span> • {company}</span>}
                      </p>
                      <p className="text-neutral-600">{address}</p>
                      <p className="text-neutral-600">
                        {city}, {state} {zip}
                      </p>
                    </div>

                    <div className="p-4 bg-neutral-50 rounded-xl">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-medium text-neutral-900">Shipping Method</h3>
                        <button
                          onClick={() => goToStep('shipping')}
                          className="text-sm text-[var(--color-primary)] hover:underline"
                        >
                          Edit
                        </button>
                      </div>
                      <p className="text-neutral-600">
                        {selectedShipping?.name} - {selectedShipping?.time}
                      </p>
                    </div>
                  </div>

                  <div className="mt-8 p-4 border border-neutral-200 rounded-xl">
                    <label className="flex items-start gap-3 cursor-pointer">
                      <input type="checkbox" className="mt-1" />
                      <p className="text-sm text-neutral-600">
                        I have reviewed my order and specifications and agree to the{' '}
                        <a href="#" className="text-[var(--color-primary)] hover:underline">
                          Terms of Service
                        </a>{' '}
                        and{' '}
                        <a href="#" className="text-[var(--color-primary)] hover:underline">
                          Privacy Policy
                        </a>
                      </p>
                    </label>
                  </div>

                  <div className="mt-8 flex justify-between">
                    <button
                      onClick={prevStep}
                      className="px-6 py-3 border border-neutral-300 text-neutral-700 rounded-xl font-medium hover:bg-neutral-50 flex items-center gap-2"
                    >
                      <ArrowLeft className="w-5 h-5" />
                      Back
                    </button>
                    <button
                      onClick={handleSubmitOrder}
                      disabled={isSubmitting}
                      className="px-8 py-3 bg-[var(--color-primary)] text-white rounded-xl font-medium hover:opacity-90 disabled:opacity-50 flex items-center gap-2"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="w-5 h-5 animate-spin" />
                          Processing...
                        </>
                      ) : (
                        <>
                          Place Order - ${total.toFixed(2)}
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Order Summary Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-sm border border-neutral-200 p-6 sticky top-24">
              <h3 className="text-lg font-semibold text-neutral-900 mb-4">Order Summary</h3>

              <div className="flex items-center gap-4 p-4 bg-neutral-50 rounded-xl mb-4">
                <div className="w-16 h-16 bg-neutral-200 rounded-lg flex items-center justify-center">
                  <Building2 className="w-8 h-8 text-neutral-400" />
                </div>
                <div>
                  <p className="font-medium text-neutral-900">{selectedTemplate?.name || 'Custom Part'}</p>
                  <p className="text-sm text-neutral-500">Qty: {quantity}</p>
                </div>
              </div>

              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-neutral-600">Subtotal</span>
                  <span className="text-neutral-900">${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-600">Shipping</span>
                  <span className="text-neutral-900">
                    {shippingCost === 0 ? 'FREE' : `$${shippingCost.toFixed(2)}`}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-600">Tax (9.5%)</span>
                  <span className="text-neutral-900">${tax.toFixed(2)}</span>
                </div>
                <div className="border-t border-neutral-200 pt-3 flex justify-between">
                  <span className="font-semibold text-neutral-900">Total</span>
                  <span className="font-semibold text-neutral-900">${total.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
