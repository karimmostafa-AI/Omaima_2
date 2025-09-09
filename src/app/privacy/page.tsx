import { MainLayout } from '@/components/layout/main-layout';

export default function PrivacyPage() {
  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Privacy Policy</h1>
        <div className="bg-white rounded-lg shadow p-8">
          <div className="prose prose-lg max-w-none">
            <p className="text-gray-600">
              Your privacy is important to us. This policy outlines how we collect, use, and protect your information.
            </p>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
