import { z } from 'zod'

export const signupSchema = z.object({
    email: z.string().email(),
    password: z.string().min(6),
    name: z.string().min(3),
})

export const teacherLoginSchema = z.object({
    email: z.string().email(),
    password: z.string().min(6),
})

export const studentLoginSchema = z.object({
    room: z.string().length(6),
    username:    z.string().min(1),
    password:    z.string().min(6),
})


export const classroomLoginViewSchema = z.object({
    room: z.string().length(8),
    code: z.string().length(6),
})


export const classroomLoginSchema = z.object({
    room: z.string().length(8),
    code: z.string().length(6),
    username: z.string().min(1)
})
