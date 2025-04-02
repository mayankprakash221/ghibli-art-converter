import ImageUploader from '../components/ImageUploader';

export default function Home() {
  return (
    <>
      <div className="background-pattern" />
      <div className="floating-element" />
      <div className="floating-element" />
      <div className="floating-element" />
      
      <main className="flex min-h-screen flex-col items-center p-4 md:p-8 relative">
        {/* Hero Section */}
        <div className="w-full max-w-6xl mx-auto text-center mb-12">
          <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-purple-600 to-pink-600 text-transparent bg-clip-text">
            Ghibli Art Converter
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Transform your photos into magical Studio Ghibli-style artwork
          </p>
        </div>

        {/* Main Upload Section */}
        <div className="w-full max-w-4xl mx-auto mb-16">
          <div className="bg-white/90 backdrop-blur-lg rounded-2xl p-8 shadow-xl border border-gray-100 hover:shadow-2xl transition-all duration-300">
            <ImageUploader />
          </div>
        </div>

        {/* Features Grid */}
        <div className="w-full max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          <div className="group rounded-2xl border border-gray-200 p-8 bg-white/90 backdrop-blur-lg hover:shadow-xl transition-all duration-300 card-hover">
            <h2 className="text-2xl font-bold mb-4 text-gray-800 group-hover:text-purple-600 transition-colors">
              Upload
              <span className="inline-block transition-transform group-hover:translate-x-2 motion-reduce:transform-none ml-2">
                →
              </span>
            </h2>
            <p className="text-gray-600 leading-relaxed">
              Upload your favorite photo that you&apos;d like to transform into a magical Ghibli masterpiece.
            </p>
          </div>

          <div className="group rounded-2xl border border-gray-200 p-8 bg-white/90 backdrop-blur-lg hover:shadow-xl transition-all duration-300 card-hover">
            <h2 className="text-2xl font-bold mb-4 text-gray-800 group-hover:text-pink-600 transition-colors">
              Convert
              <span className="inline-block transition-transform group-hover:translate-x-2 motion-reduce:transform-none ml-2">
                →
              </span>
            </h2>
            <p className="text-gray-600 leading-relaxed">
              Our AI model will transform your photo into a beautiful Ghibli-style artwork with magical details.
            </p>
          </div>

          <div className="group rounded-2xl border border-gray-200 p-8 bg-white/90 backdrop-blur-lg hover:shadow-xl transition-all duration-300 card-hover">
            <h2 className="text-2xl font-bold mb-4 text-gray-800 group-hover:text-indigo-600 transition-colors">
              Download
              <span className="inline-block transition-transform group-hover:translate-x-2 motion-reduce:transform-none ml-2">
                →
              </span>
            </h2>
            <p className="text-gray-600 leading-relaxed">
              Download your transformed artwork in high quality and share the magic with others.
            </p>
          </div>
        </div>
      </main>
    </>
  );
}
