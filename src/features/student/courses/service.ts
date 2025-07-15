 import {prisma} from "../../../db";
 import {AssignedCourseForStudent} from "./model";
 import {StudentChallengeScore} from "../../teacher/assignments/model";

export const listAssignedCoursesForStudent = async (
    classroomId: string,
    studentId: string
): Promise<AssignedCourseForStudent[]> => {
    const assignments = await prisma.assignedCourse.findMany({
        where: { classroomId, isAssigned: true, deletedAt: null },
        include: {
            course: { select: { id: true, title: true, slug: true, description: true } }
        },
        orderBy: [
            { course: { order: 'asc' } },
            { addedAt: 'asc' },
        ],
    })

    const assignedIds = assignments.map(a => a.id)
    const enrolled = await prisma.score.findMany({
        where: {
            assignedCourseId: { in: assignedIds },
            studentId,
            deletedAt: null
        },
        select: { assignedCourseId: true }
    })
    const enrolledSet = new Set(enrolled.map(e => e.assignedCourseId))

    return assignments.map(a => ({
        assignedCourseId: a.id,
        courseId: a.course.id,
        title: a.course.title,
        slug: a.course.slug,
        availableWeek: a.availableWeek,
        description: a.course.description,
        addedAt: a.addedAt,
        isEnrolled: enrolledSet.has(a.id),
    }))
}

 /**
  * Enrolls a student into the assigned course by its ID:
  * 1) Verifies the assignment belongs to the classroom.
  * 2) Checks student enrollment in the classroom.
  * 3) Clears existing scores for idempotency.
  * 4) Creates zero-star scores for each challenge in the assignment.
  * 5) Returns the list of StudentChallengeScore.
  */
 export const enrollToAssignedCourse = async (
     classroomId: string,
     assignedCourseId: string,
     studentId: string
 ): Promise<StudentChallengeScore[]> => {
     // 1) Verify assignment → classroom
     const assignment = await prisma.assignedCourse.findUnique({
         where: { id: assignedCourseId },
         select: { classroomId: true, id: true, courseId: true },
     })
     if (!assignment || assignment.classroomId !== classroomId) {
         throw new Error('Assignment not found for this classroom')
     }



     // 2) Check student enrollment
     const enrollment = await prisma.enrollment.findFirst({
         where: { classroomId, studentId, deletedAt: null },
     })
     if (!enrollment) {
         throw new Error('Student not enrolled in classroom')
     }

     // 3) Fetch challenges linked to this assignment
     const challenges = await prisma.challenge.findMany({
         where: { courseId:  assignment.courseId , deletedAt: null },
         select: { id: true, level: true, title: true },
         orderBy: { level: 'asc' },
     })

     // 4) Clear existing scores
     await prisma.score.deleteMany({ where: { studentId, assignedCourseId } })

     // 5) Create zero-star scores
     await prisma.score.createMany({
         data: challenges.map((c) => ({
             studentId,
             assignedCourseId,
             challengeId: c.id,
         })),
         skipDuplicates: true,
     })

     // 6) Retrieve & map back
     const scores = await prisma.score.findMany({
         where: { studentId, assignedCourseId },
         select: { challengeId: true, stars: true, updatedAt: true },
     })

     return scores.map((s) => {
         const meta = challenges.find((c) => c.id === s.challengeId)!
         return {
             challengeId: s.challengeId,
             level: meta.level,
             title: meta.title,
             stars: s.stars,
             updatedAt: s.updatedAt,
         }
     })
 }
