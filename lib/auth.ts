import { SignJWT, jwtVerify } from 'jose'
import { cookies } from 'next/headers'

const COOKIE_NAME = 'cafe-auth-token'
const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'default-secret-change-me-in-production')

export interface TokenPayload {
  memberId: string
  nickname: string
  tier: 0 | 1 | 2 | 3 | 4
}

export async function createToken(payload: TokenPayload): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime('7d')
    .setIssuedAt()
    .sign(JWT_SECRET)
}

export async function verifyToken(token: string): Promise<TokenPayload | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET)
    return {
      memberId: payload.memberId as string,
      nickname: payload.nickname as string,
      tier: payload.tier as 0 | 1 | 2 | 3 | 4,
    }
  } catch {
    return null
  }
}

export async function getTokenFromCookies(): Promise<string | null> {
  const cookieStore = await cookies()
  return cookieStore.get(COOKIE_NAME)?.value || null
}

export async function getCurrentUser(): Promise<TokenPayload | null> {
  const token = await getTokenFromCookies()
  if (!token) return null
  return verifyToken(token)
}

export { COOKIE_NAME }
