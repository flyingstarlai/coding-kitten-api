import {AssignedCourseWithCourse} from "../classrooms/model";

export type StudentChallengeScore = {
    challengeId: string
    week: number
    level: number
    title: string
    stars: number
    updatedAt: Date
}

export type StudentScoresResponse = {
    studentId: string
    username: string
    name: string | null
    scores: StudentChallengeScore[]
}



export type AssignedCourseResponse = {
    id: string
    classroomId: string
    availableWeek: number
    courseId: string
    isAssigned: boolean
    addedAt: Date
    course: {
        id: string
        title: string
        slug: string
        description: string | null
    }
}

export const toAssignedCourseResponse = (cc: AssignedCourseWithCourse): AssignedCourseResponse => ({
    id: cc.id,
    classroomId: cc.classroomId,
    availableWeek: cc.availableWeek,
    courseId: cc.courseId,
    isAssigned: cc.isAssigned,
    addedAt: cc.addedAt,
    course: cc.course

})
