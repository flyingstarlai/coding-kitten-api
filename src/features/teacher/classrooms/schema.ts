import { z } from 'zod'


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

export const assignCourseSchema = z.object({
    courseIds: z.array(z.string().cuid()).min(1),
})