import { Outlet } from 'react-router-dom'
import { useState, useEffect } from 'react'
import Sidebar from './Sidebar'
import Header from './Header'
import GalaxyBackground from '@/components/ui/GalaxyBackground'

export default function AppLayout() {
  const [collapsed, setCollapsed] = useState(false)
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768)

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768)
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  // Listen for collapse toggle events from Sidebar
  useEffect(() => {
    const handler = (e) => setCollapsed(e.detail.collapsed)
    window.addEventListener('sidebar-toggle', handler)
    return () => window.removeEventListener('sidebar-toggle', handler)
  }, [])

  const sidebarW = isMobile ? 0 : collapsed ? 88 : 280

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'transparent', position: 'relative' }}>
      {/* ── Galaxy / Space background ─────────────── */}
      <GalaxyBackground opacity={0.92} />

      <Sidebar onCollapseChange={(c) => setCollapsed(c)} />

      {/* Main content shifts right by sidebar width */}
      <div
        style={{
          marginLeft: `${sidebarW}px`,
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          minHeight: '100vh',
          transition: 'margin-left 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          width: `calc(100% - ${sidebarW}px)`,
          position: 'relative',
          zIndex: 1,
        }}
      >
        <Header sidebarWidth={sidebarW} />

        {/* Page content — starts below the fixed header */}
        <main
          style={{
            flex: 1,
            marginTop: 'var(--header-h)',
            overflowX: 'hidden',
            overflowY: 'auto',
          }}
        >
          <div className="page-content-wrapper">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}
