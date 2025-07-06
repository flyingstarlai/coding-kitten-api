import {z} from "zod";

export const paramClassroomCourseSchema = z.object({
    classroomId:       z.string().cuid(),
    courseSlug:  z.string(),
})

export const beginBodySchema = z.object({
    challengeId: z.string().cuid(),
})

export const completeBodySchema = z.object({
    challengeId: z.string().cuid(),
    stars:       z.number().int().min(0).max(3),
    token:       z.string().length(64),
    timestamp:   z.string(),
})