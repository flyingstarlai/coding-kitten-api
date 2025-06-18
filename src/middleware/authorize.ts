import { Context, Next } from 'hono'
import type { Role } from '../generated/prisma'

export const authorize = (allowedRoles: Role[]) => {
    return async (c: Context, next: Next) => {
        // payload populated by jwt middleware under 'jwt'
        const payload = c.get('jwtPayload') as { sub: string; role: Role }
        if (!payload || !allowedRoles.includes(payload.role)) {
            return c.json({ error: 'Forbidden' }, 403)
        }
        await next()
    }
}