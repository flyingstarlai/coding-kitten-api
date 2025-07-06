import {
    ClassroomResponse,
    toClassroomResponse
} from "./model";
import {prisma} from "../../../db";
import {updateUser} from "../users/service";


const generateUniqueCode = async (): Promise<string> => {
    while (true) {
        const code = String(Math.floor(Math.random() * 1_000_000)).padStart(6, '0')
        const exists = await prisma.classroom.findUnique({ where: { code } })
        if (!exists) return code
    }
}

export const listClassrooms = (teacherId: string): Promise<ClassroomResponse[]> =>
    prisma.classroom
        .findMany({ where: { teacherId, deletedAt: null } })
        .then(cs => cs.map(toClassroomResponse))


export const createClassroom = async (
    data: { name: string; maxStudents?: number; teacherId: string }
): Promise<ClassroomResponse> => {
    const code = await generateUniqueCode()
    const room = await prisma.classroom.create({
        data: { ...data, code },
    })

    await updateUser(data.teacherId, { defaultClassroomId: room.id})
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


