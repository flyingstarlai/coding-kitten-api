import { PrismaClient, Role } from '../src/generated/prisma'
import { slugify } from '../src/utils/slugify'
import { logger } from '../src/middleware/logger'
import fs from 'fs/promises'
import path from 'path'

const prisma = new PrismaClient()


async function loadLevelData(courseSlug: string, level: number) {
    const filePath = path.join(__dirname,'levels', courseSlug, `level${level}.json`)
    const raw = await fs.readFile(filePath, 'utf8')
    return JSON.parse(raw)
}

async function main() {
    logger.info('❌ Deleting existing data...')
    // Delete in order of dependencies
    await prisma.score.deleteMany()
    await prisma.assignedCourse.deleteMany()
    await prisma.challenge.deleteMany()
    await prisma.enrollment.deleteMany()
    await prisma.classroom.deleteMany()
    await prisma.course.deleteMany()
    await prisma.user.deleteMany()

    // 1) Seed admin user
    const adminPassword = await Bun.password.hash('AdminPass123', 'bcrypt')
    const admin = await prisma.user.create({
        data: {
            email: 'admin@test.com',
            password: adminPassword,
            name: 'Site Admin',
            role: Role.ADMIN,
        },
    })
    logger.info(`✅ Admin seeded: ${admin.email}`)

    // 2) Seed teacher user
    const teacherPassword = await Bun.password.hash('TeacherPass123', 'bcrypt')
    const teacher = await prisma.user.create({
        data: {
            email: 'teacher@test.com',
            password: teacherPassword,
            name: 'Demo Teacher',
            role: Role.TEACHER,
        },
    })
    logger.info(`✅ Teacher seeded: ${teacher.email}`)

    // 3) Seed courses
    const courseTitles = ['Sequence', 'Loops', 'Conditional Loops', 'Procedure']
    const courses: { id: string; slug: string }[] = []
    for (const title of courseTitles) {
        const slug = slugify(title)
        const course = await prisma.course.create({
            data: {
                title,
                slug,
                description: `Learn about ${title.toLowerCase()} for junior coders.`,
                enable: title === "Sequence"
            },
        })
        courses.push({ id: course.id, slug })
        logger.info(`✅ Course created: ${title}`)
    }

    // 4) Seed challenges with levelData
    logger.info('📝 Seeding challenges (1-15) with levelData for each course...')
    for (const { id: courseId, slug } of courses) {

        for (let level = 1; level <= 15; level++) {
            const levelData = await loadLevelData(slug, level)
            await prisma.challenge.create({
                data: {
                    courseId,
                    level,
                    title: `Level ${level}`,
                    description: null,
                    levelData,
                    createdAt: new Date(),
                },
            })
        }
        logger.info(`   ✅ Challenges seeded for course '${slug}'`)
    }

    logger.info('🎉 Database seeding complete')
}

main()
    .catch((e) => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })