import {
    createClassroom, createClassroomSession,
    listClassrooms,
    softDeleteClassroom,
    updateClassroom
} from "./service";
import {Hono} from "hono";
import {ClassroomResponse} from "./model";
import {zValidator} from "@hono/zod-validator";
import {
    createClassroomSchema,
    updateClassroomSchema
} from "./schema";
import {authorize} from "../../../middleware/authorize";
import {classroomIdParamSchema} from "../../../shared/schema";

export const classroomsRoutes = new Hono()
    .get('/', authorize(["TEACHER"]), async (c) => {
        const { sub: teacherId } = c.get("jwtPayload") as { sub: string }
        const items: ClassroomResponse[] = await listClassrooms(teacherId)
        return c.json(items)
    })


    .post(
        '/',
        zValidator('json', createClassroomSchema),
        async (c) => {
            const data = c.req.valid('json')
            const { sub: teacherId } = c.get('jwtPayload') as { sub: string }
            const room = await createClassroom({ ...data, teacherId })
            return c.json(room, 201)
        }
    )

    .put(
        '/:classroomId',
        zValidator('param', classroomIdParamSchema),
        zValidator('json', updateClassroomSchema),
        async (c) => {
            const { classroomId } = c.req.valid('param')
            const data = c.req.valid('json')
            const room = await updateClassroom(classroomId, data)
            return c.json(room)
        }
    )

    .delete(
        '/:classroomId',
        zValidator('param', classroomIdParamSchema),
        async (c) => {
            const { classroomId } = c.req.valid('param')
            const result = await softDeleteClassroom(classroomId)
            return c.json({ id: result.id })
        }
    )
    .post(
        '/:classroomId/session',
        zValidator('param', classroomIdParamSchema),
        async (c) => {
            const { classroomId } = c.req.valid('param')
            const session = await createClassroomSession(classroomId, 60)
            return c.json({ code: session.code, expiresAt: session.expiresAt })
        }
    )
