/** Read `role` from an unverified JWT payload (client UI only; server still enforces isAdmin). */
export function getRoleFromJwt(token: string | null | undefined): 'admin' | 'user' | undefined {
  if (!token || typeof token !== 'string') return undefined
  try {
    const parts = token.split('.')
    if (parts.length < 2) return undefined
    const json = decodeJwtPayload(parts[1])

    const single = json.role
    if (single === 'admin' || single === 'user') return single

    if (json.isAdmin === true) return 'admin'

    const roles = json.roles
    if (Array.isArray(roles) && roles.some((r) => r === 'admin')) return 'admin'
    if (Array.isArray(roles) && roles.some((r) => r === 'user') && !roles.some((r) => r === 'admin'))
      return 'user'

    return undefined
  } catch {
    return undefined
  }
}

function decodeJwtPayload(segment: string): Record<string, unknown> {
  const pad = segment.length % 4 === 0 ? 0 : 4 - (segment.length % 4)
  const padded = segment + (pad ? '='.repeat(pad) : '')
  const base64 = padded.replace(/-/g, '+').replace(/_/g, '/')
  const binary = atob(base64)
  return JSON.parse(binary) as Record<string, unknown>
}
