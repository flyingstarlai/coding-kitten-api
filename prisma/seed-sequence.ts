import { PrismaClient } from '../src/generated/prisma'
import { logger } from '../src/middleware/logger'
import path from "path";
import fs from "fs/promises";


const prisma = new PrismaClient()

async function loadLevelData(courseSlug: string, level: number) {
    const filePath = path.join(__dirname,'levels', courseSlug, `level${level}.json`)
    const raw = await fs.readFile(filePath, 'utf8')
    return JSON.parse(raw)
}

async function main() {
    // 1) Fetch the existing 'sequence' course
    const course = await prisma.course.findUnique({
        where: { slug: 'sequence' },
        select: { id: true, slug: true },
    })
    if (!course) {
        logger.error(`Course with slug "sequence" not found—abort.`)
        process.exit(1)
    }

    logger.info(`📝 Upserting challenges 1–48 for course '${course.slug}' (id=${course.id})…`)
    for (let level = 1; level <= 48; level++) {
        const levelData = await loadLevelData(course.slug, level)
        await prisma.challenge.upsert({
            where: {
                courseId_level: { courseId: course.id, level },
            },
            create: {
                courseId: course.id,
                level,
                title: `Level ${level}`,
                description: null,
                levelData,
                createdAt: new Date(),
            },
            update: {
                title: `Level ${level}`,    // in case you tweaked titles
                levelData,                   // overwrite with any new JSON
            },
        })
    }
    logger.info(`✅ All done—levels 1–48 upserted for 'sequence'.`)
}

main()
    .catch((e) => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })