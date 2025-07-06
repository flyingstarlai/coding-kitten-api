import {Hono} from "hono";
import type {JwtVariables} from "hono/jwt";
import {jwt} from "hono/jwt";
import {usersRoutes} from "./users/route";
import {coursesRoutes} from "./courses/route";
import {classroomsRoutes} from "./classrooms/route";
import {assignmentsRoutes} from "./assignments/route";
import {enrollmentsRoutes} from "./enrollments/route";
import {authorize} from "../../middleware/authorize";

type Variables = JwtVariables

export const teacherApi = new Hono<{ Variables: Variables}>()

teacherApi.use('*', authorize(["ADMIN", "TEACHER"]))
teacherApi.route('/users', usersRoutes)
teacherApi.route('/courses', coursesRoutes)
teacherApi.route('/classrooms', classroomsRoutes)
teacherApi.route('/assignments', assignmentsRoutes)
teacherApi.route('/enrollments', enrollmentsRoutes)