'use client';

import { useState, useCallback } from 'react';
import Image from 'next/image';

export default function ImageUploader() {
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isConverting, setIsConverting] = useState(false);
  const [convertedImage, setConvertedImage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDragIn = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragOut = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = Array.from(e.dataTransfer.files);
    if (files && files.length > 0) {
      const file = files[0];
      if (file.type.startsWith('image/')) {
        if (file.size > 30 * 1024 * 1024) { // 30MB limit
          setError('File size must be less than 30MB');
          return;
        }
        setSelectedImage(file);
        const reader = new FileReader();
        reader.onloadend = () => {
          setPreview(reader.result as string);
          setConvertedImage(null);
        };
        reader.readAsDataURL(file);
      }
    }
  }, []);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const file = files[0];
      if (file.size > 30 * 1024 * 1024) { // 30MB limit
        setError('File size must be less than 30MB');
        return;
      }
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
        setConvertedImage(null);
      };
      reader.readAsDataURL(file);
    }
  }, []);

  const handleConvert = async () => {
    if (!selectedImage) return;

    try {
      setIsConverting(true);
      setError(null);

      const formData = new FormData();
      formData.append('image', selectedImage);

      const response = await fetch('/api/convert', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to convert image');
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      setConvertedImage(url);
    } catch (err) {
      setError('Failed to convert image. Please try again.');
      console.error('Error converting image:', err);
    } finally {
      setIsConverting(false);
    }
  };

  const handleDownload = useCallback(() => {
    if (convertedImage) {
      const link = document.createElement('a');
      link.href = convertedImage;
      link.download = 'ghibli-style.png';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  }, [convertedImage]);

  return (
    <div className="w-full max-w-3xl p-8 bg-white/90 backdrop-blur-sm rounded-2xl shadow-2xl">
      <div className="text-center mb-8">
        <p className="text-xl text-gray-600">
          Transform your photos into magical Ghibli-style artwork
        </p>
      </div>

      <div className="flex flex-col items-center justify-center w-full">
        <div
          className={`relative w-full ${preview ? 'h-96' : 'h-64'} ${
            isDragging ? 'border-teal-500' : 'border-gray-300'
          } border-2 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors`}
          onDragEnter={handleDragIn}
          onDragLeave={handleDragOut}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={() => document.getElementById('dropzone-file')?.click()}
        >
          {(preview || convertedImage) ? (
            <div className="relative w-full h-full">
              <Image
                src={convertedImage || preview || ''}
                alt="Preview"
                fill
                style={{ objectFit: 'contain' }}
                className="rounded-lg"
              />
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full">
              <svg
                className="w-10 h-10 mb-3 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                ></path>
              </svg>
              <p className="mb-2 text-sm text-gray-500">
                <span className="font-semibold">Click to upload</span> or drag and drop
              </p>
              <p className="text-xs text-gray-500">PNG, JPG or JPEG (MAX. 30MB)</p>
            </div>
          )}
          <input
            id="dropzone-file"
            type="file"
            className="hidden"
            accept="image/*"
            onChange={handleFileSelect}
          />
        </div>
      </div>

      {error && (
        <div className="mt-4 text-center text-red-500">{error}</div>
      )}

      <div className="mt-8 text-center space-x-4">
        <button
          className={`px-6 py-3 bg-teal-600 text-white rounded-lg transition-colors ${
            selectedImage && !isConverting
              ? 'hover:bg-teal-700'
              : 'opacity-50 cursor-not-allowed'
          }`}
          type="button"
          onClick={handleConvert}
          disabled={!selectedImage || isConverting}
        >
          {isConverting ? 'Converting...' : 'Convert to Ghibli Style'}
        </button>

        {convertedImage && (
          <button
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            onClick={handleDownload}
          >
            Download
          </button>
        )}
      </div>
    </div>
  );
} 