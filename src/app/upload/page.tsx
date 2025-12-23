'use client';

import { useState, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Upload, FileText, X, CheckCircle, AlertCircle, ArrowLeft, ArrowRight, Loader2 } from 'lucide-react';

type UploadState = 'idle' | 'uploading' | 'processing' | 'success' | 'error';

interface DetectedSpecs {
  width: number;
  height: number;
  thickness: number;
  holes: number;
  cutPath: number;
  bends: number;
}

export default function UploadPage() {
  const router = useRouter();
  const [dragActive, setDragActive] = useState(false);
  const [uploadState, setUploadState] = useState<UploadState>('idle');
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [detectedSpecs, setDetectedSpecs] = useState<DetectedSpecs | null>(null);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const processFile = async (file: File) => {
    setFile(file);
    setUploadState('uploading');
    setError(null);

    // Simulate upload delay
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setUploadState('processing');

    // Simulate processing delay
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // Simulate detected specifications (in real app, this would parse the file)
    const mockSpecs: DetectedSpecs = {
      width: 6.0,
      height: 4.0,
      thickness: 0.075,
      holes: 4,
      cutPath: 29.14,
      bends: 0,
    };

    setDetectedSpecs(mockSpecs);
    setUploadState('success');
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFile = e.dataTransfer.files[0];
      const validTypes = ['.dxf', '.dwg', '.step', '.stp', '.iges', '.igs', '.pdf', '.ai'];
      const ext = '.' + droppedFile.name.split('.').pop()?.toLowerCase();

      if (validTypes.includes(ext)) {
        processFile(droppedFile);
      } else {
        setError('Invalid file type. Please upload a DXF, DWG, STEP, IGES, PDF, or AI file.');
      }
    }
  }, []);

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const handleContinue = () => {
    // Pass detected specs to builder via URL params
    if (detectedSpecs && file) {
      const params = new URLSearchParams({
        source: 'upload',
        fileName: file.name,
        width: detectedSpecs.width.toString(),
        height: detectedSpecs.height.toString(),
        thickness: detectedSpecs.thickness.toString(),
        holes: detectedSpecs.holes.toString(),
        cutPath: detectedSpecs.cutPath.toString(),
      });
      router.push(`/builder?${params.toString()}`);
    } else {
      router.push('/builder');
    }
  };

  const resetUpload = () => {
    setFile(null);
    setUploadState('idle');
    setError(null);
    setDetectedSpecs(null);
  };

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Navigation */}
      <nav className="bg-white border-b border-neutral-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center gap-3">
              <Image src="/logo.png" alt="Logo" width={40} height={40} className="h-10 w-auto" />
            </Link>
            <Link
              href="/builder"
              className="text-sm text-neutral-600 hover:text-neutral-900 flex items-center gap-1"
            >
              Use Template Builder
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Progress */}
        <div className="flex items-center gap-2 text-sm text-neutral-500 mb-8">
          <span className="flex items-center gap-1">
            <span className="w-6 h-6 rounded-full bg-[var(--color-primary)] text-white flex items-center justify-center text-xs font-medium">
              1
            </span>
            Upload
          </span>
          <div className="flex-1 h-px bg-neutral-300" />
          <span className="flex items-center gap-1 opacity-50">
            <span className="w-6 h-6 rounded-full bg-neutral-300 text-neutral-600 flex items-center justify-center text-xs font-medium">
              2
            </span>
            Configure
          </span>
          <div className="flex-1 h-px bg-neutral-300" />
          <span className="flex items-center gap-1 opacity-50">
            <span className="w-6 h-6 rounded-full bg-neutral-300 text-neutral-600 flex items-center justify-center text-xs font-medium">
              3
            </span>
            Checkout
          </span>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-neutral-200 p-8">
          <h1 className="text-2xl font-bold text-neutral-900 mb-2">Upload Your Design</h1>
          <p className="text-neutral-600 mb-8">
            Upload your CAD file and we&apos;ll automatically detect dimensions and features.
          </p>

          {uploadState === 'idle' && (
            <>
              {/* Upload Zone */}
              <div
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                className={`relative border-2 border-dashed rounded-xl p-12 text-center transition-colors ${
                  dragActive
                    ? 'border-[var(--color-primary)] bg-red-50'
                    : 'border-neutral-300 hover:border-neutral-400'
                }`}
              >
                <input
                  type="file"
                  accept=".dxf,.dwg,.step,.stp,.iges,.igs,.pdf,.ai"
                  onChange={handleFileInput}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                <Upload className="w-12 h-12 mx-auto mb-4 text-neutral-400" />
                <p className="text-lg font-medium text-neutral-900 mb-2">
                  Drag and drop your CAD file here
                </p>
                <p className="text-neutral-500 mb-4">or click to browse</p>
                <p className="text-sm text-neutral-400">
                  Supported formats: DXF, DWG, STEP, IGES, PDF, AI (max 50MB)
                </p>
              </div>

              {error && (
                <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3">
                  <AlertCircle className="w-5 h-5 text-red-500 shrink-0" />
                  <p className="text-red-700">{error}</p>
                </div>
              )}
            </>
          )}

          {(uploadState === 'uploading' || uploadState === 'processing') && (
            <div className="text-center py-12">
              <Loader2 className="w-12 h-12 mx-auto mb-4 text-[var(--color-primary)] animate-spin" />
              <p className="text-lg font-medium text-neutral-900 mb-2">
                {uploadState === 'uploading' ? 'Uploading...' : 'Processing your file...'}
              </p>
              <p className="text-neutral-500">
                {uploadState === 'uploading'
                  ? 'Please wait while we upload your file'
                  : 'Analyzing dimensions and detecting features'}
              </p>
              {file && (
                <div className="mt-6 inline-flex items-center gap-2 px-4 py-2 bg-neutral-100 rounded-lg">
                  <FileText className="w-4 h-4 text-neutral-500" />
                  <span className="text-sm text-neutral-700">{file.name}</span>
                </div>
              )}
            </div>
          )}

          {uploadState === 'success' && detectedSpecs && (
            <div>
              <div className="flex items-center gap-3 mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                <CheckCircle className="w-5 h-5 text-green-500" />
                <div>
                  <p className="font-medium text-green-800">File processed successfully!</p>
                  <p className="text-sm text-green-600">{file?.name}</p>
                </div>
                <button onClick={resetUpload} className="ml-auto text-green-600 hover:text-green-800">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Detected Specifications */}
              <h2 className="text-lg font-semibold text-neutral-900 mb-4">Detected Specifications</h2>
              <div className="grid sm:grid-cols-2 gap-4 mb-8">
                <div className="p-4 bg-neutral-50 rounded-lg">
                  <p className="text-sm text-neutral-500">Overall Size</p>
                  <p className="text-lg font-medium text-neutral-900">
                    {detectedSpecs.width}&quot; × {detectedSpecs.height}&quot;
                  </p>
                </div>
                <div className="p-4 bg-neutral-50 rounded-lg">
                  <p className="text-sm text-neutral-500">Suggested Thickness</p>
                  <p className="text-lg font-medium text-neutral-900">
                    {detectedSpecs.thickness}&quot; (14ga)
                  </p>
                </div>
                <div className="p-4 bg-neutral-50 rounded-lg">
                  <p className="text-sm text-neutral-500">Holes Detected</p>
                  <p className="text-lg font-medium text-neutral-900">{detectedSpecs.holes} holes</p>
                </div>
                <div className="p-4 bg-neutral-50 rounded-lg">
                  <p className="text-sm text-neutral-500">Cut Path Length</p>
                  <p className="text-lg font-medium text-neutral-900">
                    {detectedSpecs.cutPath.toFixed(2)}&quot;
                  </p>
                </div>
              </div>

              <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg mb-8">
                <p className="text-amber-800 text-sm">
                  <strong>Note:</strong> Please review the detected specifications. You can adjust
                  them in the next step if needed.
                </p>
              </div>

              <div className="flex gap-4">
                <button
                  onClick={resetUpload}
                  className="px-6 py-3 border border-neutral-300 text-neutral-700 rounded-xl font-medium hover:bg-neutral-50 transition-colors"
                >
                  Upload Different File
                </button>
                <button
                  onClick={handleContinue}
                  className="flex-1 px-6 py-3 bg-[var(--color-primary)] text-white rounded-xl font-medium hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
                >
                  Continue to Material Selection
                  <ArrowRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Help Section */}
        <div className="mt-8 text-center">
          <p className="text-neutral-500">
            Don&apos;t have a CAD file?{' '}
            <Link href="/builder" className="text-[var(--color-primary)] hover:underline">
              Use our template builder
            </Link>
          </p>
        </div>
      </main>
    </div>
  );
}
