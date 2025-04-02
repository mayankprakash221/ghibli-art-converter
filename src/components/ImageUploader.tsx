'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';

interface ApiError extends Error {
  message: string;
}

export default function ImageUploader() {
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [convertedImage, setConvertedImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [additionalDetails, setAdditionalDetails] = useState('');
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [cursorTrails, setCursorTrails] = useState<{x: number; y: number; id: number}[]>([]);
  const trailId = useRef(0);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedImage(file);
      setPreviewUrl(URL.createObjectURL(file));
      setConvertedImage(null);
      setError(null);
      setAdditionalDetails(''); // Reset additional details when new image is selected
    }
  };

  const handleConvert = async (isRegenerate: boolean = false) => {
    if (!selectedImage) return;

    setIsLoading(true);
    setError(null);
    if (isRegenerate) {
      setIsRegenerating(true);
    }

    try {
      const formData = new FormData();
      formData.append('image', selectedImage);
      
      // Add the vision prompt
      const visionPrompt = `Analyze this image and create a prompt for DALL-E to redraw it in Studio Ghibli style. Focus on:

1. Maintaining EXACT subject characteristics:
   - Keep the exact same gender
   - Preserve all facial features and appearance
   - Maintain the same body type and proportions
   - Keep the exact same pose and direction
2. Preserving precise body positions and angles
3. Keeping original colors and details
4. Converting to Ghibli's art style while keeping the same scene

CRITICAL: The subject's characteristics, pose, direction, and appearance must match the original photo exactly. Do not change any physical characteristics, gender, or features in any way.`;

      formData.append('visionPrompt', visionPrompt);
      
      // Add DALL-E configuration
      const dalleConfig = {
        model: "dall-e-3",
        size: "1024x1024",
        quality: "standard",
        n: 1
      };
      formData.append('dalleConfig', JSON.stringify(dalleConfig));
      
      // Add any additional details from the user
      if (additionalDetails.trim()) {
        formData.append('details', additionalDetails.trim());
      }

      const response = await fetch('/api/convert', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to convert image');
      }

      const blob = await response.blob();
      const imageUrl = URL.createObjectURL(blob);
      setConvertedImage(imageUrl);
    } catch (err) {
      const error = err as ApiError;
      setError(error.message || 'An error occurred while converting the image');
    } finally {
      setIsLoading(false);
      setIsRegenerating(false);
    }
  };

  const handleRegenerate = () => {
    if (selectedImage) {
      handleConvert(true);
    }
  };

  // Cursor trail effect
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const newTrail = { x: e.clientX, y: e.clientY, id: trailId.current++ };
      setCursorTrails(prev => [...prev, newTrail]);
      setTimeout(() => {
        setCursorTrails(prev => prev.filter(trail => trail.id !== newTrail.id));
      }, 1000);
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <div className="max-w-4xl mx-auto p-4 relative">
      {/* Background Elements */}
      <div className="hero-background"></div>
      <div className="animated-bg"></div>
      <div className="floating-cloud"></div>
      <div className="floating-cloud"></div>
      <div className="floating-cloud"></div>
      <div className="sparkle"></div>
      <div className="sparkle"></div>
      <div className="sparkle"></div>

      {/* Cursor trails */}
      {cursorTrails.map(trail => (
        <div
          key={trail.id}
          className="cursor-trail"
          style={{ left: trail.x, top: trail.y }}
        />
      ))}

      {/* Title Section */}
      <div className="text-center mb-8">
        <h1 className="text-5xl font-bold text-white mb-2 drop-shadow-[0_2px_4px_rgba(0,0,0,0.3)]">
          Ghibli Art Converter
        </h1>
        <p className="text-xl text-white/90 drop-shadow-[0_1px_2px_rgba(0,0,0,0.3)]">
          Transform your photos into magical Ghibli artwork
        </p>
      </div>

      {/* Image Upload Section */}
      <div className="mb-8 bg-white/90 p-6 rounded-xl shadow-lg border-2 border-blue-100 hover:border-blue-200 transition-all backdrop-blur-sm card-hover">
        <label className="block text-lg font-semibold text-gray-800 mb-3">
          Upload Your Image
        </label>
        <input
          type="file"
          accept="image/*"
          onChange={handleImageSelect}
          className="block w-full text-sm text-gray-700
            file:mr-4 file:py-3 file:px-6
            file:rounded-full file:border-0
            file:text-sm file:font-bold
            file:bg-blue-500 file:text-white
            hover:file:bg-blue-600
            transition-colors duration-200"
        />
      </div>

      {/* Details Section */}
      <div className="mb-8 bg-white/90 p-6 rounded-xl shadow-lg border-2 border-purple-100 hover:border-purple-200 transition-all backdrop-blur-sm">
        <label className="block text-lg font-semibold text-gray-800 mb-3">
          Customize Your Style
        </label>
        <textarea
          value={additionalDetails}
          onChange={(e) => setAdditionalDetails(e.target.value)}
          placeholder="Add specific details about how you want your image to look in Ghibli style. For example:

Style Changes:
- Make it more vibrant and colorful
- Add magical sparkles or effects
- Make it more whimsical or playful
- Add specific Ghibli movie references

Mood & Atmosphere:
- Make it more mysterious
- Add a dreamy quality
- Make it more energetic
- Add a nostalgic feel

Specific Elements:
- Add more nature elements
- Include specific Ghibli characters
- Add magical creatures
- Change the time of day"
          className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-gray-800 bg-white text-base"
          rows={6}
        />
        <div className="mt-3 text-sm text-gray-600 bg-purple-50 p-3 rounded-lg">
          <p>✨ Your details will be incorporated while maintaining the original image structure.</p>
        </div>
      </div>

      {/* Image Previews */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
        {previewUrl && (
          <div className="bg-white/90 p-6 rounded-xl shadow-lg border-2 border-green-100 hover:border-green-200 transition-all backdrop-blur-sm card-hover">
            <h3 className="text-lg font-semibold text-gray-800 mb-3">Original Image</h3>
            <div className="relative w-full h-72 rounded-lg overflow-hidden">
              <Image
                src={previewUrl}
                alt="Original"
                fill
                className="object-contain"
              />
            </div>
          </div>
        )}

        {convertedImage && (
          <div className="bg-white/90 p-6 rounded-xl shadow-lg border-2 border-orange-100 hover:border-orange-200 transition-all backdrop-blur-sm card-hover">
            <h3 className="text-lg font-semibold text-gray-800 mb-3">Converted Image</h3>
            <div className="relative w-full h-72 rounded-lg overflow-hidden">
              <Image
                src={convertedImage}
                alt="Converted"
                fill
                className="object-contain"
              />
            </div>
          </div>
        )}
      </div>

      {/* Loading indicator */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/20 backdrop-blur-sm">
          <div className="loading-sprite"></div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex gap-4">
        <button
          onClick={() => handleConvert(false)}
          disabled={!selectedImage || isLoading}
          className="magic-btn flex-1 px-8 py-4 bg-blue-600/90 text-white rounded-xl hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed text-lg font-bold shadow-lg hover:shadow-xl transition-all duration-200 backdrop-blur-sm"
        >
          {isLoading ? '✨ Converting...' : '✨ Convert'}
        </button>

        {convertedImage && (
          <button
            onClick={handleRegenerate}
            disabled={isLoading}
            className="magic-btn flex-1 px-8 py-4 bg-green-600/90 text-white rounded-xl hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed text-lg font-bold shadow-lg hover:shadow-xl transition-all duration-200 backdrop-blur-sm"
          >
            {isRegenerating ? '🔄 Regenerating...' : '🔄 Regenerate'}
          </button>
        )}
      </div>

      {error && (
        <div className="mt-6 p-4 bg-red-50/90 text-red-700 rounded-lg border-2 border-red-200 backdrop-blur-sm card-hover">
          <p className="font-semibold">⚠️ {error}</p>
        </div>
      )}
    </div>
  );
} 