import { z } from 'zod'

export const idParamSchema = z.object({
    id: z.string().cuid(),
})

export const createClassroomSchema = z.object({
    name:        z.string().min(1),
    maxStudents: z.number().int().min(1).optional(),
})

export const updateClassroomSchema = z.object({
    name:        z.string().min(1).optional(),
    maxStudents: z.number().int().min(1).optional(),
})

export const createStudentSchema = z.object({
    username: z.string().min(1),
    password: z.string().min(6),
    name:     z.string().optional(),
})