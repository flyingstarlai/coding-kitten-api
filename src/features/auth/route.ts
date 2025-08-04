import { Hono } from 'hono'
import { zValidator } from '@hono/zod-validator'
import {
    classroomLoginSchema,
    codeQuerySchema,
    signupSchema,
    studentLoginSchema,
    teacherLoginSchema
} from './schema'
import {
    authenticateStudent,
    authenticateTeacher,
    createToken,
    createUser,
    findUserByEmail,
    findUserById
} from './service'
import {toAuthResponse} from "./model";
import {verifyClassroomSession} from "../teacher/classrooms/service";
import {getEnrolledStudentByUsername, getEnrolledStudents} from "../teacher/enrollments/service";

export const authRoutes = new Hono()
    .post(
    '/register',
    zValidator('json', signupSchema),
    async (c) => {
        const { email, password, name } = c.req.valid('json')
        if (await findUserByEmail(email)) {
            return c.json({ error: 'Email already in use' }, 409)
        }
        const hashed = await Bun.password.hash(password, "bcrypt")
        const user = await createUser({ email, password: hashed, name })
        const payload = {
            sub: user.id,
            role: user.role,
            exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 5
        }
        const token = await createToken(payload)
        return c.json(toAuthResponse(user, token), 201)
    }
)

.post(
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
            exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 5
        }
        const token = await createToken(payload)
        return c.json(toAuthResponse(user, token))
    }
)

.post(
    '/login/student',
    zValidator('json', studentLoginSchema),
    async (c) => {
        const { room, username, password } = c.req.valid('json')
        const auth = await authenticateStudent(room, username, password)
        if (!auth) return c.json({ error: 'Invalid credentials' }, 401)
        const { user } = auth
        const payload = {
            sub: user.id,
            role: user.role,
            room,
            exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 5,
        }
        const token = await createToken(payload)
        return c.json(toAuthResponse(user, token))
    }
)
    .get(
        '/login/room',
        zValidator("query", codeQuerySchema),
        async (c) => {
            const {  code } = c.req.valid('query')

            const classroomId = await verifyClassroomSession(code)
            if (!classroomId) {
                return c.json({ error: "Invalid or expired session code" }, 401)
            }

            console.log("ROOM", classroomId)
            const enrollments = await getEnrolledStudents(classroomId)

            return c.json(
                enrollments
                    .filter(e => e.username !== "teacher")
                    .map((e) => ({
                    username: e.username,
                    name:     e.student.name
                }))
            )

        }
    )
    .post(
        '/login/room',
        zValidator('json', classroomLoginSchema),
        async (c) => {
            const { code, username } = c.req.valid('json')

            const classroomId = await verifyClassroomSession(code)
            if (!classroomId) {
                return c.json({ error: "Invalid or expired session code" }, 401)
            }

            const enrollment = await getEnrolledStudentByUsername(classroomId, username)
            if(!enrollment) {
                return c.json({ error: "Student not found" }, 404)
            }

            const user = await findUserById(enrollment.studentId)

            if(!user) {
                return c.json({ error: "User not found" }, 404)
            }

            const payload = {
                sub: user.id,
                role: user.role,
                exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 5
            }
            const token = await createToken(payload)
            return c.json(toAuthResponse(user, token))

        }
    )
