export default function CustomizePage() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="max-w-md mx-auto text-center p-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">
          Product Customization
        </h1>
        <p className="text-gray-600 mb-6">
          Product customization features are not available in this MVP version. 
          This functionality will be added in future releases.
        </p>
        <a 
          href="/products" 
          className="inline-block bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 transition-colors"
        >
          Browse Products
        </a>
      </div>
    </div>
  )
}
