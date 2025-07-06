import { PrismaClient } from "../../../generated/prisma"
import {toUserResponse, UserResponse} from "./model";
const prisma = new PrismaClient()

export const listUsers = (): Promise<UserResponse[]> =>
    prisma.user
        .findMany({ where: { deletedAt: null } })
        .then(users => users.map(toUserResponse))

export const getUserById = (id: string): Promise<UserResponse | null> =>
    prisma.user
        .findFirst({ where: { id, deletedAt: null } })
        .then(user => user ? toUserResponse(user) : null)

export const updateUser = (
    id: string,
    data: Partial<{ name: string; password: string; defaultClassroomId: string }>
): Promise<UserResponse> =>
    prisma.user
        .update({ where: { id }, data })
        .then(toUserResponse)


export const softDeleteUser = (id: string): Promise<{ id: string }> =>
    prisma.user.update({
        where: { id },
        data: { deletedAt: new Date() },
        select: { id: true },
    })

export const restoreUser = (id: string): Promise<UserResponse> =>
    prisma.user
        .update({ where: { id }, data: { deletedAt: null } })
        .then(toUserResponse)