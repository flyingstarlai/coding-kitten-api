import {prisma } from "../../db";
import {Role,  User as PrismaUser} from '../../generated/prisma'
import {sign} from "hono/jwt";
import {JWTPayload} from "hono/dist/types/utils/jwt/types";
import {RegisterUser} from "./model";
import {toUserResponse} from "../users/model";

export const createUser = (data: RegisterUser) =>
    prisma.user.create({ data }).then(toUserResponse)

export const findUserByEmail = (email: string) =>
    prisma.user.findUnique({ where: { email } })

export const createToken = (payload: JWTPayload) =>  sign(payload, process.env.JWT_SECRET!)

export const authenticateTeacher = async (email: string, password: string) => {
    const user = await prisma.user.findUnique({
        where: { email },
    })
    if (!user || user.role !== Role.TEACHER) return null
    const valid = await Bun.password.verify(password, user.password, "bcrypt")
    return valid ? user : null
}

export const authenticateStudent = async (
    code: string,
    username: string,
    password: string
) => {
    const classroom = await prisma.classroom.findUnique({ where: { code } })
    if(!classroom) return null
    const classroomId = classroom.id
    const enrollment = await prisma.enrollment.findFirst({
        where: { classroomId, username, deletedAt: null },
        include: { student: true },
    })
    if (!enrollment) return null
    const user = enrollment.student as PrismaUser
    const valid = await Bun.password.verify(password, user.password, "bcrypt")
    return valid ? { user, classroomId } : null
}