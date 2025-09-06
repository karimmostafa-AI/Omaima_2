import { NextResponse, type NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase'
import { securityService } from '@/lib/services/security-service'
import { authService } from '@/lib/services/auth-service'
import { z } from 'zod'

const mfaActionSchema = z.object({
  action: z.enum(['enable', 'disable', 'verify', 'generate-backup-codes']),
  code: z.string().optional(),
  backupCode: z.string().optional()
})

/**
 * Multi-Factor Authentication management endpoint
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action, code, backupCode } = mfaActionSchema.parse(body)
    
    const clientIP = securityService.getClientIP(request)
    const userAgent = request.headers.get('user-agent') || 'unknown'
    
    // Get current user
    const user = await authService.getCurrentUser()
    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    switch (action) {
      case 'enable':
        return await handleEnableMFA(user.id, clientIP, userAgent)
      
      case 'disable':
        if (!code && !backupCode) {
          return NextResponse.json(
            { error: 'MFA code or backup code required' },
            { status: 400 }
          )
        }
        return await handleDisableMFA(user.id, code || backupCode!, clientIP, userAgent)
      
      case 'verify':
        if (!code) {
          return NextResponse.json(
            { error: 'MFA code required' },
            { status: 400 }
          )
        }
        return await handleVerifyMFA(user.id, code, clientIP, userAgent)
      
      case 'generate-backup-codes':
        return await handleGenerateBackupCodes(user.id, clientIP, userAgent)
      
      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        )
    }

  } catch (error) {
    console.error('MFA API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * Enable MFA for user
 */
async function handleEnableMFA(
  userId: string,
  clientIP: string,
  userAgent: string
): Promise<NextResponse> {
  try {
    const result = await authService.enableMFA(userId)
    
    if (result.error) {
      return NextResponse.json(
        { error: result.error },
        { status: 400 }
      )
    }

    await securityService.logSecurityEvent({
      type: 'mfa_enabled',
      userId,
      ip: clientIP,
      userAgent,
      details: {
        action: 'mfa_setup_initiated'
      }
    })

    return NextResponse.json({
      success: true,
      secret: result.secret,
      qrCode: result.qrCode,
      backupCodes: result.backupCodes
    })

  } catch (error) {
    console.error('Enable MFA error:', error)
    return NextResponse.json(
      { error: 'Failed to enable MFA' },
      { status: 500 }
    )
  }
}

/**
 * Disable MFA for user
 */
async function handleDisableMFA(
  userId: string,
  code: string,
  clientIP: string,
  userAgent: string
): Promise<NextResponse> {
  try {
    // For backup codes, verify differently
    let isValid = false
    
    if (code.length === 8) {
      // Backup code verification
      isValid = await verifyBackupCode(userId, code)
    } else if (code.length === 6) {
      // TOTP verification
      const result = await authService.verifyMFA(userId, code)
      isValid = result.success
    }

    if (!isValid) {
      await securityService.logSecurityEvent({
        type: 'failed_login',
        userId,
        ip: clientIP,
        userAgent,
        details: {
          action: 'mfa_disable_failed',
          reason: 'invalid_code'
        }
      })

      return NextResponse.json(
        { error: 'Invalid verification code' },
        { status: 401 }
      )
    }

    // Disable MFA
    const supabase = createClient()
    const { error } = await supabase.auth.updateUser({
      data: {
        mfa_enabled: false,
        mfa_secret: null,
        backup_codes: null
      }
    })

    if (error) {
      return NextResponse.json(
        { error: 'Failed to disable MFA' },
        { status: 500 }
      )
    }

    await securityService.logSecurityEvent({
      type: 'login',
      userId,
      ip: clientIP,
      userAgent,
      details: {
        action: 'mfa_disabled'
      }
    })

    return NextResponse.json({ success: true })

  } catch (error) {
    console.error('Disable MFA error:', error)
    return NextResponse.json(
      { error: 'Failed to disable MFA' },
      { status: 500 }
    )
  }
}

/**
 * Verify MFA code
 */
async function handleVerifyMFA(
  userId: string,
  code: string,
  clientIP: string,
  userAgent: string
): Promise<NextResponse> {
  try {
    const result = await authService.verifyMFA(userId, code)
    
    const eventType = result.success ? 'login' : 'failed_login'
    await securityService.logSecurityEvent({
      type: eventType,
      userId,
      ip: clientIP,
      userAgent,
      details: {
        action: 'mfa_verification',
        success: result.success
      }
    })

    return NextResponse.json({
      success: result.success,
      error: result.error
    })

  } catch (error) {
    console.error('Verify MFA error:', error)
    return NextResponse.json(
      { error: 'Failed to verify MFA' },
      { status: 500 }
    )
  }
}

/**
 * Generate new backup codes
 */
async function handleGenerateBackupCodes(
  userId: string,
  clientIP: string,
  userAgent: string
): Promise<NextResponse> {
  try {
    const result = await authService.generateBackupCodes(userId)
    
    if (result.error) {
      return NextResponse.json(
        { error: result.error },
        { status: 400 }
      )
    }

    await securityService.logSecurityEvent({
      type: 'login',
      userId,
      ip: clientIP,
      userAgent,
      details: {
        action: 'backup_codes_generated'
      }
    })

    return NextResponse.json({
      success: true,
      backupCodes: result.codes
    })

  } catch (error) {
    console.error('Generate backup codes error:', error)
    return NextResponse.json(
      { error: 'Failed to generate backup codes' },
      { status: 500 }
    )
  }
}

/**
 * Verify backup code (simplified implementation)
 */
async function verifyBackupCode(userId: string, backupCode: string): Promise<boolean> {
  try {
    const supabase = createClient()
    const { data: user } = await supabase.auth.getUser()
    
    if (!user.user) return false
    
    const backupCodes = user.user.user_metadata?.backup_codes || []
    return backupCodes.includes(backupCode)
    
  } catch (error) {
    console.error('Backup code verification error:', error)
    return false
  }
}

/**
 * Get MFA status and settings
 */
export async function GET(request: NextRequest) {
  try {
    const user = await authService.getCurrentUser()
    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const mfaEnabled = user.user_metadata?.mfa_enabled || false
    const hasBackupCodes = !!(user.user_metadata?.backup_codes?.length)
    
    return NextResponse.json({
      mfaEnabled,
      hasBackupCodes,
      backupCodesCount: user.user_metadata?.backup_codes?.length || 0
    })

  } catch (error) {
    console.error('Get MFA status error:', error)
    return NextResponse.json(
      { error: 'Failed to get MFA status' },
      { status: 500 }
    )
  }
}
