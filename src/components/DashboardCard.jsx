export default function DashboardCard({ label, value, icon: Icon, color = 'text-gray-700' }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4 flex items-center gap-3">
      <div className={`p-2 rounded-lg bg-gray-50 ${color}`}>
        <Icon size={20} />
      </div>
      <div>
        <p className="text-xs text-gray-500">{label}</p>
        <p className={`text-lg font-bold ${color}`}>{value}</p>
      </div>
    </div>
  )
}
