import { Context, Next } from 'hono'
import {prisma} from "../db";


/**
 * Middleware to ensure the authenticated TEACHER owns the classroom (or is ADMIN).
 * Expects the classroom ID in the URL param named 'id'.
 */
export const ensureClassroomMember = async (c: Context, next: Next) => {
    const payload = c.get('jwtPayload') as { sub: string; role: string }
    const classroomId = c.req.param('classroomId')
    if (!classroomId) {
        return c.json({ error: 'Classroom ID is required' }, 400)
    }

    // ADMIN bypasses all checks
    if (payload.role === 'ADMIN') {
        await next()
        return
    }

    // TEACHER must own the classroom
    if (payload.role === 'TEACHER') {
        const classroom = await prisma.classroom.findUnique({
            where: { id: classroomId },
            select: { teacherId: true }
        })
        if (!classroom) {
            return c.json({ error: 'Classroom not found' }, 404)
        }
        if (classroom.teacherId !== payload.sub) {
            return c.json({ error: 'Forbidden' }, 403)
        }

        await next()
        return
    }

    // STUDENT must be enrolled in the classroom
    if (payload.role === 'STUDENT') {
        const enrollment = await prisma.enrollment.findFirst({
            where: {
                classroomId,
                studentId: payload.sub,
                deletedAt: null,
            }
        })
        if (!enrollment) {
            return c.json({ error: 'Forbidden' }, 403)
        }

        await next()
        return
    }

    // All other roles are forbidden
    return c.json({ error: 'Forbidden' }, 403)
}
