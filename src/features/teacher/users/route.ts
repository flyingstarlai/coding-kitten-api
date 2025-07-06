import { Hono } from 'hono'
import { zValidator } from '@hono/zod-validator'
import {listUsers, getUserById, updateUser, softDeleteUser, restoreUser} from './service'
import {  updateUserSchema } from './schema'
import {userIdParamSchema} from "../../../shared/schema";

export const usersRoutes = new Hono()

usersRoutes
    // GET /api/users
    .get('/', async (c) => {
        const users = await listUsers()
        return c.json(users)
    })

    // GET /api/users/:id
    .get(
        '/:userId',
        zValidator('param', userIdParamSchema),
        async (c) => {
            const { userId } = c.req.valid('param')
            const user = await getUserById(userId)
            return user
                ? c.json(user)
                : c.json({ error: 'Not found' }, 404)
        }
    )

    // PUT /api/users/:id
    .put(
        '/:userId',
        zValidator('param', userIdParamSchema),
        zValidator('json', updateUserSchema),
        async (c) => {
            const { userId } = c.req.valid('param')
            const data = c.req.valid('json')

            if (data.password) {
                data.password = await Bun.password.hash(data.password,"bcrypt")
            }

            const updated = await updateUser(userId, data)
            return c.json(updated)
        }
    )

    // DELETE /api/users/:id
    .delete(
        '/:userId',
        zValidator('param', userIdParamSchema),
        async (c) => {
            const { userId } = c.req.valid('param')
            const deleted = await softDeleteUser(userId)
            return c.json({ id: deleted.id }, 200)
        }
    )

    // RESTORE a soft-deleted user
    .patch(
        '/:userId/restore',
        zValidator('param', userIdParamSchema),
        async (c) => {
            const { userId } = c.req.valid('param')
            const restored = await restoreUser(userId)
            return c.json(restored)
        }
    )
