import {Hono} from "hono";
import {zValidator} from "@hono/zod-validator";
import {
    assignCourseToClassroom,
    listAssignedCoursesByClassroom,
    listStudentsWithScoresBySlug, setAssignedCourseWeek
} from "./service";
import {ensureClassroomMember} from "../../../middleware/ensure-classroom-member";
import {assignCourseSchema} from "../classrooms/schema";
import {AssignedCourseResponse, StudentScoresResponse} from "./model";
import {classroomAndCourseParamSchema, classroomIdParamSchema } from "../../../shared/schema";
import {enableBodySchema} from "./schema";

export const assignmentsRoutes = new Hono()
    .get(
    '/:classroomId',
    zValidator('param', classroomIdParamSchema),
    ensureClassroomMember,
    async (c) => {
        const { classroomId } = c.req.valid('param')
        const list =
            await listAssignedCoursesByClassroom(classroomId)
        return c.json(list)
    }
)
    .post(
        '/:classroomId',
        zValidator('param', classroomIdParamSchema),
        zValidator(
            'json',
            assignCourseSchema,
        ),
        ensureClassroomMember,
        async (c) => {
            const { classroomId } = c.req.valid('param')
            const { courseIds } = c.req.valid('json')

            try {
                // assign each course in parallel
                const assigned = await Promise.all(
                    courseIds.map((courseId) =>
                        assignCourseToClassroom(classroomId, courseId)
                    )
                )
                return c.json(assigned, 201)
            } catch (e: any) {
                if (
                    e.message === 'Classroom not found' ||
                    e.message === 'Course not found'
                ) {
                    return c.json({ error: e.message }, 404)
                }
                console.error(e)
                return c.json({ error: 'Internal server error' }, 500)
            }
        }
    )


    .get(
        '/:classroomId/:courseSlug',
        zValidator('param', classroomAndCourseParamSchema),
        async (c) => {
            const { classroomId, courseSlug } = c.req.valid('param')
            try {
                const list: StudentScoresResponse[] =
                    await listStudentsWithScoresBySlug(classroomId, courseSlug)
                return c.json(list)
            } catch (e: any) {
                if (e.message === 'Assignment not found for classroom/course') {
                    return c.json({ error: e.message }, 404)
                }
                console.error(e)
                return c.json({ error: 'Internal server error' }, 500)
            }
        }
    )
    .put(
        '/:classroomId/:courseSlug/enable',
        zValidator('param', classroomAndCourseParamSchema),
        zValidator("json", enableBodySchema),
        async (c) => {
            const { classroomId, courseSlug } = c.req.valid("param")
            const { week }                    = c.req.valid("json")

            try {
                const update: AssignedCourseResponse =
                    await setAssignedCourseWeek(classroomId, courseSlug, week)
                return c.json(update)
            } catch (e: any) {
                if (e.message === 'Assignment not found for classroom/course') {
                    return c.json({ error: e.message }, 404)
                }
                console.error(e)
                return c.json({ error: 'Internal server error' }, 500)
            }


        }
    )
