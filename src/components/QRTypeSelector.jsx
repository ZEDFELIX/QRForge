import { QR_TYPES } from '../utils/qrGenerator.js'
import { Link as LinkIcon, Type, Image, Phone, Mail, MessageSquare, MessageCircle, Wifi, User, MapPin, CreditCard } from 'lucide-react'

const ICONS = {
  Link: LinkIcon,
  Type,
  Image,
  Phone,
  Mail,
  MessageSquare,
  MessageCircle,
  Wifi,
  User,
  MapPin,
  CreditCard
}

export default function QRTypeSelector({ current, onChange }) {
  return (
    <div className="card p-4">
      <h2 className="mb-3 text-base font-semibold text-slate-900">QR Type</h2>
      <div role="tablist" aria-label="QR code type" className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        {QR_TYPES.map((t) => {
          const Icon = ICONS[t.icon] || Type
          const active = current === t.id
          return (
            <button
              key={t.id}
              role="tab"
              aria-selected={active}
              onClick={() => onChange(t.id)}
              className={`flex items-center justify-start gap-2 rounded-xl border px-3 py-2.5 text-sm font-medium transition ${
                active
                  ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                  : 'border-slate-200 bg-white text-slate-600 hover:border-indigo-200 hover:bg-slate-50'
              }`}
            >
              <Icon size={16} aria-hidden="true" />
              {t.label}
            </button>
          )
        })}
      </div>
    </div>
  )
}