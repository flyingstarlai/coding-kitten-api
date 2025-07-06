import {Hono} from "hono";
import {getUserById, updateUser} from "../teacher/users/service";
import {zValidator} from "@hono/zod-validator";
import {userIdParamSchema} from "../../shared/schema";
import {updateUserSchema} from "../teacher/users/schema";
import {getJwtUserId} from "../../utils/get-jwt-payload";

export const meRoutes = new Hono()
    .get(
        '/',
        async (c) => {
            console.log("API ME")
            const { sub: userId } = c.get("jwtPayload") as { sub: string }
            const user = await getUserById(userId)
            return user
                ? c.json(user)
                : c.json({ error: 'Not found' }, 404)
        }
    )
    .put(
        '/',
        zValidator('json', updateUserSchema),
        async (c) => {
            const data = c.req.valid('json')

            const userId = getJwtUserId(c)

            if (data.password) {
                data.password = await Bun.password.hash(data.password, "bcrypt")
            }

            const updated = await updateUser(userId, data)
            return c.json(updated)
        }
    )