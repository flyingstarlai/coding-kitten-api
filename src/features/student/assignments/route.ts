import {Hono} from "hono";
import {zValidator} from "@hono/zod-validator";
import {ensureClassroomMember} from "../../../middleware/ensure-classroom-member";
import {beginBodySchema, completeBodySchema, paramClassroomCourseSchema} from "./schema";
import {BeginResponse} from "./model";
import {beginChallenge, completeChallenge, listChallengesForStudent} from "./service";
import {getJwtUserId} from "../../../utils/get-jwt-payload";

export const assignmentsRoutes = new Hono()
    .get(
        '/:classroomId/:courseSlug',
        zValidator('param', paramClassroomCourseSchema),
        async (c) => {
            const { classroomId, courseSlug } = c.req.valid('param')
            const studentId = getJwtUserId(c)
             try {
                const scores = await listChallengesForStudent(
                    classroomId,
                    courseSlug,
                    studentId
                )
                return c.json(scores)
            } catch (e: any) {
                console.error(e)
                return c.json({ error: e.message }, 404)
            }
        }
    )
.post(
    "/:classroomId/:courseSlug/begin",
    zValidator('param', paramClassroomCourseSchema),
    zValidator('json', beginBodySchema),
    ensureClassroomMember,
    async (c) => {
        const { classroomId, courseSlug } = c.req.valid('param')
        const { challengeId } = c.req.valid('json')

        const studentId = getJwtUserId(c)


        try {
            const result: BeginResponse = await beginChallenge(
                classroomId,
                courseSlug,
                challengeId,
                studentId
            )
            return c.json(result)
        } catch (e: any) {
            console.error(e)
            return c.json({ error: e.message },  e.message.includes('not') ? 404 : 400)
        }
    }
)
    .post(
        '/:classroomId/:courseSlug/complete',
        zValidator('param', paramClassroomCourseSchema),
        zValidator('json', completeBodySchema),
        async (c) => {
            const { classroomId, courseSlug } = c.req.valid('param')
            const { challengeId, stars, token, timestamp } = c.req.valid('json')
            const studentId = getJwtUserId(c)
            try {
                const result = await completeChallenge(
                    classroomId,
                    courseSlug,
                    challengeId,
                    studentId,
                    stars,
                    token,
                    timestamp
                )
                return c.json(result)
            } catch (e: any) {
                console.error(e)
                const status = e.message.includes('Invalid') || e.message.includes('expired') ? 400 : 404
                return c.json({ error: e.message }, status)
            }
        }
    )
