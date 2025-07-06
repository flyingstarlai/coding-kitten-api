import { z } from 'zod'


export const createEnrollmentSchema = z.object({
    username:    z.string().min(1),
    password:    z.string().min(6),
    name:        z.string().min(3),
})