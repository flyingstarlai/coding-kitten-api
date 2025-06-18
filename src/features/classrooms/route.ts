import {createClassroom, getClassroomById, listClassrooms, softDeleteClassroom, updateClassroom} from "./service";
import {Hono} from "hono";
import {ClassroomResponse} from "./model";
import {zValidator} from "@hono/zod-validator";
import {createClassroomSchema, idParamSchema, updateClassroomSchema} from "./schema";

export const classroomsRoutes = new Hono()

classroomsRoutes
    .get('/', async (c) => {
        const items: ClassroomResponse[] = await listClassrooms()
        return c.json(items)
    })

    .get(
        '/:id',
        zValidator('param', idParamSchema),
        async (c) => {
            const { id } = c.req.valid('param')
            const room = await getClassroomById(id)
            return room ? c.json(room) : c.json({ error: 'Not found' }, 404)
        }
    )

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
        '/:id',
        zValidator('param', idParamSchema),
        zValidator('json', updateClassroomSchema),
        async (c) => {
            const { id } = c.req.valid('param')
            const data = c.req.valid('json')
            const room = await updateClassroom(id, data)
            return c.json(room)
        }
    )

    .delete(
        '/:id',
        zValidator('param', idParamSchema),
        async (c) => {
            const { id } = c.req.valid('param')
            const result = await softDeleteClassroom(id)
            return c.json({ id: result.id })
        }
    )