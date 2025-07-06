import {UserResponse} from "../teacher/users/model";
import {User as PrismaUser } from "../../generated/prisma"

export type RegisterUser = {
    email: string,
    password: string,
    name: string,
}

export type AuthResponse = UserResponse & {
    token: string
}

export const toAuthResponse = (user: PrismaUser, token: string): AuthResponse => ({
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    createdAt: user.createdAt,
    classroomId: user.defaultClassroomId,
    token: token
})


