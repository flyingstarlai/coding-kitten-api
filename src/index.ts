import { Hono } from 'hono'
import {loggerMiddleware} from "./middleware/logger";
import {authRoutes} from "./features/auth/route";
import { type JwtVariables} from 'hono/jwt'
import { cors } from 'hono/cors'
import {teacherApi} from "./features/teacher/api";
import {studentApi} from "./features/student/api";
import {jwt} from "hono/jwt";
import {meRoutes} from "./features/me/route";

type Variables = JwtVariables

const app = new Hono<{ Variables: Variables }>()

app.use('*', loggerMiddleware)

app.use('*', cors({
  // allow your Vite dev origin
  origin: ['http://localhost:5173', 'http://192.168.1.19:5173', 'http://localhost:5174', 'https://teach.juniorcoder.id', 'https://juniorcoder.id', 'https://learn.juniorcoder.id'],
  allowMethods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization'],
}))

app.use('/api/*',  jwt({
  secret: process.env.JWT_SECRET!,
}))

app.get('/', (c) => {
  return c.text('You shouldn\'t be here. The backend doesn\'t like visitors.')
})

app.route('/auth', authRoutes)



app.route('/api/me', meRoutes)
app.route('/api/teacher', teacherApi)
app.route('/api/student', studentApi)

export default app
