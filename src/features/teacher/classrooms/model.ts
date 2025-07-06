import { Classroom, AssignedCourse, Course } from "../../../generated/prisma"

export type AssignedCourseWithCourse = AssignedCourse & { course: Course }

export type ClassroomResponse = {
    id: string
    name: string
    teacherId: string
    maxStudents: number
    code: string
    createdAt: Date
}






export const toClassroomResponse = (c: Classroom) => ({
    id: c.id,
    name: c.name,
    teacherId: c.teacherId,
    maxStudents: c.maxStudents,
    code: c.code,
    createdAt: c.createdAt,
})
