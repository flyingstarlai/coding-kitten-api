import {z} from "zod";

export const enrolledCourseSchema = z.object({
    assignedCourseId: z.string().cuid(),
 })