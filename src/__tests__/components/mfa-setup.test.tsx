import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';
import { MFASetup } from '@/components/auth/mfa-setup';

// Mock the auth store
const mockAuthStore = {
  user: {
    id: 'user-123',
    email: 'test@example.com',
    role: 'ADMIN'
  },
  enableMFA: vi.fn(),
  verifyMFA: vi.fn(),
  generateBackupCodes: vi.fn(),
  loading: false
};

vi.mock('@/store/auth-store', () => ({
  useAuthStore: vi.fn(() => mockAuthStore)
}));

// Mock QR code generation
vi.mock('qrcode', () => ({
  toDataURL: vi.fn().mockResolvedValue('data:image/png;base64,mockqrcode')
}));

describe('MFASetup Component', () => {
  const mockOnComplete = vi.fn();
  const mockOnCancel = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render initial setup step', () => {
    render(<MFASetup onComplete={mockOnComplete} onCancel={mockOnCancel} />);

    expect(screen.getByText('Multi-Factor Authentication')).toBeInTheDocument();
    expect(screen.getByText('Secure your account with an additional layer of protection')).toBeInTheDocument();
    expect(screen.getByText('Start Setup')).toBeInTheDocument();
  });

  it('should proceed to QR code step when Start Setup is clicked', async () => {
    const user = userEvent.setup();
    
    mockAuthStore.enableMFA.mockResolvedValue({
      secret: 'MOCKTOTPSECRET',
      qrCode: 'otpauth://totp/test',
      backupCodes: ['12345678', '87654321']
    });

    render(<MFASetup onComplete={mockOnComplete} onCancel={mockOnCancel} />);

    await user.click(screen.getByText('Start Setup'));

    await waitFor(() => {
      expect(screen.getByText('Scan QR Code')).toBeInTheDocument();
      expect(screen.getByText('Scan this QR code with your authenticator app.')).toBeInTheDocument();
    });

    expect(mockAuthStore.enableMFA).toHaveBeenCalled();
  });

  it('should handle MFA setup error', async () => {
    const user = userEvent.setup();
    
    mockAuthStore.enableMFA.mockResolvedValue({
      secret: '',
      qrCode: '',
      backupCodes: [],
      error: 'Failed to setup MFA'
    });

    render(<MFASetup onComplete={mockOnComplete} onCancel={mockOnCancel} />);

    await user.click(screen.getByText('Start Setup'));

    await waitFor(() => {
      expect(screen.getByText('Failed to setup MFA')).toBeInTheDocument();
    });
  });

  it('should display QR code and secret key', async () => {
    const user = userEvent.setup();
    
    mockAuthStore.enableMFA.mockResolvedValue({
      secret: 'MOCKTOTPSECRET',
      qrCode: 'otpauth://totp/test',
      backupCodes: ['12345678', '87654321']
    });

    render(<MFASetup onComplete={mockOnComplete} onCancel={mockOnCancel} />);

    await user.click(screen.getByText('Start Setup'));

    await waitFor(() => {
      expect(screen.getByRole('img', { name: 'QR Code for MFA setup' })).toBeInTheDocument();
      expect(screen.getByText('MOCKTOTPSECRET')).toBeInTheDocument();
      expect(screen.getByText('Continue')).toBeInTheDocument();
    });
  });

  it('should proceed to verification step', async () => {
    const user = userEvent.setup();
    
    mockAuthStore.enableMFA.mockResolvedValue({
      secret: 'MOCKTOTPSECRET',
      qrCode: 'otpauth://totp/test',
      backupCodes: ['12345678', '87654321']
    });

    render(<MFASetup onComplete={mockOnComplete} onCancel={mockOnCancel} />);

    // Start setup
    await user.click(screen.getByText('Start Setup'));

    await waitFor(() => {
      expect(screen.getByText('Continue')).toBeInTheDocument();
    });

    // Proceed to verification
    await user.click(screen.getByText('Continue'));

    await waitFor(() => {
      expect(screen.getByText('Verify Setup')).toBeInTheDocument();
      expect(screen.getByText('Enter the 6-digit code from your authenticator app.')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Enter 6-digit code')).toBeInTheDocument();
    });
  });

  it('should verify MFA code successfully', async () => {
    const user = userEvent.setup();
    
    mockAuthStore.enableMFA.mockResolvedValue({
      secret: 'MOCKTOTPSECRET',
      qrCode: 'otpauth://totp/test',
      backupCodes: ['12345678', '87654321']
    });

    mockAuthStore.verifyMFA.mockResolvedValue({
      success: true
    });

    render(<MFASetup onComplete={mockOnComplete} onCancel={mockOnCancel} />);

    // Navigate to verification step
    await user.click(screen.getByText('Start Setup'));
    await waitFor(() => screen.getByText('Continue'));
    await user.click(screen.getByText('Continue'));

    await waitFor(() => {
      expect(screen.getByPlaceholderText('Enter 6-digit code')).toBeInTheDocument();
    });

    // Enter verification code
    const codeInput = screen.getByPlaceholderText('Enter 6-digit code');
    await user.type(codeInput, '123456');

    const verifyButton = screen.getByText('Verify & Complete');
    await user.click(verifyButton);

    await waitFor(() => {
      expect(mockAuthStore.verifyMFA).toHaveBeenCalledWith('123456');
    });

    // Should proceed to backup codes
    await waitFor(() => {
      expect(screen.getByText('Save Your Backup Codes')).toBeInTheDocument();
      expect(screen.getByText('12345678')).toBeInTheDocument();
      expect(screen.getByText('87654321')).toBeInTheDocument();
    });
  });

  it('should handle invalid MFA code', async () => {
    const user = userEvent.setup();
    
    mockAuthStore.enableMFA.mockResolvedValue({
      secret: 'MOCKTOTPSECRET',
      qrCode: 'otpauth://totp/test',
      backupCodes: ['12345678', '87654321']
    });

    mockAuthStore.verifyMFA.mockResolvedValue({
      success: false,
      error: 'Invalid verification code'
    });

    render(<MFASetup onComplete={mockOnComplete} onCancel={mockOnCancel} />);

    // Navigate to verification step
    await user.click(screen.getByText('Start Setup'));
    await waitFor(() => screen.getByText('Continue'));
    await user.click(screen.getByText('Continue'));

    await waitFor(() => {
      expect(screen.getByPlaceholderText('Enter 6-digit code')).toBeInTheDocument();
    });

    // Enter invalid code
    const codeInput = screen.getByPlaceholderText('Enter 6-digit code');
    await user.type(codeInput, '000000');

    const verifyButton = screen.getByText('Verify & Complete');
    await user.click(verifyButton);

    await waitFor(() => {
      expect(screen.getByText('Invalid verification code')).toBeInTheDocument();
    });
  });

  it('should complete MFA setup after saving backup codes', async () => {
    const user = userEvent.setup();
    
    mockAuthStore.enableMFA.mockResolvedValue({
      secret: 'MOCKTOTPSECRET',
      qrCode: 'otpauth://totp/test',
      backupCodes: ['12345678', '87654321']
    });

    mockAuthStore.verifyMFA.mockResolvedValue({
      success: true
    });

    render(<MFASetup onComplete={mockOnComplete} onCancel={mockOnCancel} />);

    // Complete the full flow
    await user.click(screen.getByText('Start Setup'));
    await waitFor(() => screen.getByText('Continue'));
    await user.click(screen.getByText('Continue'));

    await waitFor(() => {
      expect(screen.getByPlaceholderText('Enter 6-digit code')).toBeInTheDocument();
    });

    const codeInput = screen.getByPlaceholderText('Enter 6-digit code');
    await user.type(codeInput, '123456');
    await user.click(screen.getByText('Verify & Complete'));

    await waitFor(() => {
      expect(screen.getByText('Save Your Backup Codes')).toBeInTheDocument();
    });

    // Complete setup
    await user.click(screen.getByText('Finish Setup'));

    expect(mockOnComplete).toHaveBeenCalled();
  });

  it('should allow canceling the setup process', async () => {
    const user = userEvent.setup();
    
    render(<MFASetup onComplete={mockOnComplete} onCancel={mockOnCancel} />);

    await user.click(screen.getByText('Cancel'));

    expect(mockOnCancel).toHaveBeenCalled();
  });

  it('should allow going back to previous steps', async () => {
    const user = userEvent.setup();
    
    mockAuthStore.enableMFA.mockResolvedValue({
      secret: 'MOCKTOTPSECRET',
      qrCode: 'otpauth://totp/test',
      backupCodes: ['12345678', '87654321']
    });

    render(<MFASetup onComplete={mockOnComplete} onCancel={mockOnCancel} />);

    // Navigate to QR step
    await user.click(screen.getByText('Start Setup'));
    await waitFor(() => screen.getByText('Continue'));

    // Navigate to verification step
    await user.click(screen.getByText('Continue'));
    await waitFor(() => screen.getByText('Back'));

    // Go back to QR step
    await user.click(screen.getByText('Back'));

    await waitFor(() => {
      expect(screen.getByText('Scan QR Code')).toBeInTheDocument();
    });
  });

  it('should copy backup codes to clipboard', async () => {
    const user = userEvent.setup();
    
    // Mock clipboard API
    Object.assign(navigator, {
      clipboard: {
        writeText: vi.fn().mockResolvedValue(undefined)
      }
    });

    mockAuthStore.enableMFA.mockResolvedValue({
      secret: 'MOCKTOTPSECRET',
      qrCode: 'otpauth://totp/test',
      backupCodes: ['12345678', '87654321']
    });

    mockAuthStore.verifyMFA.mockResolvedValue({
      success: true
    });

    render(<MFASetup onComplete={mockOnComplete} onCancel={mockOnCancel} />);

    // Complete flow to backup codes
    await user.click(screen.getByText('Start Setup'));
    await waitFor(() => screen.getByText('Continue'));
    await user.click(screen.getByText('Continue'));

    await waitFor(() => {
      expect(screen.getByPlaceholderText('Enter 6-digit code')).toBeInTheDocument();
    });

    const codeInput = screen.getByPlaceholderText('Enter 6-digit code');
    await user.type(codeInput, '123456');
    await user.click(screen.getByText('Verify & Complete'));

    await waitFor(() => {
      expect(screen.getByText('Copy Codes')).toBeInTheDocument();
    });

    // Click copy button
    await user.click(screen.getByText('Copy Codes'));

    expect(navigator.clipboard.writeText).toHaveBeenCalledWith('12345678\n87654321');
  });

  it('should handle loading states correctly', () => {
    mockAuthStore.loading = true;

    render(<MFASetup onComplete={mockOnComplete} onCancel={mockOnCancel} />);

    expect(screen.getByRole('button', { name: /start setup/i })).toBeDisabled();
  });

  it('should display proper step indicators', async () => {
    const user = userEvent.setup();
    
    mockAuthStore.enableMFA.mockResolvedValue({
      secret: 'MOCKTOTPSECRET',
      qrCode: 'otpauth://totp/test',
      backupCodes: ['12345678', '87654321']
    });

    render(<MFASetup onComplete={mockOnComplete} onCancel={mockOnCancel} />);

    // Check initial step indicator
    expect(screen.getByText('Step 1 of 4: Setup')).toBeInTheDocument();

    // Move to QR step
    await user.click(screen.getByText('Start Setup'));
    await waitFor(() => {
      expect(screen.getByText('Step 2 of 4: Scan QR')).toBeInTheDocument();
    });

    // Move to verification step
    await user.click(screen.getByText('Continue'));
    await waitFor(() => {
      expect(screen.getByText('Step 3 of 4: Verify')).toBeInTheDocument();
    });
  });
});