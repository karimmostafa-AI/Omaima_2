import { MainLayout } from '@/components/layout/main-layout';

export default function FAQPage() {
  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Frequently Asked Questions</h1>
        <div className="bg-white rounded-lg shadow p-8">
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-2">What sizes do you offer?</h3>
              <p className="text-gray-600">We offer sizes ranging from XS to 3XL to accommodate all body types.</p>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-2">Do you offer custom tailoring?</h3>
              <p className="text-gray-600">Yes, we provide custom tailoring services for the perfect fit.</p>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-2">What is your return policy?</h3>
              <p className="text-gray-600">We offer 30-day returns for unworn items in original condition.</p>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
