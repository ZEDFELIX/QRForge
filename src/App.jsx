import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { lazy, Suspense } from 'react'
import Header from './components/Header.jsx'
import Footer from './components/Footer.jsx'
import Home from './pages/Home.jsx'
import About from './pages/About.jsx'
import Privacy from './pages/Privacy.jsx'
import DashboardLayout from './components/dashboard/DashboardLayout.jsx'

const CreateQRPage = lazy(() => import('./pages/CreateQRPage.jsx'))
const MyCodes = lazy(() => import('./pages/MyCodes.jsx'))
const DynamicQRPage = lazy(() => import('./pages/DynamicQRPage.jsx'))
const AnalyticsPage = lazy(() => import('./pages/AnalyticsPage.jsx'))
const CampaignsPage = lazy(() => import('./pages/CampaignsPage.jsx'))
const BulkPage = lazy(() => import('./pages/BulkPage.jsx'))
const TemplatesPage = lazy(() => import('./pages/TemplatesPage.jsx'))
const LandingPagesPage = lazy(() => import('./pages/LandingPagesPage.jsx'))
const BrandKitPage = lazy(() => import('./pages/BrandKitPage.jsx'))
const SettingsPage = lazy(() => import('./pages/SettingsPage.jsx'))
const HelpPage = lazy(() => import('./pages/HelpPage.jsx'))
const Dashboard = lazy(() => import('./pages/Dashboard.jsx'))

function Lazy({ children }) {
  return <Suspense fallback={<div className="flex justify-center py-24 text-sm text-slate-400">Loading…</div>}>{children}</Suspense>
}

export default function App() {
  return (
    <BrowserRouter>
      <div className="flex min-h-screen flex-col bg-white text-slate-800">
        <Header />
        <div className="flex-1">
          <Routes>
            {/* Public / static generator */}
            <Route path="/" element={<Home />} />
            <Route path="/about" element={<About />} />
            <Route path="/privacy" element={<Privacy />} />

            {/* Dashboard */}
            <Route path="/app" element={<DashboardLayout><Lazy><Dashboard /></Lazy></DashboardLayout>} />
            <Route path="/app/create" element={<DashboardLayout><Lazy><CreateQRPage /></Lazy></DashboardLayout>} />
            <Route path="/app/mycodes" element={<DashboardLayout><Lazy><MyCodes /></Lazy></DashboardLayout>} />
            <Route path="/app/dynamic" element={<DashboardLayout><Lazy><DynamicQRPage /></Lazy></DashboardLayout>} />
            <Route path="/app/analytics" element={<DashboardLayout><Lazy><AnalyticsPage /></Lazy></DashboardLayout>} />
            <Route path="/app/campaigns" element={<DashboardLayout><Lazy><CampaignsPage /></Lazy></DashboardLayout>} />
            <Route path="/app/bulk" element={<DashboardLayout><Lazy><BulkPage /></Lazy></DashboardLayout>} />
            <Route path="/app/templates" element={<DashboardLayout><Lazy><TemplatesPage /></Lazy></DashboardLayout>} />
            <Route path="/app/landing" element={<DashboardLayout><Lazy><LandingPagesPage /></Lazy></DashboardLayout>} />
            <Route path="/app/brand" element={<DashboardLayout><Lazy><BrandKitPage /></Lazy></DashboardLayout>} />
            <Route path="/app/settings" element={<DashboardLayout><Lazy><SettingsPage /></Lazy></DashboardLayout>} />
            <Route path="/app/help" element={<DashboardLayout><Lazy><HelpPage /></Lazy></DashboardLayout>} />

            <Route path="*" element={<Home />} />
          </Routes>
        </div>
        <Footer />
      </div>
    </BrowserRouter>
  )
}