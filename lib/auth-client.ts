/**
 * FILE: lib/auth-client.ts
 * AgentWA - Client-side authentication utilities
 */

let isRedirecting = false
let lastVerifyCall = 0
let verifyInProgress = false
const VERIFY_THROTTLE_MS = 2000

export function clearAllCookies() {
  const cookies = document.cookie.split(";")

  for (let i = 0; i < cookies.length; i++) {
    const cookie = cookies[i]
    const eqPos = cookie.indexOf("=")
    const name = eqPos > -1 ? cookie.substring(0, eqPos).trim() : cookie.trim()

    const domains = [window.location.hostname, `.${window.location.hostname}`, "localhost", ".delegar.space"]
    const paths = ["/", "/api", "/login", "/panel"]

    domains.forEach((domain) => {
      paths.forEach((path) => {
        document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=${path}; domain=${domain};`
        document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=${path};`
      })
    })

    document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`
  }

  try {
    localStorage.removeItem("auth")
    sessionStorage.removeItem("auth")
  } catch (e) {
  }
}

export async function verifyAuthentication(options?: {
  redirectUrl?: string
  onError?: (error: Error) => void
  forceCheck?: boolean
}): Promise<{ authenticated: boolean; user?: any } | null> {
  const { redirectUrl = "/login", onError, forceCheck = false } = options || {}

  if (isRedirecting) {
    return null
  }

  const now = Date.now()
  if (!forceCheck && verifyInProgress) {
    console.log("[auth-client] Verify already in progress, skipping duplicate call")
    return null
  }

  if (!forceCheck && now - lastVerifyCall < VERIFY_THROTTLE_MS) {
    console.log("[auth-client] Verify throttled, too many requests")
    return null
  }

  verifyInProgress = true
  lastVerifyCall = now

  try {
    const response = await fetch("/api/auth/verify", {
      credentials: "include",
      cache: "no-cache",
      headers: {
        "Cache-Control": "no-cache",
        Pragma: "no-cache",
      },
    })

    const data = await response.json()

    if (!response.ok) {
      const serverClearedCookie = data?.action === "cookie_cleared"

      if (serverClearedCookie) {
        console.log("[auth-client] Server cleared invalid session cookie")
      }

      handleAuthFailure(redirectUrl, !serverClearedCookie)
      return null
    }

    if (data.authenticated && data.user?.email) {
      verifyInProgress = false
      return data
    } else {
      handleAuthFailure(redirectUrl)
      return null
    }
  } catch (error) {
    console.error("[auth-client] Error verifying auth:", error)
    if (onError) {
      onError(error as Error)
    }
    handleAuthFailure(redirectUrl)
    return null
  } finally {
    verifyInProgress = false
  }
}

function handleAuthFailure(redirectUrl: string, shouldClearCookies: boolean = true) {
  if (isRedirecting) return

  if (!redirectUrl || redirectUrl.trim() === "") {
    console.log("[auth-client] No redirect URL provided, skipping redirect")
    return
  }

  isRedirecting = true

  if (shouldClearCookies) {
    console.log("[auth-client] Clearing cookies client-side")
    clearAllCookies()
  } else {
    console.log("[auth-client] Skipping cookie clear (server already cleared)")
  }

  setTimeout(() => {
    window.location.href = redirectUrl
  }, 100)
}

export function useAuthVerification(redirectUrl?: string) {
  return {
    verifyAuth: () => verifyAuthentication({ redirectUrl }),
    clearCookies: clearAllCookies,
  }
}
