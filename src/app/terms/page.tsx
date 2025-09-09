import { MainLayout } from '@/components/layout/main-layout';

export default function TermsPage() {
  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Terms of Service</h1>
        <div className="bg-white rounded-lg shadow p-8">
          <div className="prose prose-lg max-w-none">
            <p className="text-gray-600">
              These terms outline the rules and regulations for the use of Omaima's website and services.
            </p>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
