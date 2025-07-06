import { Hono } from 'hono'
import { zValidator } from '@hono/zod-validator'
import {createEnrollmentSchema} from './schema'
import {createEnrollment, importEnrollmentsFromExcel, listEnrollmentsByClassroom} from './service'
import { authorize } from '../../../middleware/authorize'
import {ensureClassroomMember} from "../../../middleware/ensure-classroom-member";
import {EnrollmentImportResult, EnrollmentResponse} from "./model";
import {classroomIdParamSchema} from "../../../shared/schema";

export const enrollmentsRoutes = new Hono()


enrollmentsRoutes.get(
    '/:classroomId',
    zValidator('param', classroomIdParamSchema),
    authorize(['ADMIN', 'TEACHER']),
    ensureClassroomMember,
    async (c) => {
        const { classroomId } = c.req.valid('param')
        const enrollments: EnrollmentResponse[] = await listEnrollmentsByClassroom(classroomId)
        return c.json(enrollments)
    }
)


.post(
    '/:classroomId',
    zValidator('param', classroomIdParamSchema),
    zValidator('json', createEnrollmentSchema),
    authorize(['ADMIN','TEACHER']),
    ensureClassroomMember,
    async (c) => {
        const {  classroomId } = c.req.valid('param')
        const { username, password, name } = c.req.valid('json')
        try {
            const enrollment = await createEnrollment(classroomId, username, password, name)
            return c.json(enrollment, 201)
        } catch (e: any) {
            if (e.message === 'Classroom not found') {
                return c.json({ error: e.message }, 404)
            }
            console.error(e)
            return c.json({ error: 'Internal server error' }, 500)
        }
    }
)

.post(
    '/:classroomId/import',
    zValidator('param', classroomIdParamSchema),
    authorize(['ADMIN', 'TEACHER']),
    ensureClassroomMember,
    async (c) => {
        const {  classroomId } = c.req.valid('param')
        // 1) Use the Fetch API’s formData() to grab the file part
        const formData = await c.req.formData()
        const file = formData.get('file')
        if (!(file instanceof Blob)) {
            return c.json({ error: 'Missing file upload under field "file"' }, 400)
        }

        // 2) Read exactly the .xlsx bytes
        let buffer: ArrayBuffer
        try {
            buffer = await file.arrayBuffer()
        } catch {
            return c.json({ error: 'Failed to read uploaded file' }, 500)
        }

        console.log("Buffer", buffer)

        const results: EnrollmentImportResult[] = await importEnrollmentsFromExcel(
            classroomId,
            buffer
        )
        return c.json(results)
    }
)
