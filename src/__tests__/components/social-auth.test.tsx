import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import '@testing-library/jest-dom'
import React from 'react'
import { SocialLoginButton, GoogleLoginButton } from '@/components/auth/social-login-button'
import { SocialAuthPanel } from '@/components/auth/social-auth-panel'
import { useAuthStore } from '@/store/auth-store'

// Mock the auth store
vi.mock('@/store/auth-store', () => ({
  useAuthStore: vi.fn()
}))

// Mock Next.js router
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    back: vi.fn()
  })
}))

// Mock toast notifications
vi.mock('react-hot-toast', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn()
  }
}))

describe('Social Authentication Components', () => {
  const mockSignInWithProvider = vi.fn()
  const mockSignInWithGoogle = vi.fn()
  
  beforeEach(() => {
    vi.clearAllMocks()
    
    // Mock auth store implementation
    ;(useAuthStore as any).mockReturnValue({
      loading: false,
      signInWithProvider: mockSignInWithProvider,
      signInWithGoogle: mockSignInWithGoogle
    })
  })

  describe('SocialLoginButton', () => {
    it('should render Google login button correctly', () => {
      render(
        <SocialLoginButton 
          provider="google" 
          data-testid="google-login-btn"
        />
      )
      
      const button = screen.getByTestId('google-login-btn')
      expect(button).toBeInTheDocument()
      expect(button).toHaveTextContent('Continue with Google')
    })

    it('should render Facebook login button correctly', () => {
      render(
        <SocialLoginButton 
          provider="facebook" 
          data-testid="facebook-login-btn"
        />
      )
      
      const button = screen.getByTestId('facebook-login-btn')
      expect(button).toBeInTheDocument()
      expect(button).toHaveTextContent('Continue with Facebook')
    })

    it('should render GitHub login button correctly', () => {
      render(
        <SocialLoginButton 
          provider="github" 
          data-testid="github-login-btn"
        />
      )
      
      const button = screen.getByTestId('github-login-btn')
      expect(button).toBeInTheDocument()
      expect(button).toHaveTextContent('Continue with GitHub')
    })

    it('should render Apple login button correctly', () => {
      render(
        <SocialLoginButton 
          provider="apple" 
          data-testid="apple-login-btn"
        />
      )
      
      const button = screen.getByTestId('apple-login-btn')
      expect(button).toBeInTheDocument()
      expect(button).toHaveTextContent('Continue with Apple')
    })

    it('should call signInWithProvider when clicked', async () => {
      const user = userEvent.setup()
      mockSignInWithProvider.mockResolvedValue({ success: true })
      
      render(
        <SocialLoginButton 
          provider="google" 
          data-testid="google-login-btn"
        />
      )
      
      const button = screen.getByTestId('google-login-btn')
      await user.click(button)
      
      expect(mockSignInWithProvider).toHaveBeenCalledWith('google')
    })

    it('should show loading state', () => {
      ;(useAuthStore as any).mockReturnValue({
        loading: true,
        signInWithProvider: mockSignInWithProvider
      })
      
      render(
        <SocialLoginButton 
          provider="google" 
          data-testid="google-login-btn"
        />
      )
      
      const button = screen.getByTestId('google-login-btn')
      expect(button).toBeDisabled()
      
      // Check for loading spinner
      const spinner = screen.getByTestId('loading-spinner') || button.querySelector('.animate-spin')
      expect(spinner).toBeInTheDocument()
    })

    it('should handle authentication errors', async () => {
      const user = userEvent.setup()
      const mockOnError = vi.fn()
      mockSignInWithProvider.mockResolvedValue({ error: 'Authentication failed' })
      
      render(
        <SocialLoginButton 
          provider="google" 
          onError={mockOnError}
          data-testid="google-login-btn"
        />
      )
      
      const button = screen.getByTestId('google-login-btn')
      await user.click(button)
      
      await waitFor(() => {
        expect(mockOnError).toHaveBeenCalledWith('Authentication failed')
      })
    })

    it('should call onSuccess callback on successful auth', async () => {
      const user = userEvent.setup()
      const mockOnSuccess = vi.fn()
      mockSignInWithProvider.mockResolvedValue({ success: true })
      
      render(
        <SocialLoginButton 
          provider="google" 
          onSuccess={mockOnSuccess}
          data-testid="google-login-btn"
        />
      )
      
      const button = screen.getByTestId('google-login-btn')
      await user.click(button)
      
      await waitFor(() => {
        expect(mockOnSuccess).toHaveBeenCalled()
      })
    })

    it('should be disabled when disabled prop is true', () => {
      render(
        <SocialLoginButton 
          provider="google" 
          disabled={true}
          data-testid="google-login-btn"
        />
      )
      
      const button = screen.getByTestId('google-login-btn')
      expect(button).toBeDisabled()
    })

    it('should render custom children', () => {
      render(
        <SocialLoginButton provider="google">
          Custom Google Login
        </SocialLoginButton>
      )
      
      expect(screen.getByText('Custom Google Login')).toBeInTheDocument()
    })

    it('should apply custom className', () => {
      render(
        <SocialLoginButton 
          provider="google" 
          className="custom-class"
          data-testid="google-login-btn"
        />
      )
      
      const button = screen.getByTestId('google-login-btn')
      expect(button).toHaveClass('custom-class')
    })

    it('should handle different sizes correctly', () => {
      const { rerender } = render(
        <SocialLoginButton 
          provider="google" 
          size="sm"
          data-testid="google-login-btn"
        />
      )
      
      let button = screen.getByTestId('google-login-btn')
      expect(button).toHaveClass('h-8')
      
      rerender(
        <SocialLoginButton 
          provider="google" 
          size="lg"
          data-testid="google-login-btn"
        />
      )
      
      button = screen.getByTestId('google-login-btn')
      expect(button).toHaveClass('h-12')
    })
  })

  describe('GoogleLoginButton', () => {
    it('should render and function as Google provider', async () => {
      const user = userEvent.setup()
      mockSignInWithGoogle.mockResolvedValue({ success: true })
      
      render(<GoogleLoginButton data-testid="google-btn" />)
      
      const button = screen.getByTestId('google-btn')
      expect(button).toHaveTextContent('Continue with Google')
      
      await user.click(button)
      expect(mockSignInWithProvider).toHaveBeenCalledWith('google')
    })
  })

  describe('SocialAuthPanel', () => {
    it('should render all default providers', () => {
      render(<SocialAuthPanel />)
      
      expect(screen.getByText('Continue with Google')).toBeInTheDocument()
      expect(screen.getByText('Continue with Facebook')).toBeInTheDocument()
      expect(screen.getByText('Continue with GitHub')).toBeInTheDocument()
      expect(screen.getByText('Continue with Apple')).toBeInTheDocument()
    })

    it('should render only specified providers', () => {
      render(
        <SocialAuthPanel 
          providers={['google', 'facebook']}
        />
      )
      
      expect(screen.getByText('Continue with Google')).toBeInTheDocument()
      expect(screen.getByText('Continue with Facebook')).toBeInTheDocument()
      expect(screen.queryByText('Continue with GitHub')).not.toBeInTheDocument()
      expect(screen.queryByText('Continue with Apple')).not.toBeInTheDocument()
    })

    it('should render custom title and description', () => {
      render(
        <SocialAuthPanel 
          title="Sign In"
          description="Choose your login method"
        />
      )
      
      expect(screen.getByText('Sign In')).toBeInTheDocument()
      expect(screen.getByText('Choose your login method')).toBeInTheDocument()
    })

    it('should show divider when enabled', () => {
      render(
        <SocialAuthPanel 
          showDivider={true}
          dividerText="OR CONTINUE WITH"
        />
      )
      
      expect(screen.getByText('OR CONTINUE WITH')).toBeInTheDocument()
    })

    it('should hide divider when disabled', () => {
      render(
        <SocialAuthPanel 
          showDivider={false}
          dividerText="OR"
        />
      )
      
      expect(screen.queryByText('OR')).not.toBeInTheDocument()
    })

    it('should handle success callback', async () => {
      const user = userEvent.setup()
      const mockOnSuccess = vi.fn()
      mockSignInWithProvider.mockResolvedValue({ success: true })
      
      render(
        <SocialAuthPanel 
          providers={['google']}
          onSuccess={mockOnSuccess}
        />
      )
      
      const googleButton = screen.getByText('Continue with Google')
      await user.click(googleButton)
      
      await waitFor(() => {
        expect(mockOnSuccess).toHaveBeenCalledWith('google')
      })
    })

    it('should handle error callback', async () => {
      const user = userEvent.setup()
      const mockOnError = vi.fn()
      mockSignInWithProvider.mockResolvedValue({ error: 'OAuth error' })
      
      render(
        <SocialAuthPanel 
          providers={['google']}
          onError={mockOnError}
        />
      )
      
      const googleButton = screen.getByText('Continue with Google')
      await user.click(googleButton)
      
      await waitFor(() => {
        expect(mockOnError).toHaveBeenCalledWith('OAuth error')
      })
    })

    it('should display error message', async () => {
      const user = userEvent.setup()
      mockSignInWithProvider.mockResolvedValue({ error: 'Authentication failed' })
      
      render(
        <SocialAuthPanel 
          providers={['google']}
        />
      )
      
      const googleButton = screen.getByText('Continue with Google')
      await user.click(googleButton)
      
      await waitFor(() => {
        expect(screen.getByText('Authentication failed')).toBeInTheDocument()
      })
    })

    it('should display success message', async () => {
      const user = userEvent.setup()
      mockSignInWithProvider.mockResolvedValue({ success: true })
      
      render(
        <SocialAuthPanel 
          providers={['google']}
        />
      )
      
      const googleButton = screen.getByText('Continue with Google')
      await user.click(googleButton)
      
      await waitFor(() => {
        expect(screen.getByText('Successfully signed in with google')).toBeInTheDocument()
      })
    })

    it('should render in compact variant', () => {
      render(
        <SocialAuthPanel 
          variant="compact"
          providers={['google']}
          data-testid="compact-panel"
        />
      )
      
      // Compact variant should not have card wrapper
      const panel = screen.getByTestId('compact-panel')
      expect(panel).not.toHaveClass('border')
    })

    it('should render in grid variant', () => {
      render(
        <SocialAuthPanel 
          variant="grid"
          providers={['google', 'facebook']}
        />
      )
      
      // Grid variant should have grid layout
      const gridContainer = screen.getByText('Continue with Google').closest('.grid')
      expect(gridContainer).toHaveClass('grid-cols-2')
    })

    it('should apply custom className', () => {
      render(
        <SocialAuthPanel 
          className="custom-panel-class"
          data-testid="social-panel"
        />
      )
      
      const panel = screen.getByTestId('social-panel')
      expect(panel).toHaveClass('custom-panel-class')
    })
  })

  describe('Accessibility', () => {
    it('should have proper ARIA labels', () => {
      render(
        <SocialLoginButton 
          provider="google"
          aria-label="Sign in with Google"
        />
      )
      
      const button = screen.getByLabelText('Sign in with Google')
      expect(button).toBeInTheDocument()
    })

    it('should be keyboard navigable', async () => {
      const user = userEvent.setup()
      render(
        <SocialAuthPanel 
          providers={['google', 'facebook']}
        />
      )
      
      const googleButton = screen.getByText('Continue with Google')
      const facebookButton = screen.getByText('Continue with Facebook')
      
      // Tab to first button
      await user.tab()
      expect(googleButton).toHaveFocus()
      
      // Tab to second button
      await user.tab()
      expect(facebookButton).toHaveFocus()
    })

    it('should handle Enter key activation', async () => {
      const user = userEvent.setup()
      mockSignInWithProvider.mockResolvedValue({ success: true })
      
      render(
        <SocialLoginButton 
          provider="google"
          data-testid="google-btn"
        />
      )
      
      const button = screen.getByTestId('google-btn')
      button.focus()
      
      await user.keyboard('{Enter}')
      expect(mockSignInWithProvider).toHaveBeenCalledWith('google')
    })

    it('should handle Space key activation', async () => {
      const user = userEvent.setup()
      mockSignInWithProvider.mockResolvedValue({ success: true })
      
      render(
        <SocialLoginButton 
          provider="google"
          data-testid="google-btn"
        />
      )
      
      const button = screen.getByTestId('google-btn')
      button.focus()
      
      await user.keyboard(' ')
      expect(mockSignInWithProvider).toHaveBeenCalledWith('google')
    })
  })
})
