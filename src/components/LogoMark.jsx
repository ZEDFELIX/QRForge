export default function LogoMark({ className = '' }) {
  return (
    <span
      aria-hidden="true"
      className={`relative inline-flex h-9 w-9 items-center justify-center rounded-xl shadow-glow ${className}`}
      style={{ background: 'linear-gradient(135deg,#635bff 0%,#a855f7 60%,#e879f9 100%)' }}
    >
      <svg viewBox="0 0 24 24" width="19" height="19" fill="none" aria-hidden="true">
        <rect x="3.5" y="3.5" width="7.2" height="7.2" rx="1.4" fill="#fff" />
        <rect x="5.3" y="5.3" width="3.8" height="3.8" rx="0.7" fill="#635bff" />
        <rect x="13.3" y="3.5" width="7.2" height="4" rx="1.4" fill="#fff" opacity=".92" />
        <rect x="3.5" y="13.3" width="4" height="7.2" rx="1.4" fill="#fff" opacity=".92" />
        <rect x="13.3" y="10.2" width="3.6" height="3.6" rx="1" fill="#fff" />
        <rect x="17.9" y="14.8" width="3.1" height="3.1" rx="1" fill="#fff" />
        <circle cx="14.7" cy="19.6" r="1.5" fill="#fff" />
      </svg>
    </span>
  )
}