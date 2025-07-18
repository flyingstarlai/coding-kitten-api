export type EnrollmentResponse = {
    id: string
    classroomId: string
    studentId: string
    username: string
    email: string
    name: string;
    invitedAt: Date
    joinedAt: Date | null
}

export type EnrollmentImportResult = {
    username: string
    status: 'created' | 'error'
    enrollment?: EnrollmentResponse
    message?: string
}