import {z} from "zod";

export const classroomIdParamSchema = z.object({
    classroomId: z.string().cuid(),
})

export const userIdParamSchema = z.object({
    userId: z.string().cuid(),
})


export const classroomAndCourseParamSchema = z.object({
    classroomId: z.string().cuid(),
    courseSlug:  z.string().min(3),
})

