'use client';

import { useState, useCallback, useEffect, Suspense } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Upload, X, FileText, ArrowLeft, ArrowRight, Check } from 'lucide-react';

const materials = [
  { id: 'mild_steel', name: 'Mild Steel' },
  { id: 'stainless', name: 'Stainless Steel' },
  { id: 'aluminum', name: 'Aluminum' },
];

const thicknesses: Record<string, string[]> = {
  mild_steel: ['18ga', '16ga', '14ga', '12ga', '10ga', '1/8"', '3/16"', '1/4"'],
  stainless: ['18ga', '16ga', '14ga', '12ga', '10ga'],
  aluminum: ['0.063"', '0.080"', '0.090"', '1/8"', '3/16"', '1/4"'],
};

const softwareOptions = [
  'AutoCAD',
  'SolidWorks',
  'Adobe Illustrator',
  'Fusion 360',
  'SketchUp',
  'CorelDRAW',
  'Inkscape',
  'Other',
];

const steps = [
  { id: 1, name: 'Upload' },
  { id: 2, name: 'Details' },
  { id: 3, name: 'Contact' },
  { id: 4, name: 'Review' },
];

function QuotePageContent() {
  const searchParams = useSearchParams();

  // Step state
  const [currentStep, setCurrentStep] = useState(1);

  // Form state
  const [files, setFiles] = useState<File[]>([]);
  const [material, setMaterial] = useState('');
  const [thickness, setThickness] = useState('');
  const [sizeValue, setSizeValue] = useState('');
  const [sizeUnit, setSizeUnit] = useState<'inches' | 'mm'>('inches');
  const [quantity, setQuantity] = useState('1');
  const [software, setSoftware] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [zipCode, setZipCode] = useState('');
  const [purpose, setPurpose] = useState('');
  const [comments, setComments] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  // Check for pre-attached file from URL params
  useEffect(() => {
    const fileNames = searchParams.get('files');
    if (fileNames) {
      // Files were pre-attached from landing page drop
      // In production, we'd retrieve the actual files from temp storage
    }
  }, [searchParams]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFiles = Array.from(e.dataTransfer.files);
    setFiles((prev) => [...prev, ...droppedFiles].slice(0, 10));
  }, []);

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files);
      setFiles((prev) => [...prev, ...selectedFiles].slice(0, 10));
    }
  };

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setIsSubmitting(false);
    setIsSubmitted(true);
  };

  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return files.length > 0;
      case 2:
        return material && thickness;
      case 3:
        return name && email;
      case 4:
        return true;
      default:
        return false;
    }
  };

  const handleNext = () => {
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1);
    } else {
      handleSubmit();
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Check className="w-8 h-8 text-green-600" />
          </div>
          <h1 className="text-2xl font-bold text-neutral-900 mb-3">Quote Request Received!</h1>
          <p className="text-neutral-600 mb-6">
            Thank you for your request. We&apos;ll review your file and get back to you within 1 business day with a custom quote.
          </p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-6 py-3 bg-[var(--color-primary)] text-white rounded-xl font-medium hover:opacity-90"
          >
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Header */}
      <header className="bg-white border-b border-neutral-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
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
      </header>

      {/* Stepper */}
      <div className="bg-white border-b border-neutral-200">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 py-6">
          <div className="flex items-center justify-center">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <div className="flex items-center gap-2">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${
                      currentStep >= step.id
                        ? 'bg-[var(--color-primary)] text-white'
                        : 'bg-neutral-200 text-neutral-500'
                    }`}
                  >
                    {currentStep > step.id ? <Check className="w-4 h-4" /> : step.id}
                  </div>
                  <span
                    className={`text-sm font-medium ${
                      currentStep >= step.id ? 'text-neutral-900' : 'text-neutral-400'
                    }`}
                  >
                    {step.name}
                  </span>
                </div>
                {index < steps.length - 1 && (
                  <div
                    className={`w-12 sm:w-20 h-0.5 mx-2 sm:mx-4 ${
                      currentStep > step.id ? 'bg-[var(--color-primary)]' : 'bg-neutral-200'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      <main className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
        <div className="bg-white rounded-2xl shadow-sm border border-neutral-200 overflow-hidden">
          {/* Step 1: Upload Files */}
          {currentStep === 1 && (
            <div className="p-6">
              <h2 className="text-xl font-semibold text-neutral-900 mb-2">Upload Your Files</h2>
              <p className="text-neutral-600 mb-6">
                Upload your design files to get started with your quote.
              </p>

              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors ${
                  isDragging
                    ? 'border-[var(--color-primary)] bg-red-50'
                    : 'border-neutral-300 hover:border-neutral-400'
                }`}
              >
                <input
                  type="file"
                  id="file-upload"
                  multiple
                  accept=".ai,.dxf,.dwg,.eps,.stp,.step"
                  onChange={handleFileInput}
                  className="hidden"
                />
                <label htmlFor="file-upload" className="cursor-pointer">
                  <Upload className="w-10 h-10 text-neutral-400 mx-auto mb-3" />
                  <div className="inline-flex items-center gap-2 px-6 py-3 bg-neutral-900 text-white rounded-lg font-medium hover:bg-neutral-800 transition-colors">
                    BROWSE FILES
                  </div>
                </label>
                <p className="text-neutral-500 mt-4">or drag and drop here</p>
                <p className="text-neutral-400 text-sm mt-2">(.ai, .dxf, .dwg, .eps, .stp, .step)</p>
              </div>

              {/* Uploaded Files List */}
              {files.length > 0 && (
                <div className="mt-4 space-y-2">
                  {files.map((file, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 bg-neutral-50 rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <FileText className="w-5 h-5 text-neutral-400" />
                        <span className="text-sm text-neutral-700 truncate max-w-xs">
                          {file.name}
                        </span>
                        <span className="text-xs text-neutral-400">
                          ({(file.size / 1024).toFixed(1)} KB)
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeFile(index)}
                        className="p-1 hover:bg-neutral-200 rounded"
                      >
                        <X className="w-4 h-4 text-neutral-500" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Step 2: Part Details */}
          {currentStep === 2 && (
            <div className="p-6 space-y-6">
              <div>
                <h2 className="text-xl font-semibold text-neutral-900 mb-2">Part Details</h2>
                <p className="text-neutral-600">
                  Tell us about your part specifications.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">Material *</label>
                  <select
                    value={material}
                    onChange={(e) => {
                      setMaterial(e.target.value);
                      setThickness('');
                    }}
                    className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent"
                  >
                    <option value="">Select...</option>
                    {materials.map((m) => (
                      <option key={m.id} value={m.id}>{m.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">Thickness *</label>
                  <select
                    value={thickness}
                    onChange={(e) => setThickness(e.target.value)}
                    disabled={!material}
                    className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent disabled:bg-neutral-100 disabled:cursor-not-allowed"
                  >
                    <option value="">Select material first...</option>
                    {material && thicknesses[material]?.map((t) => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">Size (optional)</label>
                  <input
                    type="number"
                    value={sizeValue}
                    onChange={(e) => setSizeValue(e.target.value)}
                    min="0"
                    step="0.01"
                    placeholder="e.g., 6"
                    className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">Unit</label>
                  <div className="flex rounded-lg overflow-hidden border border-neutral-300">
                    <button
                      type="button"
                      onClick={() => setSizeUnit('inches')}
                      className={`flex-1 py-3 text-sm font-medium transition-colors ${
                        sizeUnit === 'inches'
                          ? 'bg-[var(--color-primary)] text-white'
                          : 'bg-white text-neutral-700 hover:bg-neutral-50'
                      }`}
                    >
                      Inches
                    </button>
                    <button
                      type="button"
                      onClick={() => setSizeUnit('mm')}
                      className={`flex-1 py-3 text-sm font-medium transition-colors ${
                        sizeUnit === 'mm'
                          ? 'bg-[var(--color-primary)] text-white'
                          : 'bg-white text-neutral-700 hover:bg-neutral-50'
                      }`}
                    >
                      mm
                    </button>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">Quantity</label>
                  <input
                    type="number"
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    min="1"
                    className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  Which Software Did You Use?
                </label>
                <select
                  value={software}
                  onChange={(e) => setSoftware(e.target.value)}
                  className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent"
                >
                  <option value="">Select...</option>
                  {softwareOptions.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {/* Step 3: Contact Info */}
          {currentStep === 3 && (
            <div className="p-6 space-y-6">
              <div>
                <h2 className="text-xl font-semibold text-neutral-900 mb-2">Contact Information</h2>
                <p className="text-neutral-600">
                  How can we reach you with your quote?
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">Name *</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your name"
                  className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">Email *</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">Zip Code</label>
                  <input
                    type="text"
                    value={zipCode}
                    onChange={(e) => setZipCode(e.target.value)}
                    placeholder="12345"
                    className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  What is this for?
                </label>
                <input
                  type="text"
                  value={purpose}
                  onChange={(e) => setPurpose(e.target.value)}
                  placeholder="e.g., Industrial equipment, automotive, home project..."
                  className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">Comments</label>
                <textarea
                  value={comments}
                  onChange={(e) => setComments(e.target.value)}
                  rows={3}
                  placeholder="Any additional details or special requirements..."
                  className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent resize-none"
                />
              </div>
            </div>
          )}

          {/* Step 4: Review */}
          {currentStep === 4 && (
            <div className="p-6 space-y-6">
              <div>
                <h2 className="text-xl font-semibold text-neutral-900 mb-2">Review Your Request</h2>
                <p className="text-neutral-600">
                  Please verify your information before submitting.
                </p>
              </div>

              <div className="space-y-4">
                <div className="bg-neutral-50 rounded-xl p-4">
                  <h3 className="text-sm font-medium text-neutral-500 mb-3">Files</h3>
                  <div className="space-y-2">
                    {files.map((file, index) => (
                      <div key={index} className="flex items-center gap-2 text-sm text-neutral-700">
                        <FileText className="w-4 h-4 text-neutral-400" />
                        {file.name}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-neutral-50 rounded-xl p-4">
                  <h3 className="text-sm font-medium text-neutral-500 mb-3">Part Details</h3>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <span className="text-neutral-500">Material:</span>
                      <span className="ml-2 text-neutral-900">{materials.find(m => m.id === material)?.name || '-'}</span>
                    </div>
                    <div>
                      <span className="text-neutral-500">Thickness:</span>
                      <span className="ml-2 text-neutral-900">{thickness || '-'}</span>
                    </div>
                    <div>
                      <span className="text-neutral-500">Size:</span>
                      <span className="ml-2 text-neutral-900">{sizeValue ? `${sizeValue} ${sizeUnit}` : '-'}</span>
                    </div>
                    <div>
                      <span className="text-neutral-500">Quantity:</span>
                      <span className="ml-2 text-neutral-900">{quantity}</span>
                    </div>
                  </div>
                </div>

                <div className="bg-neutral-50 rounded-xl p-4">
                  <h3 className="text-sm font-medium text-neutral-500 mb-3">Contact Info</h3>
                  <div className="space-y-2 text-sm">
                    <div>
                      <span className="text-neutral-500">Name:</span>
                      <span className="ml-2 text-neutral-900">{name}</span>
                    </div>
                    <div>
                      <span className="text-neutral-500">Email:</span>
                      <span className="ml-2 text-neutral-900">{email}</span>
                    </div>
                    {zipCode && (
                      <div>
                        <span className="text-neutral-500">Zip Code:</span>
                        <span className="ml-2 text-neutral-900">{zipCode}</span>
                      </div>
                    )}
                    {purpose && (
                      <div>
                        <span className="text-neutral-500">Purpose:</span>
                        <span className="ml-2 text-neutral-900">{purpose}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex items-center justify-between p-6 border-t border-neutral-200 bg-neutral-50">
            <button
              onClick={handleBack}
              disabled={currentStep === 1}
              className="px-6 py-3 text-neutral-700 font-medium hover:text-neutral-900 disabled:opacity-0 disabled:pointer-events-none flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </button>
            <button
              onClick={handleNext}
              disabled={!canProceed() || isSubmitting}
              className="px-8 py-3 bg-[var(--color-primary)] text-white rounded-xl font-medium hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isSubmitting ? (
                'Submitting...'
              ) : currentStep === 4 ? (
                'Submit Request'
              ) : (
                <>
                  Next
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}

function QuoteLoading() {
  return (
    <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
      <div className="text-neutral-500">Loading...</div>
    </div>
  );
}

export default function QuotePage() {
  return (
    <Suspense fallback={<QuoteLoading />}>
      <QuotePageContent />
    </Suspense>
  );
}
