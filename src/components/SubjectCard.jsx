import AttendanceDots from './AttendanceDots'
import StatusBadge from './StatusBadge'
import { calculateSubjectStats } from '../lib/attendanceUtils'

export default function SubjectCard({ subject, records, onClick }) {
  const stats = calculateSubjectStats(records)

  return (
    <button
      onClick={onClick}
      className="w-full bg-white rounded-xl border border-gray-200 p-4 text-left
        hover:border-gray-300 hover:shadow-sm transition-all"
    >
      {/* Header row */}
      <div className="flex items-start justify-between mb-2">
        <div>
          <h3 className="font-semibold text-gray-900">{subject.name}</h3>
          {subject.lecturer && (
            <p className="text-xs text-gray-400">{subject.lecturer}</p>
          )}
        </div>
        <StatusBadge warningStatus={stats.warningStatus} />
      </div>

      {/* Stats row */}
      <div className="flex gap-4 text-sm text-gray-500 mb-3">
        <span>
          Attendance:{' '}
          <span className="font-medium text-gray-700">
            {stats.attendancePercentage !== null
              ? `${stats.attendancePercentage}%`
              : '—'
            }
          </span>
        </span>
        <span>
          Absences:{' '}
          <span className="font-medium text-gray-700">
            {stats.absentCount}/5
          </span>
        </span>
      </div>

      {/* Attendance dots */}
      <AttendanceDots records={records} totalWeeks={subject.total_weeks} />
    </button>
  )
}