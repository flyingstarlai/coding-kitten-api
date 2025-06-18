import { Hono } from 'hono'
import {loggerMiddleware} from "./middleware/logger";
import {authRoutes} from "./features/auth/route";
import {usersRoutes} from "./features/users/route";
import {jwt, type JwtVariables} from 'hono/jwt'
import {coursesRoutes} from "./features/courses/route";
import {classroomsRoutes} from "./features/classrooms/route";

type Variables = JwtVariables

const app = new Hono<{ Variables: Variables }>()

app.use('*', loggerMiddleware)

app.get('/', (c) => {
  return c.text('Hello Hono!')
})

app.route('/auth', authRoutes)


app.use('/api/*',  jwt({
  secret: process.env.JWT_SECRET!,
}))
app.get('/api/protected', (c) => {
  return c.text('This is a protected')
})
app.route('/api/users', usersRoutes)
app.route('/api/courses', coursesRoutes)
app.route('/api/room', classroomsRoutes)

export default app
