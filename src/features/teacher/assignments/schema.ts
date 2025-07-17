import {z} from "zod";


export const enableBodySchema = z.object({
    week: z.number().int().min(1).max(4),
})
