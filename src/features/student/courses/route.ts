import {Hono} from "hono";
import {zValidator} from "@hono/zod-validator";
import {AssignedCourseForStudent} from "./model";
import {enrollToAssignedCourse, listAssignedCoursesForStudent} from "./service";
import {classroomIdParamSchema} from "../../../shared/schema";
import {StudentChallengeScore} from "../../teacher/assignments/model";
import {getJwtUserId} from "../../../utils/get-jwt-payload";
import {enrolledCourseSchema} from "./schema";
import {ensureClassroomMember} from "../../../middleware/ensure-classroom-member";

export const coursesRoute = new Hono()
    .get(
        '/:classroomId',
        zValidator('param', classroomIdParamSchema),
        ensureClassroomMember,
        async (c) => {
            const { classroomId } = c.req.valid('param')
            const studentId = getJwtUserId(c)

            // Fetch for this student
            const courses: AssignedCourseForStudent[] =
                await listAssignedCoursesForStudent(classroomId, studentId)

            return c.json(courses)
        }
    )
    .post(
        '/:classroomId/enroll',
        zValidator('param', classroomIdParamSchema),
        zValidator('json', enrolledCourseSchema),
        ensureClassroomMember,
        async (c) => {
            const { classroomId } = c.req.valid('param')
            const { assignedCourseId } = c.req.valid('json')
            const studentId = getJwtUserId(c)

            try {
                const result: StudentChallengeScore[] =
                    await enrollToAssignedCourse(classroomId, assignedCourseId, studentId)
                return c.json(result, 201)
            } catch (e: any) {
                if (
                    e.message.includes('Assignment not found') ||
                    e.message.includes('Student not enrolled')
                ) {
                    return c.json({ error: e.message }, 404)
                }
                console.error(e)
                return c.json({ error: 'Internal server error' }, 500)
            }
        }
    )
