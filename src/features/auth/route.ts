import { Hono } from 'hono'
import { zValidator } from '@hono/zod-validator'
import {signupSchema, studentLoginSchema, teacherLoginSchema} from './schema'
import {authenticateStudent, authenticateTeacher, createToken, createUser, findUserByEmail} from './service'

export const authRoutes = new Hono()

authRoutes.post(
    '/register',
    zValidator('json', signupSchema),
    async (c) => {
        const { email, password, name } = c.req.valid('json')
        if (await findUserByEmail(email)) {
            return c.json({ error: 'Email already in use' }, 409)
        }
        const hashed = await Bun.password.hash(password, "bcrypt")
        const user = await createUser({ email, password: hashed, name })
        return c.json(user, 201)
    }
)

authRoutes.post(
    '/login',
    zValidator('json', teacherLoginSchema),
    async (c) => {
        const { email, password } = c.req.valid('json')
        const user = await authenticateTeacher(email, password)
        if(!user) {
            return c.json({ error: 'Invalid credentials' }, 401)
        }
        const payload = {
            sub: user.id,
            role: user.role,
            exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 7
        }
        const token = await createToken(payload)
        return c.json({ token })
    }
)

authRoutes.post(
    '/login/student',
    zValidator('json', studentLoginSchema),
    async (c) => {
        const { classroomId, username, password } = c.req.valid('json')
        const auth = await authenticateStudent(classroomId, username, password)
        if (!auth) return c.json({ error: 'Invalid credentials' }, 401)
        const { user } = auth
        const payload = {
            sub: user.id,
            role: user.role,
            classroomId,
            exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 7,
        }
        const token = await createToken(payload)
        return c.json({ token })
    }
)