import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';
import { AdminLoginForm } from '@/components/auth/admin-login-form';
import { useAuthStore } from '@/store/auth-store';
import { useRouter } from 'next/navigation';

// Mock dependencies
vi.mock('@/store/auth-store');
vi.mock('next/navigation');

// Mock IP detection
global.fetch = vi.fn();

describe('AdminLoginForm Component', () => {
  const mockUseAuthStore = useAuthStore as jest.Mock;
  const mockUseRouter = useRouter as jest.Mock;
  const mockPush = vi.fn();
  const mockReplace = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    
    // Mock IP detection API
    (global.fetch as any).mockResolvedValue({
      json: () => Promise.resolve({ ip: '127.0.0.1' })
    });

    mockUseRouter.mockReturnValue({
      push: mockPush,
      replace: mockReplace
    });
  });

  const setupMockStore = (storeState: any) => {
    mockUseAuthStore.mockReturnValue(storeState);
  };

  it('should render the initial login form correctly', async () => {
    setupMockStore({ loading: false });
    render(<AdminLoginForm />);

    expect(screen.getByText('Admin Access')).toBeInTheDocument();
    expect(screen.getByText('Enhanced security verification required')).toBeInTheDocument();
    expect(screen.getByLabelText('Admin Email')).toBeInTheDocument();
    expect(screen.getByLabelText('Password')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Secure Login' })).toBeInTheDocument();
    
    await waitFor(() => {
        expect(screen.getByText(/IP: 127\.0\.0\.1/)).toBeInTheDocument();
    });
  });

  it('should display validation errors for empty fields', async () => {
    const user = userEvent.setup();
    setupMockStore({ loading: false });
    render(<AdminLoginForm />);

    await user.click(screen.getByRole('button', { name: 'Secure Login' }));

    expect(await screen.findByText('Please enter a valid email address')).toBeInTheDocument();
    expect(await screen.findByText('Password must be at least 8 characters')).toBeInTheDocument();
  });

  it('should transition to MFA step on successful login with MFA required', async () => {
    const user = userEvent.setup();
    const signIn = vi.fn().mockResolvedValue({ requiresMFA: true });
    setupMockStore({ signIn, loading: false });

    render(<AdminLoginForm />);

    await user.type(screen.getByLabelText('Admin Email'), 'admin@example.com');
    await user.type(screen.getByLabelText('Password'), 'password123');
    await user.click(screen.getByRole('button', { name: 'Secure Login' }));

    await waitFor(() => {
      expect(signIn).toHaveBeenCalledWith('admin@example.com', 'password123');
      expect(screen.getByText('Multi-factor authentication')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('000000')).toBeInTheDocument();
    });
  });

  it('should handle successful login without MFA', async () => {
    const user = userEvent.setup();
    const signIn = vi.fn().mockResolvedValue({ requiresMFA: false });
    const validateAdminAccess = vi.fn().mockResolvedValue(true);
    const createAdminSession = vi.fn().mockResolvedValue(true);
    setupMockStore({ signIn, validateAdminAccess, createAdminSession, loading: false });
    
    render(<AdminLoginForm redirectTo="/admin/dashboard" />);

    await user.type(screen.getByLabelText('Admin Email'), 'admin@example.com');
    await user.type(screen.getByLabelText('Password'), 'password123');
    await user.click(screen.getByRole('button', { name: 'Secure Login' }));

    await waitFor(() => {
      expect(signIn).toHaveBeenCalled();
      expect(validateAdminAccess).toHaveBeenCalled();
      expect(createAdminSession).toHaveBeenCalled();
      expect(screen.getByText('Access Granted')).toBeInTheDocument();
    });
    
    await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith('/admin/dashboard');
    }, { timeout: 3000 });
  });

  it('should display an error message for failed login', async () => {
    const user = userEvent.setup();
    const signIn = vi.fn().mockResolvedValue({ error: 'Invalid credentials' });
    setupMockStore({ signIn, loading: false });

    render(<AdminLoginForm />);

    await user.type(screen.getByLabelText('Admin Email'), 'admin@example.com');
    await user.type(screen.getByLabelText('Password'), 'wrongpassword');
    await user.click(screen.getByRole('button', { name: 'Secure Login' }));

    expect(await screen.findByText('Invalid credentials')).toBeInTheDocument();
  });

  it('should handle MFA verification and redirect', async () => {
    const user = userEvent.setup();
    const signIn = vi.fn().mockResolvedValue({ requiresMFA: true });
    // Mock a simplified MFA verification process
    const createAdminSession = vi.fn().mockResolvedValue(true);
    setupMockStore({ signIn, createAdminSession, loading: false });

    render(<AdminLoginForm redirectTo="/admin/dashboard" />);

    // First step: credentials
    await user.type(screen.getByLabelText('Admin Email'), 'admin-mfa@example.com');
    await user.type(screen.getByLabelText('Password'), 'password123');
    await user.click(screen.getByRole('button', { name: 'Secure Login' }));

    // Second step: MFA
    const mfaInput = await screen.findByPlaceholderText('000000');
    await user.type(mfaInput, '123456');
    await user.click(screen.getByRole('button', { name: 'Verify' }));

    await waitFor(() => {
      expect(screen.getByText('Access Granted')).toBeInTheDocument();
    });

    await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith('/admin/dashboard');
    }, { timeout: 3000 });
  });

  it('should show loading state correctly', async () => {
    setupMockStore({ signIn: vi.fn(() => new Promise(() => {})), loading: true });

    render(<AdminLoginForm />);

    // Wait for the async IP fetch to complete to avoid act() warnings
    await waitFor(() => {
      expect(screen.getByText(/IP: 127\.0\.0\.1/)).toBeInTheDocument();
    });
    
    const button = screen.getByRole('button', { name: 'Verifying...' });
    expect(button).toBeDisabled();
  });

  it('should allow going back from MFA step', async () => {
    const user = userEvent.setup();
    const signIn = vi.fn().mockResolvedValue({ requiresMFA: true });
    setupMockStore({ signIn, loading: false });

    render(<AdminLoginForm />);
    await user.type(screen.getByLabelText('Admin Email'), 'admin@example.com');
    await user.type(screen.getByLabelText('Password'), 'password123');
    await user.click(screen.getByRole('button', { name: 'Secure Login' }));

    const backButton = await screen.findByRole('button', { name: 'Back' });
    await user.click(backButton);

    expect(screen.getByLabelText('Admin Email')).toBeInTheDocument();
    expect(screen.queryByPlaceholderText('000000')).not.toBeInTheDocument();
  });

  it('should handle generic error during login', async () => {
    const user = userEvent.setup();
    const signIn = vi.fn().mockRejectedValue(new Error('An unexpected error'));
    setupMockStore({ signIn, loading: false });
    
    render(<AdminLoginForm />);
    
    await user.type(screen.getByLabelText('Admin Email'), 'admin@example.com');
    await user.type(screen.getByLabelText('Password'), 'password123');
    await user.click(screen.getByRole('button', { name: 'Secure Login' }));

    expect(await screen.findByText('An unexpected error occurred during login')).toBeInTheDocument();
  });
});