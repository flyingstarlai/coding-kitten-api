import { z } from 'zod'

export const idParamSchema = z.object({
    id: z.string().cuid(),
})

export const updateUserSchema = z.object({
    name:     z.string().optional(),
    password: z.string().min(6).optional(),
})