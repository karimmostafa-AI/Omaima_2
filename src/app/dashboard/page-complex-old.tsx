import { requireCustomerAuth } from '@/lib/server-auth';
import DashboardContent from './dashboard-content';

// Force dynamic rendering since we're using cookies for auth
export const dynamic = 'force-dynamic';

// Server component that handles authentication
export default async function DashboardPage() {
  // This will redirect to login if user is not authenticated or doesn't have customer access
  const user = await requireCustomerAuth('/dashboard');
  
  // Pass the authenticated user to the client component
  return <DashboardContent user={user} />;
}
