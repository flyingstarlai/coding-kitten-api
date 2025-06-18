import { PrismaClient } from '../src/generated/prisma'
import { slugify } from '../src/utils/slugify'
import {logger} from "../src/middleware/logger";

const prisma = new PrismaClient()

async function main() {

    logger.info('Deleting existing assignments and courses...')
    await prisma.assignment.deleteMany()
    await prisma.course.deleteMany()

    // Seed courses
    const courseData = ['Sequence', 'Loops', 'Conditional Loops', 'Procedure'].map((title) => ({
        title,
        description: `Learn about ${title.toLowerCase()} for junior coders.`,
        slug: slugify(title),
    }))

    logger.info('Seeding courses...')
    for (const course of courseData) {
        await prisma.course.upsert({
            where: { slug: course.slug },
            update: {
                title: course.title,
                description: course.description,
            },
            create: {
                title: course.title,
                description: course.description,
                slug: course.slug,
            },
        })
        logger.info(`✅ Upserted course: ${course.title}`)
    }

    // Seed assignments for each course: Level 1 to Level 15
    const courses = await prisma.course.findMany()
    console.log('Seeding assignments...')

    for (const course of courses) {
        for (let level = 1; level <= 15; level++) {
            const title = `Level ${level}`
            const exists = await prisma.assignment.findFirst({
                where: { courseId: course.id, level },
            })
            if (!exists) {
                await prisma.assignment.create({
                    data: {
                        courseId: course.id,
                        level,
                        title,
                        description: null,
                    },
                })
                logger.info(`   ➕ Created assignment '${title}' for course '${course.slug}'`)
            }
        }
    }
}

main()
    .catch((e) => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
