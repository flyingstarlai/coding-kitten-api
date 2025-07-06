import {Role, User as PrismaUser } from "../../../generated/prisma"

export type UserResponse = {
    id: string
    email: string
    name: string
    role: Role
    classroomId: string | null
    createdAt: Date
}


export const toUserResponse = (user: PrismaUser): UserResponse => ({
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    classroomId: user.defaultClassroomId,
    createdAt: user.createdAt,
})
