import { z } from 'zod'

export const idParamSchema = z.object({
    id: z.string().cuid(),
})

export const createCourseSchema = z.object({
    title:       z.string().min(1),
    description: z.string().optional(),
})

export const updateCourseSchema = z.object({
    title:       z.string().min(1).optional(),
    description: z.string().optional(),
})