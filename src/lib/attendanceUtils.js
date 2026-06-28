/**
 * Get warning status based on number of absences PER SUBJECT.
 *
 * Thresholds:
 *   0-2  → Safe
 *   3    → Warning 1
 *   4    → Warning 2
 *   5+   → Barred from Final Exam (for this subject)
 */
export function getWarningStatus(absentCount) {
  if (absentCount <= 2) {
    return {
      label: 'Safe',
      message: 'Attendance is still okay.',
      color: 'green',
      level: 0,
    }
  }
  if (absentCount === 3) {
    return {
      label: 'Warning 1',
      message: 'You have reached 3 absences.',
      color: 'yellow',
      level: 1,
    }
  }
  if (absentCount === 4) {
    return {
      label: 'Warning 2',
      message: 'You have reached 4 absences. One more and you are barred.',
      color: 'orange',
      level: 2,
    }
  }
  // 5+
  return {
    label: 'Barred',
    message: 'You are barred from taking the final exam for this subject.',
    color: 'red',
    level: 3,
  }
}

/**
 * Statuses that count as "attended" (not absent).
 */
const ATTENDED_STATUSES = ['present', 'replacement', 'online']

/**
 * Calculate stats for a single subject from its attendance records.
 */
export function calculateSubjectStats(attendanceRecords) {
  let presentCount = 0
  let absentCount = 0
  let replacementCount = 0
  let onlineCount = 0
  let unmarkedCount = 0

  for (const record of attendanceRecords) {
    if (record.status === 'present') presentCount++
    else if (record.status === 'absent') absentCount++
    else if (record.status === 'replacement') replacementCount++
    else if (record.status === 'online') onlineCount++
    else unmarkedCount++
  }

  const attendedCount = presentCount + replacementCount + onlineCount
  const markedCount = attendedCount + absentCount
  const attendancePercentage =
    markedCount > 0 ? Math.round((attendedCount / markedCount) * 1000) / 10 : null

  return {
    presentCount,
    absentCount,
    replacementCount,
    onlineCount,
    attendedCount,
    markedCount,
    unmarkedCount,
    attendancePercentage,
    warningStatus: getWarningStatus(absentCount),
  }
}

/**
 * Calculate overall stats across all subjects.
 * Warning logic is PER SUBJECT — overall status reflects how many subjects are in trouble.
 */
export function calculateOverallStats(allSubjectStats) {
  let totalAttended = 0
  let totalAbsent = 0
  let totalMarked = 0
  let warningCount = 0
  let barredCount = 0

  for (const stats of allSubjectStats) {
    totalAttended += stats.attendedCount
    totalAbsent += stats.absentCount
    totalMarked += stats.markedCount
    if (stats.warningStatus.level >= 3) barredCount++
    else if (stats.warningStatus.level >= 1) warningCount++
  }

  const overallPercentage =
    totalMarked > 0 ? Math.round((totalAttended / totalMarked) * 1000) / 10 : null

  // Overall status is a summary, not a warning calculation
  let overallStatus
  if (barredCount > 0) {
    overallStatus = {
      label: `${barredCount} Barred`,
      message: `${barredCount} subject${barredCount !== 1 ? 's' : ''} barred from final exam.`,
      color: 'red',
      level: 3,
    }
  } else if (warningCount > 0) {
    overallStatus = {
      label: `${warningCount} At Risk`,
      message: `${warningCount} subject${warningCount !== 1 ? 's' : ''} with attendance warnings.`,
      color: 'orange',
      level: 1,
    }
  } else {
    overallStatus = {
      label: 'All Safe',
      message: 'All subjects have healthy attendance.',
      color: 'green',
      level: 0,
    }
  }

  return {
    totalAttended,
    totalAbsent,
    totalMarked,
    warningCount,
    barredCount,
    atRiskCount: warningCount + barredCount,
    overallPercentage,
    overallStatus,
  }
}