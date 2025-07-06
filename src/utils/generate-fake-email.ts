export default function(classroomId: string, username: string):string {
    // replace non-url-safe chars
    const safeRoom = classroomId.replace(/[^a-zA-Z0-9]/g, '')
    const safeUser = username.replace(/[^a-zA-Z0-9]/g, '')
    return `${safeUser}@${safeRoom}.student`
}