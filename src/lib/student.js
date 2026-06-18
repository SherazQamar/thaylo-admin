/**
 * @param {{ firstName?: string | null; secondName?: string | null; userName: string }} student
 */
export function formatStudentName(student) {
  const fullName = [student.firstName, student.secondName].filter(Boolean).join(' ').trim()
  return fullName || student.userName
}
