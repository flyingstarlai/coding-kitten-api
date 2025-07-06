
export type AssignedCourseForStudent = {
    assignedCourseId: string
    courseId: string
    title: string
    slug: string
    description: string | null
    addedAt: Date
    isEnrolled: boolean
}
