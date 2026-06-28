import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'
import { useAuth } from '../lib/AuthContext'
import { calculateSubjectStats, calculateOverallStats } from '../lib/attendanceUtils'
import DashboardCard from '../components/DashboardCard'
import SubjectCard from '../components/SubjectCard'
import StatusBadge from '../components/StatusBadge'
import { Percent, CheckCircle, XCircle, AlertTriangle, BookOpen } from 'lucide-react'

export default function Dashboard() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [subjects, setSubjects] = useState([])
  const [records, setRecords] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setLoading(true)
      setError(null)

      const [subjectsRes, recordsRes] = await Promise.all([
        supabase
          .from('subjects')
          .select('*')
          .order('created_at', { ascending: true }),
        supabase
          .from('attendance_records')
          .select('*'),
      ])

      if (subjectsRes.error) throw subjectsRes.error
      if (recordsRes.error) throw recordsRes.error

      setSubjects(subjectsRes.data)
      setRecords(recordsRes.data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const recordsBySubject = {}
  for (const record of records) {
    if (!recordsBySubject[record.subject_id]) {
      recordsBySubject[record.subject_id] = []
    }
    recordsBySubject[record.subject_id].push(record)
  }

  const subjectStats = subjects.map((subject) => {
    const subjectRecords = recordsBySubject[subject.id] || []
    return calculateSubjectStats(subjectRecords)
  })

  const overall = calculateOverallStats(subjectStats)

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <p className="text-gray-400 text-sm">Loading dashboard...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-50 text-red-600 rounded-xl p-4 text-sm">
        Error loading data: {error}
      </div>
    )
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-sm text-gray-500">
          {subjects.length === 0
            ? 'Add your first subject to get started.'
            : `Tracking ${subjects.length} subject${subjects.length !== 1 ? 's' : ''}`
          }
        </p>
      </div>

      {subjects.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
          <BookOpen size={40} className="mx-auto text-gray-300 mb-3" />
          <p className="text-gray-500 mb-4">No subjects yet.</p>
          <button
            onClick={() => navigate('/classes')}
            className="px-4 py-2 bg-red-500 text-white text-sm font-medium rounded-lg
              hover:bg-red-600 transition-colors"
          >
            Go to Classes to add one
          </button>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-3 mb-6">
            <DashboardCard
              label="Overall Attendance"
              value={overall.overallPercentage !== null ? `${overall.overallPercentage}%` : '—'}
              icon={Percent}
              color="text-blue-600"
            />
            <DashboardCard
              label="Total Attended"
              value={overall.totalAttended}
              icon={CheckCircle}
              color="text-green-600"
            />
            <DashboardCard
              label="Total Strikes"
              value={overall.totalAbsent}
              icon={XCircle}
              color="text-red-500"
            />
            <DashboardCard
              label="At Risk Subjects"
              value={overall.atRiskCount}
              icon={AlertTriangle}
              color={overall.atRiskCount > 0 ? 'text-orange-500' : 'text-gray-500'}
            />
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-4 mb-6 flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500">Overall Status</p>
              <p className="text-sm text-gray-600 mt-0.5">{overall.overallStatus.message}</p>
            </div>
            <StatusBadge warningStatus={overall.overallStatus} size="md" />
          </div>

          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
            Your Subjects
          </h2>
          <div className="space-y-3">
            {subjects.map((subject) => (
              <SubjectCard
                key={subject.id}
                subject={subject}
                records={recordsBySubject[subject.id] || []}
                onClick={() => navigate('/classes')}
              />
            ))}
          </div>
        </>
      )}
    </div>
  )
}