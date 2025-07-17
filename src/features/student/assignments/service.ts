import { createHmac, timingSafeEqual } from 'crypto'
import { prisma } from '../../../db'
import {BeginResponse, CompletionResponse, StudentChallengeResponse} from './model'

const SECRET = process.env.LEVEL_SECRET!
if (!SECRET) throw new Error('Missing LEVEL_SECRET')

/**
 * Helper: Verifies the requested level is unlocked for the student.
 */
async function ensureLevelUnlocked(
    classroomId: string,
    assignedCourseId: string,
    challengeId: string,
    studentId: string
): Promise<void> {
    const assignment = await prisma.assignedCourse.findUnique({
        where: { id: assignedCourseId },
        select: { classroomId: true, courseId: true }
    })
    if (!assignment || assignment.classroomId !== classroomId) {
        throw new Error('Assignment not found for this classroom')
    }
    const challenge = await prisma.challenge.findUnique({
        where: { id: challengeId },
        select: { courseId: true, level: true }
    })
    if (!challenge || challenge.courseId !== assignment.courseId) {
        throw new Error('Challenge not in this course')
    }
    const { level } = challenge
    const completed = await prisma.score.findMany({
        where: { assignedCourseId, studentId, stars: { gt: 0 }, deletedAt: null },
        select: { challenge: { select: { level: true } } }
    })
    const completedLevels = new Set(completed.map(c => c.challenge.level))
    if (level > 1 && !completedLevels.has(level - 1)) {
        throw new Error(`Level ${level} is locked until you complete Level ${level - 1}`)
    }
}

/**
 * Phase 1: Issue HMAC token + timestamp (lookup by courseSlug)
 */
export async function beginChallenge(
    classroomId: string,
    courseSlug: string,
    challengeId: string,
    studentId: string
): Promise<BeginResponse> {
    // find assignment by slug
    const assignment = await prisma.assignedCourse.findFirst({
        where: {
            classroomId,
            isAssigned: true,
            deletedAt: null,
            course: { slug: courseSlug }
        },
        select: { id: true }
    })
    if (!assignment) {
        throw new Error('Assignment not found for classroom/course')
    }
    const assignedCourseId = assignment.id
    // guard lock
    await ensureLevelUnlocked(classroomId, assignedCourseId, challengeId, studentId)
    const timestamp = Date.now().toString()
    const data = `${assignedCourseId}|${challengeId}|${studentId}|${timestamp}`
    const token = createHmac('sha256', SECRET).update(data).digest('hex')
    return { token, timestamp }
}

/**
 * Phase 2: Verify HMAC and upsert stars (lookup by courseSlug)
 */
export async function completeChallenge(
    classroomId: string,
    courseSlug: string,
    challengeId: string,
    studentId: string,
    stars: number,
    token: string,
    timestamp: string
): Promise<CompletionResponse> {
    // find assignment by slug
    const assignment = await prisma.assignedCourse.findFirst({
        where: {
            classroomId,
            isAssigned: true,
            deletedAt: null,
            course: { slug: courseSlug }
        },
        select: { id: true }
    })
    if (!assignment) {
        throw new Error('Assignment not found for classroom/course')
    }
    const assignedCourseId = assignment.id
    // guard lock
    await ensureLevelUnlocked(classroomId, assignedCourseId, challengeId, studentId)
    // validate stars
    if (!Number.isInteger(stars) || stars < 0 || stars > 3) {
        throw new Error('Stars must be between 0 and 3')
    }
    const data = `${assignedCourseId}|${challengeId}|${studentId}|${timestamp}`
    const expected = createHmac('sha256', SECRET).update(data).digest()
    const actual = Buffer.from(token, 'hex')
    if (expected.length !== actual.length || !timingSafeEqual(expected, actual)) {
        throw new Error('Invalid or expired token')
    }
    if (Date.now() - Number(timestamp) > 60 * 60 * 1000) {
        throw new Error('Token expired')
    }
    await prisma.score.upsert({
        where: { studentId_assignedCourseId_challengeId: { studentId, assignedCourseId, challengeId } },
        create: { studentId, assignedCourseId, challengeId, stars },
        update: { stars, updatedAt: new Date() }
    })
    return { stars, timestamp, signature: token }
}

/**
 * List all challenges for a student, with stars & lock status (lookup by courseSlug)
 */
export async function listChallengesForStudent(
    classroomId: string,
    courseSlug: string,
    studentId: string
): Promise<StudentChallengeResponse[]> {
    const assignment = await prisma.assignedCourse.findFirst({
        where: { classroomId, isAssigned: true, deletedAt: null, course: { slug: courseSlug } },
        select: { id: true, courseId: true, availableWeek: true }
    })
    if (!assignment) {
        throw new Error('Assignment not found for classroom/course')
    }
    const { id: assignedCourseId, courseId } = assignment
    const challenges = await prisma.challenge.findMany({
        where: { courseId,  week: { lte: assignment.availableWeek }, deletedAt: null },
        orderBy: { level: 'asc' },
        select: { id: true, level: true, title: true, week: true }
    })
    const scores = await prisma.score.findMany({
        where: { assignedCourseId, studentId, deletedAt: null },
        select: { challengeId: true, stars: true }
    })
    const starsMap = new Map(scores.map(s => [s.challengeId, s.stars]))
    const completedLevels = new Set(
        challenges.filter(ch => starsMap.get(ch.id)! > 0).map(ch => ch.level)
    )



    return challenges.map(ch => {
        const unlocked = ch.level === 1 || completedLevels.has(ch.level - 1)
        return {
            id: ch.id,
            week: ch.week,
            level: ch.level,
            title: ch.title,
            stars: starsMap.get(ch.id) ?? 0,
            isLocked: !unlocked,
        }
    })
}