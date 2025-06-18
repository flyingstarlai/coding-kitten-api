import { z } from 'zod'

export const signupSchema = z.object({
    email: z.string().email(),
    password: z.string().min(6),
    name: z.string().optional(),
})

export const teacherLoginSchema = z.object({
    email: z.string().email(),
    password: z.string().min(6),
})

export const studentLoginSchema = z.object({
    classroomId: z.string().cuid(),
    username:    z.string().min(1),
    password:    z.string().min(6),
})
