export const tutorStudentsPath = '/tutor/students'

export function tutorStudentPath(id: string) {
  return `${tutorStudentsPath}/${encodeURIComponent(id)}`
}
