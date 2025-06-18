import { PrismaClient, Prisma as _Prisma } from "./generated/prisma"
import {logger} from "./middleware/logger";

export const Prisma = _Prisma;

export const prisma = new PrismaClient({
    log: [
        {
            emit: 'event',
            level: 'query',
        },
        {
            emit: 'event',
            level: 'error',
        },
        {
            emit: 'event',
            level: 'info',
        },
        {
            emit: 'event',
            level: 'warn',
        },
    ]
})


prisma.$on('query', (e) => {
    logger.info(e)
})

prisma.$on('error', (e) => {
    logger.error(e)
})

prisma.$on('info', (e) => {
    logger.info(e)
})

prisma.$on('warn', (e) => {
    logger.warn(e)
})