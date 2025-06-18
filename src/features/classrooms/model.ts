import { Classroom as PrismaClassroom, Role } from '../../generated/prisma'

export type ClassroomResponse = {
    id: string
    name: string
    teacherId: string
    maxStudents: number
    code: string
    createdAt: Date
}

export type StudentResponse = {
    id: string
    username: string
    name: string | null
    role: Role
    createdAt: Date
}

export const toClassroomResponse = (c: PrismaClassroom): ClassroomResponse => ({
    id: c.id,
    name: c.name,
    teacherId: c.teacherId,
    maxStudents: c.maxStudents,
    code: c.code,
    createdAt: c.createdAt,
})