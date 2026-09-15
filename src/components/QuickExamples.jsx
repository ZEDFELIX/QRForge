import { Search, Instagram, Mail, MessageCircle, Globe, Wifi, User, MapPin } from 'lucide-react'

const EXAMPLES = [
  { id: 'google', label: 'Google', icon: Search, type: 'url', fields: { url: 'https://www.google.com' } },
  { id: 'whatsapp', label: 'WhatsApp', icon: MessageCircle, type: 'url', fields: { url: 'https://wa.me/254700000000' } },
  { id: 'instagram', label: 'Instagram', icon: Instagram, type: 'url', fields: { url: 'https://www.instagram.com/' } },
  { id: 'website', label: 'Website', icon: Globe, type: 'url', fields: { url: 'https://example.com' } },
  { id: 'email', label: 'Email', icon: Mail, type: 'email', fields: { email: 'hello@example.com', emailSubject: '', emailBody: '' } },
  { id: 'wifi', label: 'Wi-Fi', icon: Wifi, type: 'wifi', fields: { wifiSsid: 'CoffeeShop', wifiPassword: '', wifiSecurity: 'WPA', wifiHidden: false } },
  { id: 'contact', label: 'Contact', icon: User, type: 'contact', fields: { contactName: 'John Doe', contactOrg: '', contactPhone: '', contactEmail: '', contactWebsite: '', contactAddress: '' } },
  { id: 'location', label: 'Location', icon: MapPin, type: 'location', fields: { lat: '-1.2921', lng: '36.8219' } }
]

export default function QuickExamples({ onExample }) {
  return (
    <div className="mt-5 border-t border-slate-100 pt-4">
      <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
        Quick examples
      </p>
      <div className="flex flex-wrap gap-2">
        {EXAMPLES.map((ex) => {
          const Icon = ex.icon
          return (
            <button
              key={ex.id}
              type="button"
              onClick={() => onExample(ex)}
              className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-600 transition hover:border-indigo-300 hover:bg-indigo-50 hover:text-indigo-700"
            >
              <Icon size={13} aria-hidden="true" />
              {ex.label}
            </button>
          )
        })}
      </div>
    </div>
  )
}