import { Hono } from 'hono'
import { zValidator } from '@hono/zod-validator'
import {listUsers, getUserById, updateUser, softDeleteUser, restoreUser} from './service'
import { idParamSchema, updateUserSchema } from './schema'
import {authorize} from "../../middleware/authorize";

export const usersRoutes = new Hono()

usersRoutes
    // GET /api/users
    .get('/', async (c) => {
        const users = await listUsers()
        return c.json(users)
    })

    // GET /api/users/:id
    .get(
        '/:id',
        zValidator('param', idParamSchema),
        async (c) => {
            const { id } = c.req.valid('param')
            const user = await getUserById(id)
            return user
                ? c.json(user)
                : c.json({ error: 'Not found' }, 404)
        }
    )

    // PUT /api/users/:id
    .put(
        '/:id',
        authorize(["ADMIN"]),
        zValidator('param', idParamSchema),
        zValidator('json', updateUserSchema),
        async (c) => {
            const { id } = c.req.valid('param')
            const data = c.req.valid('json')

            if (data.password) {
                data.password = await Bun.password.hash(data.password)
            }

            const updated = await updateUser(id, data)
            return c.json(updated)
        }
    )

    // DELETE /api/users/:id
    .delete(
        '/:id',
        authorize(["ADMIN"]),
        zValidator('param', idParamSchema),
        async (c) => {
            const { id } = c.req.valid('param')
            const deleted = await softDeleteUser(id)
            return c.json({ id: deleted.id }, 200)
        }
    )

    // RESTORE a soft-deleted user
    .patch(
        '/:id/restore',
        authorize(["ADMIN"]),
        zValidator('param', idParamSchema),
        async (c) => {
            const { id } = c.req.valid('param')
            const restored = await restoreUser(id)
            return c.json(restored)
        }
    )
