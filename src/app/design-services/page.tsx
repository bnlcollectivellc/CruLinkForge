'use client';

import { useState, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Upload, X, FileText, Check, Pencil, FileCode, Ruler, MessageSquare, ArrowLeft, ArrowRight } from 'lucide-react';

const serviceOptions = [
  {
    id: 'sketch_to_cad',
    label: 'Convert sketch to CAD file',
    description: 'Turn your hand-drawn sketch into a professional DXF/CAD file',
    icon: Pencil,
  },
  {
    id: 'measurements_to_dxf',
    label: 'Create DXF from measurements',
    description: 'Provide dimensions and we\'ll create the file for you',
    icon: Ruler,
  },
  {
    id: 'modify_design',
    label: 'Modify existing design',
    description: 'Make changes to an existing file or template',
    icon: FileCode,
  },
  {
    id: 'full_design',
    label: 'Full design from description',
    description: 'Describe what you need and we\'ll design it from scratch',
    icon: MessageSquare,
  },
];

const materials = [
  { id: 'mild_steel', name: 'Mild Steel' },
  { id: 'stainless', name: 'Stainless Steel' },
  { id: 'aluminum', name: 'Aluminum' },
  { id: 'not_sure', name: 'Not sure yet' },
];

const steps = [
  { id: 1, name: 'Services' },
  { id: 2, name: 'Details' },
  { id: 3, name: 'Contact' },
  { id: 4, name: 'Review' },
];

export default function DesignServicesPage() {
  // Step state
  const [currentStep, setCurrentStep] = useState(1);

  // Form state
  const [files, setFiles] = useState<File[]>([]);
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [material, setMaterial] = useState('');
  const [dimensions, setDimensions] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

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

  const toggleService = (serviceId: string) => {
    setSelectedServices((prev) =>
      prev.includes(serviceId)
        ? prev.filter((id) => id !== serviceId)
        : [...prev, serviceId]
    );
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
        return selectedServices.length > 0;
      case 2:
        return description.trim().length > 0;
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
          <h1 className="text-2xl font-bold text-neutral-900 mb-3">Request Submitted!</h1>
          <p className="text-neutral-600 mb-6">
            Thank you for your design services request. Our team will review your submission and get back to you within 1-2 business days with a quote and timeline.
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
          {/* Step 1: Select Services */}
          {currentStep === 1 && (
            <div className="p-6">
              <h2 className="text-xl font-semibold text-neutral-900 mb-2">What do you need help with?</h2>
              <p className="text-neutral-600 mb-6">
                Select all services that apply to your project.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {serviceOptions.map((service) => {
                  const isSelected = selectedServices.includes(service.id);
                  const Icon = service.icon;
                  return (
                    <button
                      key={service.id}
                      type="button"
                      onClick={() => toggleService(service.id)}
                      className={`p-4 rounded-xl border-2 text-left transition-all relative ${
                        isSelected
                          ? 'border-[var(--color-primary)] bg-red-50'
                          : 'border-neutral-200 hover:border-neutral-300'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div
                          className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${
                            isSelected ? 'bg-[var(--color-primary)] text-white' : 'bg-neutral-100 text-neutral-500'
                          }`}
                        >
                          <Icon className="w-5 h-5" />
                        </div>
                        <div>
                          <p className={`font-medium ${isSelected ? 'text-[var(--color-primary)]' : 'text-neutral-900'}`}>
                            {service.label}
                          </p>
                          <p className="text-xs text-neutral-500 mt-0.5">{service.description}</p>
                        </div>
                      </div>
                      {isSelected && (
                        <div className="absolute top-3 right-3">
                          <Check className="w-5 h-5 text-[var(--color-primary)]" />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Step 2: Project Details */}
          {currentStep === 2 && (
            <div className="p-6 space-y-6">
              <div>
                <h2 className="text-xl font-semibold text-neutral-900 mb-2">Project Details</h2>
                <p className="text-neutral-600">
                  Tell us more about what you need.
                </p>
              </div>

              {/* File Upload */}
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  Upload your sketch, reference, or existing file (optional)
                </label>
                <div
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  className={`border-2 border-dashed rounded-xl p-6 text-center transition-colors ${
                    isDragging
                      ? 'border-[var(--color-primary)] bg-red-50'
                      : 'border-neutral-300 hover:border-neutral-400'
                  }`}
                >
                  <input
                    type="file"
                    id="file-upload"
                    multiple
                    accept=".ai,.dxf,.dwg,.eps,.stp,.step,.pdf,.jpg,.jpeg,.png,.heic"
                    onChange={handleFileInput}
                    className="hidden"
                  />
                  <label htmlFor="file-upload" className="cursor-pointer">
                    <Upload className="w-8 h-8 text-neutral-400 mx-auto mb-2" />
                    <p className="text-sm text-neutral-600">
                      <span className="text-[var(--color-primary)] font-medium">Click to upload</span> or drag and drop
                    </p>
                    <p className="text-xs text-neutral-400 mt-1">
                      Sketches, photos, PDFs, or CAD files
                    </p>
                  </label>
                </div>

                {/* Uploaded Files List */}
                {files.length > 0 && (
                  <div className="mt-3 space-y-2">
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

              {/* Material & Dimensions */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">
                    Material Preference
                  </label>
                  <select
                    value={material}
                    onChange={(e) => setMaterial(e.target.value)}
                    className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent"
                  >
                    <option value="">Select...</option>
                    {materials.map((m) => (
                      <option key={m.id} value={m.id}>{m.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">
                    Approximate Dimensions
                  </label>
                  <input
                    type="text"
                    value={dimensions}
                    onChange={(e) => setDimensions(e.target.value)}
                    placeholder='e.g., 6" x 4" or 150mm x 100mm'
                    className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent"
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  Describe what you need *
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={4}
                  placeholder="Tell us about your project, what you're trying to create, any specific requirements..."
                  className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent resize-none"
                />
              </div>
            </div>
          )}

          {/* Step 3: Contact Info */}
          {currentStep === 3 && (
            <div className="p-6 space-y-6">
              <div>
                <h2 className="text-xl font-semibold text-neutral-900 mb-2">Contact Information</h2>
                <p className="text-neutral-600">
                  How can we reach you?
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
                  <label className="block text-sm font-medium text-neutral-700 mb-2">Phone</label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="(555) 123-4567"
                    className="w-full px-4 py-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent"
                  />
                </div>
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
                  <h3 className="text-sm font-medium text-neutral-500 mb-3">Services Requested</h3>
                  <div className="space-y-2">
                    {selectedServices.map((serviceId) => {
                      const service = serviceOptions.find(s => s.id === serviceId);
                      return service ? (
                        <div key={serviceId} className="flex items-center gap-2 text-sm text-neutral-700">
                          <Check className="w-4 h-4 text-[var(--color-primary)]" />
                          {service.label}
                        </div>
                      ) : null;
                    })}
                  </div>
                </div>

                <div className="bg-neutral-50 rounded-xl p-4">
                  <h3 className="text-sm font-medium text-neutral-500 mb-3">Project Details</h3>
                  <div className="space-y-2 text-sm">
                    {files.length > 0 && (
                      <div>
                        <span className="text-neutral-500">Files:</span>
                        <span className="ml-2 text-neutral-900">{files.length} file(s) attached</span>
                      </div>
                    )}
                    {material && (
                      <div>
                        <span className="text-neutral-500">Material:</span>
                        <span className="ml-2 text-neutral-900">{materials.find(m => m.id === material)?.name}</span>
                      </div>
                    )}
                    {dimensions && (
                      <div>
                        <span className="text-neutral-500">Dimensions:</span>
                        <span className="ml-2 text-neutral-900">{dimensions}</span>
                      </div>
                    )}
                    <div>
                      <span className="text-neutral-500">Description:</span>
                      <p className="mt-1 text-neutral-900">{description}</p>
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
                    {phone && (
                      <div>
                        <span className="text-neutral-500">Phone:</span>
                        <span className="ml-2 text-neutral-900">{phone}</span>
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
