import {Context, Hono} from 'hono'
import { zValidator } from '@hono/zod-validator'
import {
    listCourses,
    createCourse,
    updateCourse,
    softDeleteCourse,
    restoreCourse,
} from './service'
import { idParamSchema, createCourseSchema, updateCourseSchema } from './schema'
import {authorize} from "../../../middleware/authorize";
import {logger} from "../../../middleware/logger";

export const coursesRoutes = new Hono()

coursesRoutes
    // List all courses
    .get('/', async (c: Context) => {
        logger.info(JSON.stringify(c.get("jwt")))
        const courses = await listCourses()
        return c.json(courses)
    })

    // Create a course
    .post(
        '/',
        authorize(["ADMIN"]),
        zValidator('json', createCourseSchema),
        async (c) => {
            const data = c.req.valid('json')
            const course = await createCourse(data)
            return c.json(course, 201)
        }
    )

    // Update a course
    .put(
        '/:id',
        authorize(["ADMIN"]),
        zValidator('param', idParamSchema),
        zValidator('json', updateCourseSchema),
        async (c) => {
            const { id } = c.req.valid('param')
            const data    = c.req.valid('json')
            const course  = await updateCourse(id, data)
            return c.json(course)
        }
    )

    // Soft delete a course
    .delete(
        '/:id',
        authorize(["ADMIN"]),
        zValidator('param', idParamSchema),
        async (c) => {
            const { id } = c.req.valid('param')
            const result = await softDeleteCourse(id)
            return c.json({ id: result.id })
        }
    )

    // Restore a soft-deleted course
    .patch(
        '/:id/restore',
        authorize(["ADMIN"]),
        zValidator('param', idParamSchema),
        async (c) => {
            const { id } = c.req.valid('param')
            const course = await restoreCourse(id)
            return c.json(course)
        }
    )