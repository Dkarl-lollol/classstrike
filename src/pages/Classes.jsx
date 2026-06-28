import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import { useAuth } from '../lib/AuthContext'
import { calculateSubjectStats } from '../lib/attendanceUtils'
import AddSubjectModal from '../components/AddSubjectModal'
import StatusBadge from '../components/StatusBadge'
import AttendanceDots from '../components/AttendanceDots'
import {
  Plus, Trash2, Pencil, ChevronDown, ChevronUp,
  Check, X, RefreshCw, Wifi, StickyNote, Calendar
} from 'lucide-react'

export default function Classes() {
  const { user } = useAuth()
  const [subjects, setSubjects] = useState([])
  const [records, setRecords] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showModal, setShowModal] = useState(false)
  const [editingSubject, setEditingSubject] = useState(null)
  const [expandedSubject, setExpandedSubject] = useState(null)
  const [editingNote, setEditingNote] = useState(null)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setLoading(true)
      setError(null)

      const [subjectsRes, recordsRes] = await Promise.all([
        supabase.from('subjects').select('*').order('created_at', { ascending: true }),
        supabase.from('attendance_records').select('*'),
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

  const handleAddSubject = async (subjectData) => {
    const { data, error } = await supabase
      .from('subjects')
      .insert({ ...subjectData, user_id: user.id })
      .select()
      .single()

    if (error) throw error
    setSubjects((prev) => [...prev, data])
  }

  const handleEditSubject = async (subjectId, subjectData) => {
    const { data, error } = await supabase
      .from('subjects')
      .update(subjectData)
      .eq('id', subjectId)
      .select()
      .single()

    if (error) throw error
    setSubjects((prev) => prev.map((s) => (s.id === subjectId ? data : s)))
  }

  const handleDeleteSubject = async (subjectId) => {
    const confirmed = window.confirm('Delete this subject and all its attendance records?')
    if (!confirmed) return

    const { error } = await supabase
      .from('subjects')
      .delete()
      .eq('id', subjectId)

    if (error) {
      alert('Failed to delete: ' + error.message)
      return
    }

    setSubjects((prev) => prev.filter((s) => s.id !== subjectId))
    setRecords((prev) => prev.filter((r) => r.subject_id !== subjectId))
    if (expandedSubject === subjectId) setExpandedSubject(null)
  }

  const handleMarkAttendance = async (subjectId, weekNumber, status) => {
    const existing = records.find(
      (r) => r.subject_id === subjectId && r.week_number === weekNumber
    )

    // For replacement, ask for a date
    let attendanceDate = null
    if (status === 'replacement') {
      const dateInput = prompt('Enter replacement class date (YYYY-MM-DD), or leave empty for TBC:')
      if (dateInput === null) return // cancelled
      attendanceDate = dateInput.trim() || null
    }

    if (existing) {
      if (existing.status === status) {
        const { error } = await supabase
          .from('attendance_records')
          .delete()
          .eq('id', existing.id)

        if (error) {
          alert('Failed to update: ' + error.message)
          return
        }

        setRecords((prev) => prev.filter((r) => r.id !== existing.id))
      } else {
        const updateData = { status }
        if (status === 'replacement') {
          updateData.attendance_date = attendanceDate
        }

        const { data, error } = await supabase
          .from('attendance_records')
          .update(updateData)
          .eq('id', existing.id)
          .select()
          .single()

        if (error) {
          alert('Failed to update: ' + error.message)
          return
        }

        setRecords((prev) => prev.map((r) => (r.id === existing.id ? data : r)))
      }
    } else {
      const { data, error } = await supabase
        .from('attendance_records')
        .insert({
          subject_id: subjectId,
          user_id: user.id,
          week_number: weekNumber,
          status,
          attendance_date: status === 'replacement' ? attendanceDate : null,
        })
        .select()
        .single()

      if (error) {
        alert('Failed to save: ' + error.message)
        return
      }

      setRecords((prev) => [...prev, data])
    }
  }

  const handleDateChange = async (subjectId, weekNumber, date) => {
    const existing = records.find(
      (r) => r.subject_id === subjectId && r.week_number === weekNumber
    )

    const dateValue = date || null

    if (existing) {
      const { data, error } = await supabase
        .from('attendance_records')
        .update({ attendance_date: dateValue })
        .eq('id', existing.id)
        .select()
        .single()

      if (error) {
        alert('Failed to save date: ' + error.message)
        return
      }

      setRecords((prev) => prev.map((r) => (r.id === existing.id ? data : r)))
    } else {
      const { data, error } = await supabase
        .from('attendance_records')
        .insert({
          subject_id: subjectId,
          user_id: user.id,
          week_number: weekNumber,
          status: 'unmarked',
          attendance_date: dateValue,
        })
        .select()
        .single()

      if (error) {
        alert('Failed to save date: ' + error.message)
        return
      }

      setRecords((prev) => [...prev, data])
    }
  }

  const handleSaveNotes = async (subjectId, weekNumber, notes) => {
    const existing = records.find(
      (r) => r.subject_id === subjectId && r.week_number === weekNumber
    )

    if (existing) {
      const { data, error } = await supabase
        .from('attendance_records')
        .update({ notes: notes.trim() || null })
        .eq('id', existing.id)
        .select()
        .single()

      if (error) {
        alert('Failed to save notes: ' + error.message)
        return
      }

      setRecords((prev) => prev.map((r) => (r.id === existing.id ? data : r)))
    } else {
      const { data, error } = await supabase
        .from('attendance_records')
        .insert({
          subject_id: subjectId,
          user_id: user.id,
          week_number: weekNumber,
          status: 'unmarked',
          notes: notes.trim() || null,
        })
        .select()
        .single()

      if (error) {
        alert('Failed to save notes: ' + error.message)
        return
      }

      setRecords((prev) => [...prev, data])
    }

    setEditingNote(null)
  }

  const formatDate = (dateStr) => {
    if (!dateStr) return null
    const d = new Date(dateStr + 'T00:00:00')
    return d.toLocaleDateString('en-MY', { day: 'numeric', month: 'short' })
  }

  const recordsBySubject = {}
  for (const record of records) {
    if (!recordsBySubject[record.subject_id]) {
      recordsBySubject[record.subject_id] = []
    }
    recordsBySubject[record.subject_id].push(record)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <p className="text-gray-400 text-sm">Loading classes...</p>
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
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Classes</h1>
          <p className="text-sm text-gray-500">Manage subjects and mark attendance.</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-1.5 px-3 py-2 bg-red-500 text-white text-sm font-medium
            rounded-lg hover:bg-red-600 transition-colors"
        >
          <Plus size={16} />
          Add
        </button>
      </div>

      {/* Subject list */}
      {subjects.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
          <p className="text-gray-500 mb-4">No subjects yet. Add your first one.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {subjects.map((subject) => {
            const subjectRecords = recordsBySubject[subject.id] || []
            const stats = calculateSubjectStats(subjectRecords)
            const isExpanded = expandedSubject === subject.id

            return (
              <div
                key={subject.id}
                className="bg-white rounded-xl border border-gray-200 overflow-hidden"
              >
                {/* Subject header */}
                <button
                  onClick={() =>
                    setExpandedSubject(isExpanded ? null : subject.id)
                  }
                  className="w-full p-4 text-left"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-gray-900">
                          {subject.name}
                        </h3>
                        {isExpanded ? (
                          <ChevronUp size={16} className="text-gray-400" />
                        ) : (
                          <ChevronDown size={16} className="text-gray-400" />
                        )}
                      </div>
                      {subject.lecturer && (
                        <p className="text-xs text-gray-400">
                          {subject.lecturer}
                        </p>
                      )}
                    </div>
                    <StatusBadge warningStatus={stats.warningStatus} />
                  </div>

                  <div className="flex gap-4 text-sm text-gray-500 mb-3">
                    <span>
                      Attendance:{' '}
                      <span className="font-medium text-gray-700">
                        {stats.attendancePercentage !== null
                          ? `${stats.attendancePercentage}%`
                          : '—'}
                      </span>
                    </span>
                    <span>
                      Absences:{' '}
                      <span className="font-medium text-gray-700">
                        {stats.absentCount}
                      </span>
                    </span>
                  </div>

                  <AttendanceDots
                    records={subjectRecords}
                    totalWeeks={subject.total_weeks}
                  />
                </button>

                {/* Expanded: attendance grid */}
                {isExpanded && (
                  <div className="border-t border-gray-100 p-4">
                    <p className="text-xs text-gray-500 mb-3">
                      Mark attendance for each week. Tap again to undo.
                    </p>

                    <div className="space-y-3">
                      {Array.from(
                        { length: subject.total_weeks },
                        (_, i) => {
                          const week = i + 1
                          const record = subjectRecords.find(
                            (r) => r.week_number === week
                          )
                          const status = record?.status || 'unmarked'
                          const noteKey = `${subject.id}-${week}`
                          const isEditingThisNote = editingNote === noteKey
                          const hasNotes = record?.notes?.trim()

                          return (
                            <div key={week} className="border-b border-gray-50 pb-3 last:border-0 last:pb-0">
                              {/* Week header with date */}
                              <div className="flex items-center gap-2 mb-1.5">
                                <span className="text-sm font-medium text-gray-700 w-16 shrink-0">
                                  Week {week}
                                </span>
                                <div className="flex items-center gap-1">
                                  <Calendar size={12} className="text-gray-300" />
                                  <input
                                    type="date"
                                    value={record?.attendance_date || ''}
                                    onChange={(e) => {
                                      e.stopPropagation()
                                      handleDateChange(subject.id, week, e.target.value)
                                    }}
                                    onClick={(e) => e.stopPropagation()}
                                    className="text-xs text-gray-500 border-none bg-transparent
                                      focus:outline-none cursor-pointer"
                                  />
                                  {status === 'replacement' && !record?.attendance_date && (
                                    <span className="text-xs text-purple-500 font-medium">TBC</span>
                                  )}
                                </div>
                              </div>

                              {/* Status buttons */}
                              <div className="flex items-center gap-1.5 flex-wrap ml-16">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    handleMarkAttendance(subject.id, week, 'present')
                                  }}
                                  className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium transition-colors
                                    ${status === 'present'
                                      ? 'bg-green-100 text-green-700'
                                      : 'bg-gray-50 text-gray-400 hover:bg-green-50 hover:text-green-600'
                                    }`}
                                >
                                  <Check size={12} />
                                  Present
                                </button>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    handleMarkAttendance(subject.id, week, 'absent')
                                  }}
                                  className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium transition-colors
                                    ${status === 'absent'
                                      ? 'bg-red-100 text-red-600'
                                      : 'bg-gray-50 text-gray-400 hover:bg-red-50 hover:text-red-500'
                                    }`}
                                >
                                  <X size={12} />
                                  Absent
                                </button>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    handleMarkAttendance(subject.id, week, 'replacement')
                                  }}
                                  className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium transition-colors
                                    ${status === 'replacement'
                                      ? 'bg-purple-100 text-purple-700'
                                      : 'bg-gray-50 text-gray-400 hover:bg-purple-50 hover:text-purple-600'
                                    }`}
                                >
                                  <RefreshCw size={12} />
                                  Replace
                                </button>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    handleMarkAttendance(subject.id, week, 'online')
                                  }}
                                  className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium transition-colors
                                    ${status === 'online'
                                      ? 'bg-sky-100 text-sky-700'
                                      : 'bg-gray-50 text-gray-400 hover:bg-sky-50 hover:text-sky-600'
                                    }`}
                                >
                                  <Wifi size={12} />
                                  Online
                                </button>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    setEditingNote(isEditingThisNote ? null : noteKey)
                                  }}
                                  className={`p-1 rounded-lg transition-colors ${
                                    hasNotes
                                      ? 'text-blue-500 bg-blue-50'
                                      : 'text-gray-300 hover:text-gray-500 hover:bg-gray-50'
                                  }`}
                                  title={hasNotes ? 'Edit notes' : 'Add notes'}
                                >
                                  <StickyNote size={12} />
                                </button>
                              </div>

                              {/* Show notes if they exist */}
                              {hasNotes && !isEditingThisNote && (
                                <div
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    setEditingNote(noteKey)
                                  }}
                                  className="ml-16 mt-1.5 px-3 py-1.5 bg-blue-50 rounded-lg text-xs text-blue-700
                                    cursor-pointer hover:bg-blue-100 transition-colors"
                                >
                                  {record.notes}
                                </div>
                              )}

                              {/* Editable textarea */}
                              {isEditingThisNote && (
                                <div className="ml-16 mt-1.5">
                                  <textarea
                                    defaultValue={record?.notes || ''}
                                    placeholder="e.g. Covered linked lists, or MC appointment"
                                    rows={2}
                                    autoFocus
                                    onBlur={(e) => {
                                      handleSaveNotes(subject.id, week, e.target.value)
                                    }}
                                    onClick={(e) => e.stopPropagation()}
                                    className="w-full px-3 py-2 border border-blue-200 rounded-lg text-sm
                                      focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent
                                      resize-none"
                                  />
                                  <p className="text-xs text-gray-400 mt-0.5">
                                    Saves automatically when you click away.
                                  </p>
                                </div>
                              )}
                            </div>
                          )
                        }
                      )}
                    </div>

                    {/* Warning message */}
                    {stats.warningStatus.level >= 1 && (
                      <div
                        className={`mt-4 p-3 rounded-lg text-sm ${
                          stats.warningStatus.level >= 4
                            ? 'bg-red-50 text-red-700'
                            : stats.warningStatus.level >= 3
                              ? 'bg-red-50 text-red-600'
                              : 'bg-yellow-50 text-yellow-700'
                        }`}
                      >
                        {stats.warningStatus.message}
                      </div>
                    )}

                    {/* Edit and Delete */}
                    <div className="mt-4 flex items-center gap-4">
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          setEditingSubject(subject)
                        }}
                        className="flex items-center gap-1.5 text-sm text-gray-400
                          hover:text-blue-500 transition-colors"
                      >
                        <Pencil size={14} />
                        Edit Subject
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          handleDeleteSubject(subject.id)
                        }}
                        className="flex items-center gap-1.5 text-sm text-gray-400
                          hover:text-red-500 transition-colors"
                      >
                        <Trash2 size={14} />
                        Delete Subject
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}

      {showModal && (
        <AddSubjectModal
          onClose={() => setShowModal(false)}
          onAdd={handleAddSubject}
        />
      )}

      {editingSubject && (
        <AddSubjectModal
          onClose={() => setEditingSubject(null)}
          onEdit={handleEditSubject}
          subject={editingSubject}
        />
      )}
    </div>
  )
}