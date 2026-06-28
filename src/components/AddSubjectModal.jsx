import { useState } from 'react'
import { X } from 'lucide-react'

export default function AddSubjectModal({ onClose, onAdd, onEdit, subject }) {
  const isEditing = !!subject
  const [name, setName] = useState(isEditing ? subject.name : '')
  const [lecturer, setLecturer] = useState(isEditing ? subject.lecturer || '' : '')
  const [totalWeeks, setTotalWeeks] = useState(isEditing ? subject.total_weeks : 14)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      const data = { name: name.trim(), lecturer: lecturer.trim() || null, total_weeks: totalWeeks }
      if (isEditing) {
        await onEdit(subject.id, data)
      } else {
        await onAdd(data)
      }
      onClose()
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />

      <div className="relative bg-white rounded-2xl shadow-lg w-full max-w-sm p-6">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
        >
          <X size={20} />
        </button>

        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          {isEditing ? 'Edit Subject' : 'Add Subject'}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
              Subject Name <span className="text-red-500">*</span>
            </label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              placeholder="e.g. Data Structures"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm
                focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
            />
          </div>

          <div>
            <label htmlFor="lecturer" className="block text-sm font-medium text-gray-700 mb-1">
              Lecturer <span className="text-gray-400 font-normal">(optional)</span>
            </label>
            <input
              id="lecturer"
              type="text"
              value={lecturer}
              onChange={(e) => setLecturer(e.target.value)}
              placeholder="e.g. Dr. Ahmad"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm
                focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
            />
          </div>

          <div>
            <label htmlFor="weeks" className="block text-sm font-medium text-gray-700 mb-1">
              Total Weeks
            </label>
            <select
              id="weeks"
              value={totalWeeks}
              onChange={(e) => setTotalWeeks(Number(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm
                focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
            >
              {[7, 8, 10, 12, 14, 16].map((w) => (
                <option key={w} value={w}>{w} weeks</option>
              ))}
            </select>
          </div>

          {error && (
            <p className="text-red-500 text-sm bg-red-50 rounded-lg px-3 py-2">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading || !name.trim()}
            className="w-full py-2.5 bg-red-500 text-white font-medium rounded-lg
              hover:bg-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Saving...' : isEditing ? 'Save Changes' : 'Add Subject'}
          </button>
        </form>
      </div>
    </div>
  )
}