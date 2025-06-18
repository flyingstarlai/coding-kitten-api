import { Course as PrismaCourse, Assignment as PrismaAssignment } from '../../generated/prisma'

export type AssignmentResponse = {
    id: string
    level: number
    title: string
    description: string | null
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

export const toAssignmentResponse = (a: PrismaAssignment): AssignmentResponse => ({
    id: a.id,
    level: a.level,
    title: a.title,
    description: a.description,
    createdAt: a.createdAt,
})

export const toCourseResponse = (course: PrismaCourse): CourseResponse => ({
    id:          course.id,
    title:       course.title,
    slug:        course.slug,
    description: course.description,
    createdAt:   course.createdAt,
})

export const toCourseDetailResponse = (course: PrismaCourse & { assignments: PrismaAssignment[] }): CourseDetailResponse => ({
    id:          course.id,
    title:       course.title,
    slug:        course.slug,
    description: course.description,
    createdAt:   course.createdAt,
    assignments: course.assignments.map(toAssignmentResponse),
})