import {ClassroomResponse, ClassroomSessionResponse, toClassroomResponse} from "./model";
import {prisma} from "../../../db";
import {updateUser} from "../users/service";
import { randomUUID } from "crypto"
import {findUserById} from "../../auth/service";
import generateFakeEmail from "../../../utils/generate-fake-email";
import { Role } from "../../../generated/prisma"




const generateUniqueCode = async (): Promise<string> => {
    while (true) {
        const room = String(Math.floor(Math.random() * 1_000_000)).padStart(6, '0')
        const exists = await prisma.classroom.findUnique({ where: { room } })
        if (!exists) return room
    }
}

export const listClassrooms = (teacherId: string): Promise<ClassroomResponse[]> =>
    prisma.classroom
        .findMany({ where: { teacherId, deletedAt: null } })
        .then(cs => cs.map(toClassroomResponse))


export const createClassroom = async (
    data: { name: string; maxStudents?: number; teacherId: string }
): Promise<ClassroomResponse> => {
    const room = await generateUniqueCode()
    const classroom = await prisma.classroom.create({
        data: { ...data, room },
    })

    await updateUser(data.teacherId, { defaultClassroomId: classroom.id})

    const user = await findUserById(data.teacherId)
    if(user) {
        const username = "teacher"
        const email = generateFakeEmail(classroom.id, username)
        const teacher = await prisma.user.create({
            data: {
                email,
                password: user.password,
                name: user.name,
                role: Role.STUDENT,
                defaultClassroomId: classroom.id,
            }
        })
        await prisma.enrollment.create({
            data: {
                classroomId: classroom.id,
                studentId: teacher.id,
                username
            }
        })
     }


    return toClassroomResponse(classroom)
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


export async function createClassroomSession(
    classroomId: string,
    ttlMinutes = 60
): Promise<ClassroomSessionResponse> {
    const code = randomUUID().slice(0, 6)  // e.g. "a1b2c3d4"
    const now  = new Date()
    const expiresAt = new Date(now.valueOf() + ttlMinutes * 60000)

    // delete any existing non-expired sessions
    await prisma.classroomSession.deleteMany({
        where: { classroomId, expiresAt: { gt: now } }
    })

    const session =  await prisma.classroomSession.create({
        data: {classroomId, code, expiresAt}
    })

    return {
        id: session.classroomId,
        code: session.code,
        expiresAt: session.expiresAt
    }
}


export async function verifyClassroomSession(
    code: string
) {

     const session = await prisma.classroomSession.findUnique({
        where: {
            code,
            expiresAt: { gt: new Date() }
        }
    })
    return session?.classroomId
}