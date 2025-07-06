import { z } from 'zod'


export const updateUserSchema = z.object({
    name:     z.string().optional(),
    password: z.string().min(6).optional(),
    defaultClassroomId: z.string().optional(),
})