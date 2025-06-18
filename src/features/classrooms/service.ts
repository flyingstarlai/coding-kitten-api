import { Role } from '../../generated/prisma'
import {ClassroomResponse, StudentResponse, toClassroomResponse} from "./model";
import {prisma} from "../../db";


const generateUniqueCode = async (): Promise<string> => {
    while (true) {
        const code = String(Math.floor(Math.random() * 1_000_000)).padStart(6, '0')
        const exists = await prisma.classroom.findUnique({ where: { code } })
        if (!exists) return code
    }
}

export const listClassrooms = (): Promise<ClassroomResponse[]> =>
    prisma.classroom
        .findMany({ where: { deletedAt: null } })
        .then(cs => cs.map(toClassroomResponse))

export const getClassroomById = (
    id: string
): Promise<ClassroomResponse | null> =>
    prisma.classroom
        .findFirst({ where: { id, deletedAt: null } })
        .then(c => (c ? toClassroomResponse(c) : null))

export const createClassroom = async (
    data: { name: string; maxStudents?: number; teacherId: string }
): Promise<ClassroomResponse> => {
    const code = await generateUniqueCode()
    const room = await prisma.classroom.create({
        data: { ...data, code },
    })
    return toClassroomResponse(room)
}

export const updateClassroom = (
    id: string,
    data: Partial<{ name: string; maxStudents?: number }>
): Promise<ClassroomResponse> =>
    prisma.classroom
        .update({ where: { id }, data })
        .then(toClassroomResponse)


export const softDeleteClassroom = (
    id: string
): Promise<{ id: string }> =>
    prisma.classroom.update({
        where: { id },
        data: { deletedAt: new Date() },
        select: { id: true },
    })

export const restoreClassroom = (
    id: string
): Promise<ClassroomResponse> =>
    prisma.classroom
        .update({ where: { id }, data: { deletedAt: null } })
        .then(toClassroomResponse)

export const addStudentToClassroom = async (
    code: string,
    data: { username: string; password: string; name?: string }
): Promise<StudentResponse | null> => {
    const hashed = await Bun.password.hash(data.password)
    const classroom = await prisma.classroom.findUnique({ where: { code } })
    
    if(!classroom) return null

    const classroomId = classroom.id
    const email = `${data.username}$@${classroomId}.student`
    const user = await prisma.user.create({
        data: {
            email,
            password: hashed,
            name: data.name,
            role: Role.STUDENT,
        },
        select: { id: true, email: true, name: true, role: true, createdAt: true },
    })
    const enrollment = await prisma.enrollment.create({
        data: {
            classroomId,
            studentId: user.id,
            username: data.username,
        },
        select: { username: true },
    })
    return {
        id: user.id,
        username: enrollment.username,
        name: user.name,
        role: user.role,
        createdAt: user.createdAt,
    }
}