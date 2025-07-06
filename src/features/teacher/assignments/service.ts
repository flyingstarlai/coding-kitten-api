import {
    AssignedCourseResponse,
    StudentChallengeScore,
    StudentScoresResponse,
    toAssignedCourseResponse
} from "./model";
import {prisma} from "../../../db";

/**
 * List all courses assigned to a classroom
 */
export const listAssignedCoursesByClassroom = async (
    classroomId: string
): Promise<AssignedCourseResponse[]> => {
    const rows = await prisma.assignedCourse.findMany({
        where: { classroomId, isAssigned: true, deletedAt: null },
        include: {
            course: {
                select: { id: true, title: true, slug: true, description: true }
            }
        },
        orderBy: { addedAt: 'asc' }
    })

    return rows.map((ac) => ({
        id: ac.id,
        classroomId: ac.classroomId,
        courseId: ac.courseId,
        isAssigned: ac.isAssigned,
        addedAt: ac.addedAt,
        course: {
            id: ac.course.id,
            title: ac.course.title,
            slug: ac.course.slug,
            description: ac.course.description,
        }
    }))
}

export const assignCourseToClassroom = async (
    classroomId: string,
    courseId: string
): Promise<AssignedCourseResponse> => {
    // Verify classroom exists
    const classroom = await prisma.classroom.findUnique({
        where: { id: classroomId },
        select: { id: true },
    })
    if (!classroom) {
        throw new Error('Classroom not found')
    }

    // Verify course exists
    const course = await prisma.course.findUnique({
        where: { id: courseId },
        select: { id: true },
    })
    if (!course) {
        throw new Error('Course not found')
    }

    await prisma.assignedCourse.updateMany({
        where: { classroomId },
        data: { isAssigned: false },
    })

    // Look for an existing record for this pair
    const existing = await prisma.assignedCourse.findUnique({
        where: { classroomId_courseId: { classroomId, courseId } },
        include: { course: true },
    })

    if (existing) {
        // Re-activate it
        const updated = await prisma.assignedCourse.update({
            where: { id: existing.id },
            data: { isAssigned: true },
            include: { course: true },
        })
        return toAssignedCourseResponse(updated)
    }

    // Otherwise, create a fresh assignment
    const created = await prisma.assignedCourse.create({
        data: { classroomId, courseId, isAssigned: true },
        include: { course: true },
    })

    return toAssignedCourseResponse(created)
}


export const listStudentsWithScoresBySlug = async (
    classroomId: string,
    courseSlug: string
): Promise<StudentScoresResponse[]> => {
    // 1) Find the assignedCourse by classroom + slug
    const assignment = await prisma.assignedCourse.findFirst({
        where: {
            classroomId,
            isAssigned: true,
            deletedAt: null,
            course: { slug: courseSlug },
        },
        select: { id: true, courseId: true },
    })
    if (!assignment) {
        throw new Error('Assignment not found for classroom/course')
    }
    const { id: assignedCourseId, courseId } = assignment


    // 2) Load all classroom enrollments
    const enrolls = await prisma.enrollment.findMany({
        where: { classroomId, deletedAt: null },
        select: {
            studentId: true,
            username: true,
            student: { select: { name: true } },
        },
    })

    // 3) Load challenge metadata for this course
    const challenges = await prisma.challenge.findMany({
        where: { courseId, deletedAt: null },
        select: { id: true, level: true, title: true },
        orderBy: { level: 'asc' },
    })
    const challengeMap = new Map(challenges.map(c => [c.id, c]))

    // 4) Load all scores for this assignment
    const scores = await prisma.score.findMany({
        where: {
            assignedCourseId,
            challengeId: { in: challenges.map(c => c.id) },
            deletedAt: null,
        },
        select: {
            studentId: true,
            challengeId: true,
            stars: true,
            updatedAt: true,
        },
    })
    const scoresByStudent = new Map<string, StudentChallengeScore[]>()
    for (const s of scores) {
        const meta = challengeMap.get(s.challengeId)!
        const arr = scoresByStudent.get(s.studentId) || []
        arr.push({
            challengeId: s.challengeId,
            level: meta.level,
            title: meta.title,
            stars: s.stars,
            updatedAt: s.updatedAt,
        })
        scoresByStudent.set(s.studentId, arr)
    }

    // 5) Only return those students who have at least one score
    return enrolls
        .filter(en => scoresByStudent.has(en.studentId))
        .map(en => ({
            studentId: en.studentId,
            username: en.username,
            name: en.student.name,
            scores: scoresByStudent.get(en.studentId)!,
        }))
}