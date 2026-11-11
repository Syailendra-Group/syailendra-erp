/**
 * turnstile.ts — Cloudflare Turnstile token server-side verification
 * Syailendra Group ERP
 */

export interface TurnstileVerificationResult {
  success: boolean
  error?: string
  hostname?: string
  action?: string
}

interface TurnstileSiteverifyResponse {
  success: boolean
  hostname?: string
  action?: string
  'error-codes'?: string[]
}

export async function verifyTurnstileToken(token: string, remoteip?: string): Promise<TurnstileVerificationResult> {
  const secret = process.env.TURNSTILE_SECRET_KEY || '1x0000000000000000000000000000000AA'
  const expectedHostnames = new Set(
    (process.env.TURNSTILE_HOSTNAMES ?? 'localhost,127.0.0.1,demo.octalectzz.my.id,app.syailendra.group')
      .split(',')
      .map((h) => h.trim())
      .filter(Boolean)
  )

  if (!token || typeof token !== 'string' || token.trim().length === 0) {
    return {
      success: false,
      error: 'Turnstile verification token is missing'
    }
  }

  try {
    const formData = new URLSearchParams()
    formData.append('secret', secret)
    formData.append('response', token)
    if (remoteip) {
      formData.append('remoteip', remoteip)
    }

    const response = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: formData,
      signal: AbortSignal.timeout(10000)
    })

    if (!response.ok) {
      return {
        success: false,
        error: `Cloudflare Turnstile verification endpoint returned status ${response.status}`
      }
    }

    const data = (await response.json()) as TurnstileSiteverifyResponse

    // Test secret always returns success: true, or dummy hostname
    if (!data.success) {
      const errorCodes = Array.isArray(data['error-codes']) ? data['error-codes'].join(', ') : 'Verification rejected'
      return {
        success: false,
        error: errorCodes
      }
    }

    // Enforce hostname verification when running with production Turnstile keys
    const isTestSecret = secret === '1x0000000000000000000000000000000AA'
    if (!isTestSecret && data.hostname && expectedHostnames.size > 0 && !expectedHostnames.has(data.hostname)) {
      return {
        success: false,
        error: `Hostname mismatch: ${data.hostname}`
      }
    }

    return {
      success: true,
      hostname: data.hostname,
      action: data.action
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Turnstile verification request failed'
    return {
      success: false,
      error: message
    }
  }
}
