import {jwt, JwtVariables} from "hono/jwt";
import {Hono} from "hono";
import {authorize} from "../../middleware/authorize";
import {coursesRoute} from "./courses/route";
import {assignmentsRoutes} from "./assignments/route";

type Variables = JwtVariables

export const studentApi = new Hono<{ Variables: Variables}>()

studentApi.use('*', authorize(["ADMIN", "STUDENT"]))
studentApi.route('/courses', coursesRoute)
studentApi.route('/assignments', assignmentsRoutes)