import { Check, X, RefreshCw, Wifi } from 'lucide-react'

export default function AttendanceDots({ records, totalWeeks = 14 }) {
  const statusByWeek = {}
  for (const record of records) {
    statusByWeek[record.week_number] = record.status
  }

  return (
    <div className="flex gap-1.5 flex-wrap">
      {Array.from({ length: totalWeeks }, (_, i) => {
        const week = i + 1
        const status = statusByWeek[week] || 'unmarked'

        if (status === 'present') {
          return (
            <div
              key={week}
              title={`Week ${week}: Present`}
              className="w-6 h-6 rounded-full bg-green-100 text-green-600 flex items-center justify-center"
            >
              <Check size={14} strokeWidth={3} />
            </div>
          )
        }

        if (status === 'absent') {
          return (
            <div
              key={week}
              title={`Week ${week}: Absent`}
              className="w-6 h-6 rounded-full bg-red-100 text-red-500 flex items-center justify-center"
            >
              <X size={14} strokeWidth={3} />
            </div>
          )
        }

        if (status === 'replacement') {
          return (
            <div
              key={week}
              title={`Week ${week}: Replacement`}
              className="w-6 h-6 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center"
            >
              <RefreshCw size={12} strokeWidth={3} />
            </div>
          )
        }

        if (status === 'online') {
          return (
            <div
              key={week}
              title={`Week ${week}: Online`}
              className="w-6 h-6 rounded-full bg-sky-100 text-sky-600 flex items-center justify-center"
            >
              <Wifi size={12} strokeWidth={3} />
            </div>
          )
        }

        return (
          <div
            key={week}
            title={`Week ${week}: Unmarked`}
            className="w-6 h-6 rounded-full bg-gray-100"
          />
        )
      })}
    </div>
  )
}