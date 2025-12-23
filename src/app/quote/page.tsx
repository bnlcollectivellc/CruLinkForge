'use client';

import { useState, useCallback, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Upload, X, FileText, ArrowLeft, Check } from 'lucide-react';

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

export default function QuotePage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Form state
  const [files, setFiles] = useState<File[]>([]);
  const [material, setMaterial] = useState('');
  const [thickness, setThickness] = useState('');
  const [sizeValue, setSizeValue] = useState('1');
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
    const fileName = searchParams.get('fileName');
    if (fileName) {
      // File was pre-attached from landing page drop
      // In production, we'd retrieve the actual file from temp storage
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500));

    setIsSubmitting(false);
    setIsSubmitted(true);
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-neutral-100 flex items-center justify-center p-4">
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
    <div className="min-h-screen bg-neutral-100">
      {/* Header */}
      <header className="bg-white border-b border-neutral-200 sticky top-0 z-50">
        <div className="max-w-2xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center gap-3">
              <Image src="/logo.png" alt="Logo" width={40} height={40} className="h-10 w-auto" />
            </Link>
            <Link
              href="/"
              className="text-sm text-neutral-600 hover:text-neutral-900 flex items-center gap-1"
            >
              <X className="w-4 h-4" />
              Close
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
        <div className="bg-white rounded-2xl shadow-sm border border-neutral-200 overflow-hidden">
          {/* Form Header */}
          <div className="p-6 border-b border-neutral-200">
            <h1 className="text-2xl font-bold text-neutral-900">Request Custom Quote</h1>
            <p className="text-neutral-600 mt-1">
              Need help with a custom project? No problem! Fill out the form below and we&apos;ll get right back to you.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* File Upload */}
            <div>
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
                  <div className="inline-flex items-center gap-2 px-6 py-3 bg-neutral-900 text-white rounded-lg font-medium hover:bg-neutral-800 transition-colors">
                    <Upload className="w-5 h-5" />
                    BROWSE FILES
                  </div>
                </label>
                <p className="text-neutral-500 mt-3 italic">OR</p>
                <p className="text-neutral-500">Drag and Drop here</p>
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

              <p className="text-sm text-neutral-500 mt-3">
                If you designed your file in Adobe Illustrator, please send us the .ai file.
              </p>
            </div>

            {/* Material & Size Row */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">Material</label>
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
                <label className="block text-sm font-medium text-neutral-700 mb-2">Size</label>
                <input
                  type="number"
                  value={sizeValue}
                  onChange={(e) => setSizeValue(e.target.value)}
                  min="0"
                  step="0.01"
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
                    Millimeters
                  </button>
                </div>
              </div>
            </div>

            {/* Thickness & Quantity Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">Thickness</label>
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

            {/* Software */}
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

            {/* Contact Info */}
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your name"
                required
                className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
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

            {/* Purpose & Comments */}
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
                rows={4}
                placeholder="Any additional details or special requirements..."
                className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent resize-none"
              />
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-4 pt-4 border-t border-neutral-200">
              <Link
                href="/"
                className="px-6 py-3 text-neutral-700 font-medium hover:text-neutral-900"
              >
                CLOSE
              </Link>
              <button
                type="submit"
                disabled={isSubmitting || !email || !name}
                className="px-8 py-3 bg-[var(--color-primary)] text-white rounded-lg font-medium hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Submitting...' : 'REQUEST QUOTE'}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}
