import * as XLSX from 'xlsx'
 import { Role } from "../../../generated/prisma"

import {prisma} from "../../../db";
import generateFakeEmail from "../../../utils/generate-fake-email";
import {EnrollmentImportResult, EnrollmentResponse} from "./model";

export const listEnrollmentsByClassroom = async (
    classroomId: string
): Promise<EnrollmentResponse[]> => {
    const rows = await prisma.enrollment.findMany({
        where: { classroomId, deletedAt: null },
        select: {
            id: true,
            classroomId: true,
            studentId: true,
            username: true,
            invitedAt: true,
            joinedAt: true,
            student: {
                select: { email: true, name: true },
            }
        }
    })

    return rows.map((e) => ({
        id: e.id,
        classroomId: e.classroomId,
        studentId: e.studentId,
        username: e.username,
        email: e.student.email,
        name: e.student.name,
        invitedAt: e.invitedAt,
        joinedAt: e.joinedAt
    }))
}

export const createEnrollment = async (
    classroomId: string,
    username: string,
    password: string,
    name: string
): Promise<EnrollmentResponse> => {
    // Ensure classroom exists
    const classroom = await prisma.classroom.findUnique({
        where: { id: classroomId, deletedAt: null },
        select: { id: true }
    })
    if (!classroom) throw new Error('Classroom not found')

    // Generate a dummy email for the student
    const email = generateFakeEmail(classroomId, username)

    // Hash password and create user
    const hashed = await Bun.password.hash(password, "bcrypt")
    const user = await prisma.user.create({
        data: {
            email,
            password: hashed,
            name,
            role: Role.STUDENT,
            defaultClassroomId: classroomId,
        }
    })

    // Create enrollment with username
    const enrollment = await prisma.enrollment.create({
        data: {
            classroomId,
            studentId: user.id,
            username
        }
    })

    return {
        id: enrollment.id,
        classroomId,
        studentId: user.id,
        username: enrollment.username,
        email: user.email,
        name: user.name,
        invitedAt: enrollment.invitedAt,
        joinedAt: enrollment.joinedAt ?? null
    }

}


export async function importEnrollmentsFromExcel(
    classroomId: string,
    fileBuffer: ArrayBuffer
): Promise<EnrollmentImportResult[]> {
    // 1) Read workbook & first sheet
    const wb = XLSX.read(new Uint8Array(fileBuffer), { type: 'array' })
    const sheet = wb.Sheets[wb.SheetNames[0]]

    console.log(sheet)

    // 2) Parse rows
    type Row = { username: string; password: string; name: string }
    const rows: Row[] = XLSX.utils.sheet_to_json<Row>(sheet)


    const results: EnrollmentImportResult[] = []
    for (const row of rows) {
        const username = row.username as string | undefined
        const password = row.password as string | undefined


        if (!username) {
            results.push({
                username: username ?? '<missing>',
                status: 'error',
                message: 'Missing or invalid "username" column'
            })
            continue
        }
        if (!password) {
            results.push({
                username,
                status: 'error',
                message: 'Missing or invalid "password" column'
            })
            continue
        }

        try {
            // createEnrollment is your existing single‐row service
            const enrollment = await createEnrollment(
                classroomId,
                row.username,
                row.password,
                row.name
            )
            results.push({ username: row.username, status: 'created', enrollment })
        } catch (e: any) {
            results.push({
                username: row.username,
                status: 'error',
                message: e.message,
            })
        }
    }

    return results
}


export async function getEnrolledStudents(room: string) {
   return prisma.enrollment.findMany({
        where: {
            classroom: { room },
            deletedAt: null
        },
        include: { student: { select: { id: true, name: true } } },
        orderBy: { username: "asc" }
    })

}

export async function getEnrolledStudentByUsername(room: string, username: string) {
    return prisma.enrollment.findFirst({
        where: {
            classroom: { room },
            username,
            deletedAt: null
        },
        include: { student: { select: { id: true, name: true, role: true } } },
        orderBy: { username: "asc" }
    })

}