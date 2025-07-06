
// src/utils/auth.ts
import { Context } from 'hono'

export interface JwtPayload {
    sub: string
    role: string
}

/**
 * Safely grab the JWT payload from context.
 * Throws if missing or malformed.
 */
export function getJwtPayload(c: Context): JwtPayload {
    const payload = c.get('jwtPayload')
    if (
        !payload ||
        typeof payload !== 'object' ||
        typeof (payload as any).sub !== 'string' ||
        typeof (payload as any).role !== 'string'
    ) {
        throw new Error('Invalid or missing JWT payload')
    }
    return payload as JwtPayload
}

/**
 * Returns the current user’s ID (the `sub` claim).
 */
export function getJwtUserId(c: Context): string {
    return getJwtPayload(c).sub
}

/**
 * Returns the current user’s role.
 */
export function getUserRole(c: Context): string {
    return getJwtPayload(c).role
}