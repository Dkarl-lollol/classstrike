import { CheckCircle, AlertTriangle, XOctagon } from 'lucide-react'

const STATUS_STYLES = {
  green: {
    bg: 'bg-green-50',
    text: 'text-green-700',
    icon: CheckCircle,
  },
  yellow: {
    bg: 'bg-yellow-50',
    text: 'text-yellow-700',
    icon: AlertTriangle,
  },
  orange: {
    bg: 'bg-orange-50',
    text: 'text-orange-700',
    icon: AlertTriangle,
  },
  'red-orange': {
    bg: 'bg-red-50',
    text: 'text-red-600',
    icon: AlertTriangle,
  },
  red: {
    bg: 'bg-red-100',
    text: 'text-red-700',
    icon: XOctagon,
  },
}

export default function StatusBadge({ warningStatus, size = 'sm' }) {
  const style = STATUS_STYLES[warningStatus.color] || STATUS_STYLES.green
  const Icon = style.icon

  const sizeClasses = size === 'sm'
    ? 'text-xs px-2 py-0.5 gap-1'
    : 'text-sm px-3 py-1 gap-1.5'

  const iconSize = size === 'sm' ? 12 : 14

  return (
    <span className={`inline-flex items-center font-medium rounded-full ${style.bg} ${style.text} ${sizeClasses}`}>
      <Icon size={iconSize} />
      {warningStatus.label}
    </span>
  )
}
