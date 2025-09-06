import { requireCustomerAuth } from '@/lib/server-auth';
import AccountContent from './account-content';

// Force dynamic rendering since we're using cookies for auth
export const dynamic = 'force-dynamic';

// Server component that handles authentication
export default async function AccountPage() {
  // This will redirect to login if user is not authenticated or doesn't have customer access
  const user = await requireCustomerAuth('/account');
  
  // Pass the authenticated user to the client component
  return <AccountContent user={user} />;
}
