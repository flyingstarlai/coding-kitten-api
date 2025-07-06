import { Course, Challenge } from "../../../generated/prisma"

export type AssignmentResponse = {
    id: string
    level: number
    title: string
    description: string | null
    isLocked: boolean
    createdAt: Date
}

export type CourseResponse = {
    id:          string
    title:       string
    slug:        string
    description: string | null
    createdAt:   Date
}

export type CourseDetailResponse = CourseResponse & {
    assignments: AssignmentResponse[]
}

export const toAssignmentResponse = (c: Challenge): AssignmentResponse => ({
    id: c.id,
    level: c.level,
    title: c.title,
    description: c.description,
    isLocked: c.isLocked,
    createdAt: c.createdAt,
})

export const toCourseResponse = (course: Course): CourseResponse => ({
    id:          course.id,
    title:       course.title,
    slug:        course.slug,
    description: course.description,
    createdAt:   course.createdAt,
})

export const toCourseDetailResponse = (course: Course & { challenges: Challenge[] }): CourseDetailResponse => ({
    id:          course.id,
    title:       course.title,
    slug:        course.slug,
    description: course.description,
    createdAt:   course.createdAt,
    assignments: course.challenges.map(toAssignmentResponse),
})