import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AdminLoginForm } from '@/components/auth/admin-login-form';
import { useAuthStore } from '@/store/auth-store';
import { useRouter } from 'next/navigation';

// Mock dependencies
jest.mock('@/store/auth-store');
jest.mock('next/navigation');

const mockAuthStore = {
  signIn: jest.fn(),
  validateAdminAccess: jest.fn(),
  createAdminSession: jest.fn(),
  verifyMFA: jest.fn(),
  loading: false,
  user: null
};

const mockRouter = {
  push: jest.fn(),
  replace: jest.fn()
};

(useAuthStore as jest.Mock).mockReturnValue(mockAuthStore);
(useRouter as jest.Mock).mockReturnValue(mockRouter);

// Mock IP detection
global.fetch = jest.fn();

describe('AdminLoginForm Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Mock IP detection API
    (global.fetch as jest.Mock).mockResolvedValue({
      json: () => Promise.resolve({ ip: '127.0.0.1' })
    });
  });

  it('should render admin login form', () => {
    render(<AdminLoginForm />);

    expect(screen.getByText('Admin Access')).toBeInTheDocument();
    expect(screen.getByText('Secure administrator login with enhanced security')).toBeInTheDocument();
    expect(screen.getByLabelText('Email')).toBeInTheDocument();
    expect(screen.getByLabelText('Password')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Sign In' })).toBeInTheDocument();
  });

  it('should display enhanced security features', () => {
    render(<AdminLoginForm />);

    expect(screen.getByText('Enhanced Security')).toBeInTheDocument();
    expect(screen.getByText('IP Address Validation')).toBeInTheDocument();
    expect(screen.getByText('Multi-Factor Authentication')).toBeInTheDocument();
    expect(screen.getByText('Session Monitoring')).toBeInTheDocument();
  });

  it('should handle form validation', async () => {
    const user = userEvent.setup();
    
    render(<AdminLoginForm />);

    const signInButton = screen.getByRole('button', { name: 'Sign In' });
    await user.click(signInButton);

    await waitFor(() => {
      expect(screen.getByText('Email is required')).toBeInTheDocument();
      expect(screen.getByText('Password is required')).toBeInTheDocument();
    });
  });

  it('should validate email format', async () => {
    const user = userEvent.setup();
    
    render(<AdminLoginForm />);

    const emailInput = screen.getByLabelText('Email');
    await user.type(emailInput, 'invalid-email');

    const signInButton = screen.getByRole('button', { name: 'Sign In' });
    await user.click(signInButton);

    await waitFor(() => {
      expect(screen.getByText('Please enter a valid email address')).toBeInTheDocument();
    });
  });

  it('should handle successful admin login requiring MFA', async () => {
    const user = userEvent.setup();
    
    mockAuthStore.signIn.mockResolvedValue({
      user: {
        id: 'admin-123',
        email: 'admin@example.com',
        role: 'ADMIN',
        mfaEnabled: true
      },
      session: { access_token: 'token' },
      requiresMFA: true
    });

    render(<AdminLoginForm />);

    // Fill in form
    await user.type(screen.getByLabelText('Email'), 'admin@example.com');
    await user.type(screen.getByLabelText('Password'), 'adminpassword');
    
    await user.click(screen.getByRole('button', { name: 'Sign In' }));

    await waitFor(() => {
      expect(mockAuthStore.signIn).toHaveBeenCalledWith('admin@example.com', 'adminpassword');
    });

    // Should show MFA verification step
    await waitFor(() => {
      expect(screen.getByText('Two-Factor Authentication')).toBeInTheDocument();
      expect(screen.getByText('Enter your 6-digit verification code')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Enter 6-digit code')).toBeInTheDocument();
    });
  });

  it('should handle successful admin login without MFA', async () => {
    const user = userEvent.setup();
    
    mockAuthStore.signIn.mockResolvedValue({
      user: {
        id: 'admin-123',
        email: 'admin@example.com',
        role: 'ADMIN',
        mfaEnabled: false
      },
      session: { access_token: 'token' },
      requiresMFA: false
    });

    mockAuthStore.validateAdminAccess.mockResolvedValue(true);
    mockAuthStore.createAdminSession.mockResolvedValue({
      id: 'session-123',
      sessionToken: 'token-123'
    });

    render(<AdminLoginForm />);

    // Fill in form
    await user.type(screen.getByLabelText('Email'), 'admin@example.com');
    await user.type(screen.getByLabelText('Password'), 'adminpassword');
    
    await user.click(screen.getByRole('button', { name: 'Sign In' }));

    await waitFor(() => {
      expect(mockAuthStore.createAdminSession).toHaveBeenCalled();
      expect(mockRouter.push).toHaveBeenCalledWith('/admin');
    });
  });

  it('should handle login errors', async () => {
    const user = userEvent.setup();
    
    mockAuthStore.signIn.mockResolvedValue({
      error: 'Invalid credentials'
    });

    render(<AdminLoginForm />);

    await user.type(screen.getByLabelText('Email'), 'admin@example.com');
    await user.type(screen.getByLabelText('Password'), 'wrongpassword');
    
    await user.click(screen.getByRole('button', { name: 'Sign In' }));

    await waitFor(() => {
      expect(screen.getByText('Invalid credentials')).toBeInTheDocument();
    });
  });

  it('should handle non-admin user attempts', async () => {
    const user = userEvent.setup();
    
    mockAuthStore.signIn.mockResolvedValue({
      user: {
        id: 'user-123',
        email: 'user@example.com',
        role: 'CUSTOMER'
      },
      session: { access_token: 'token' }
    });

    render(<AdminLoginForm />);

    await user.type(screen.getByLabelText('Email'), 'user@example.com');
    await user.type(screen.getByLabelText('Password'), 'password');
    
    await user.click(screen.getByRole('button', { name: 'Sign In' }));

    await waitFor(() => {
      expect(screen.getByText('Access denied. Admin privileges required.')).toBeInTheDocument();
    });
  });

  it('should handle MFA verification', async () => {
    const user = userEvent.setup();
    
    // First sign in requiring MFA
    mockAuthStore.signIn.mockResolvedValue({
      user: {
        id: 'admin-123',
        email: 'admin@example.com',
        role: 'ADMIN',
        mfaEnabled: true
      },
      session: { access_token: 'token' },
      requiresMFA: true
    });

    render(<AdminLoginForm />);

    // Complete initial login
    await user.type(screen.getByLabelText('Email'), 'admin@example.com');
    await user.type(screen.getByLabelText('Password'), 'adminpassword');
    await user.click(screen.getByRole('button', { name: 'Sign In' }));

    await waitFor(() => {
      expect(screen.getByPlaceholderText('Enter 6-digit code')).toBeInTheDocument();
    });

    // Verify MFA
    mockAuthStore.verifyMFA.mockResolvedValue({
      success: true
    });

    mockAuthStore.validateAdminAccess.mockResolvedValue(true);
    mockAuthStore.createAdminSession.mockResolvedValue({
      id: 'session-123',
      sessionToken: 'token-123'
    });

    const mfaInput = screen.getByPlaceholderText('Enter 6-digit code');
    await user.type(mfaInput, '123456');
    
    await user.click(screen.getByRole('button', { name: 'Verify & Continue' }));

    await waitFor(() => {
      expect(mockAuthStore.verifyMFA).toHaveBeenCalledWith('123456');
      expect(mockAuthStore.createAdminSession).toHaveBeenCalled();
      expect(mockRouter.push).toHaveBeenCalledWith('/admin');
    });
  });

  it('should handle invalid MFA code', async () => {
    const user = userEvent.setup();
    
    // Set up MFA step
    mockAuthStore.signIn.mockResolvedValue({
      user: {
        id: 'admin-123',
        email: 'admin@example.com',
        role: 'ADMIN',
        mfaEnabled: true
      },
      session: { access_token: 'token' },
      requiresMFA: true
    });

    render(<AdminLoginForm />);

    await user.type(screen.getByLabelText('Email'), 'admin@example.com');
    await user.type(screen.getByLabelText('Password'), 'adminpassword');
    await user.click(screen.getByRole('button', { name: 'Sign In' }));

    await waitFor(() => {
      expect(screen.getByPlaceholderText('Enter 6-digit code')).toBeInTheDocument();
    });

    // Invalid MFA verification
    mockAuthStore.verifyMFA.mockResolvedValue({
      success: false,
      error: 'Invalid verification code'
    });

    const mfaInput = screen.getByPlaceholderText('Enter 6-digit code');
    await user.type(mfaInput, '000000');
    
    await user.click(screen.getByRole('button', { name: 'Verify & Continue' }));

    await waitFor(() => {
      expect(screen.getByText('Invalid verification code')).toBeInTheDocument();
    });
  });

  it('should display IP address monitoring', async () => {
    render(<AdminLoginForm />);

    await waitFor(() => {
      expect(screen.getByText('Current IP: 127.0.0.1')).toBeInTheDocument();
    });
  });

  it('should handle admin session creation failure', async () => {
    const user = userEvent.setup();
    
    mockAuthStore.signIn.mockResolvedValue({
      user: {
        id: 'admin-123',
        email: 'admin@example.com',
        role: 'ADMIN',
        mfaEnabled: false
      },
      session: { access_token: 'token' }
    });

    mockAuthStore.validateAdminAccess.mockResolvedValue(true);
    mockAuthStore.createAdminSession.mockResolvedValue(null);

    render(<AdminLoginForm />);

    await user.type(screen.getByLabelText('Email'), 'admin@example.com');
    await user.type(screen.getByLabelText('Password'), 'adminpassword');
    
    await user.click(screen.getByRole('button', { name: 'Sign In' }));

    await waitFor(() => {
      expect(screen.getByText('Failed to create secure admin session')).toBeInTheDocument();
    });
  });

  it('should show loading state during authentication', async () => {
    const user = userEvent.setup();
    
    mockAuthStore.loading = true;

    render(<AdminLoginForm />);

    const signInButton = screen.getByRole('button', { name: /sign in/i });
    expect(signInButton).toBeDisabled();
  });

  it('should allow going back from MFA step', async () => {
    const user = userEvent.setup();
    
    // Set up MFA step
    mockAuthStore.signIn.mockResolvedValue({
      user: {
        id: 'admin-123',
        email: 'admin@example.com',
        role: 'ADMIN',
        mfaEnabled: true
      },
      session: { access_token: 'token' },
      requiresMFA: true
    });

    render(<AdminLoginForm />);

    await user.type(screen.getByLabelText('Email'), 'admin@example.com');
    await user.type(screen.getByLabelText('Password'), 'adminpassword');
    await user.click(screen.getByRole('button', { name: 'Sign In' }));

    await waitFor(() => {
      expect(screen.getByText('Two-Factor Authentication')).toBeInTheDocument();
    });

    // Click back button
    const backButton = screen.getByRole('button', { name: 'Back' });
    await user.click(backButton);

    // Should return to login form
    expect(screen.getByText('Admin Access')).toBeInTheDocument();
    expect(screen.getByLabelText('Email')).toBeInTheDocument();
  });

  it('should handle network errors gracefully', async () => {
    const user = userEvent.setup();
    
    mockAuthStore.signIn.mockRejectedValue(new Error('Network error'));

    render(<AdminLoginForm />);

    await user.type(screen.getByLabelText('Email'), 'admin@example.com');
    await user.type(screen.getByLabelText('Password'), 'adminpassword');
    
    await user.click(screen.getByRole('button', { name: 'Sign In' }));

    await waitFor(() => {
      expect(screen.getByText('Network error')).toBeInTheDocument();
    });
  });
});