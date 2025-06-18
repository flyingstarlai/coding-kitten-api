import {Role, User as PrismaUser } from "../../generated/prisma"

export type UserResponse = {
    id: string
    email: string
    name: string | null
    role: Role
    createdAt: Date
}


export const toUserResponse = (user: PrismaUser): UserResponse => ({
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    createdAt: user.createdAt,
})
