import { Context, Next } from 'hono'
import winston from 'winston'

export const logger = winston.createLogger({
    level: 'debug',
    format: winston.format.combine(
        winston.format.timestamp(),
        // If message is an object, stringify it; also capture any other fields in meta
        winston.format.printf(({ timestamp, level, message, ...meta }) => {
            const msg =
                typeof message === 'object'
                    ? JSON.stringify(message, null, 2)
                    : message
            const metaKeys = Object.keys(meta)
            const metaStr = metaKeys.length
                ? ' ' + JSON.stringify(meta, null, 2)
                : ''
            return `${timestamp} ${level.toUpperCase()}: ${msg}${metaStr}`
        })
    ),
    transports: [
        new winston.transports.Console(),

    ],
})

export const loggerMiddleware = async (c: Context, next: Next) => {
    const start = Date.now()
    await next()
    const ms = Date.now() - start

    logger.info(`${c.req.method} ${c.req.url} — ${ms}ms`)
}