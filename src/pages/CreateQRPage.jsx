import { useSearchParams } from 'react-router-dom'
import QRGenerator from '../components/QRGenerator.jsx'
import { TEMPLATES } from '../utils/templates.js'

export default function CreateQRPage() {
  const [params] = useSearchParams()
  const templateId = params.get('template')
  const template = TEMPLATES.find((t) => t.id === templateId)

  return (
    <div className="space-y-4">
      <header>
        <h1 className="text-xl font-bold text-slate-900">Create QR Code</h1>
        <p className="text-sm text-slate-500">
          {template ? `Editing template: ${template.name}` : 'Generate unlimited QR codes — free forever.'}
        </p>
      </header>
      {template && (
        <div className="rounded-xl border border-indigo-200 bg-indigo-50 px-4 py-3 text-sm text-indigo-800">
          Template applied: <strong>{template.name}</strong> — update any field and download.
        </div>
      )}
      <QRGenerator
        key={template ? template.id : 'custom'}
        initialType={template ? template.qrType : undefined}
        initialFields={template ? template.fields : undefined}
        initialFg={template ? template.suggestedFg : undefined}
        initialBg={template ? template.suggestedBg : undefined}
        initialRounded={template ? template.suggestedRounded : undefined}
      />
    </div>
  )
}