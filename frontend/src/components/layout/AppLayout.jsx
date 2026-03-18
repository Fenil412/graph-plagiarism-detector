import { Outlet } from 'react-router-dom'
import { useState, useEffect } from 'react'
import Sidebar from './Sidebar'
import Header from './Header'

export default function AppLayout() {
  const [sidebarWidth, setSidebarWidth] = useState(280)
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }

    const handleResize = () => {
      checkMobile()
      const sidebar = document.querySelector('aside')
      if (sidebar) {
        setSidebarWidth(sidebar.offsetWidth)
      }
    }

    // Initial check
    checkMobile()
    handleResize()

    // Listen for window resize
    window.addEventListener('resize', handleResize)
    
    // Watch for sidebar width changes (collapse/expand)
    const observer = new MutationObserver(handleResize)
    const sidebar = document.querySelector('aside')
    if (sidebar) {
      observer.observe(sidebar, { attributes: true, attributeFilter: ['style', 'class'] })
    }

    // Also watch for sidebar animations
    const animationObserver = new MutationObserver(() => {
      setTimeout(handleResize, 100) // Delay to catch animation end
    })
    if (sidebar) {
      animationObserver.observe(sidebar, { attributes: true })
    }

    return () => {
      window.removeEventListener('resize', handleResize)
      observer.disconnect()
      animationObserver.disconnect()
    }
  }, [])

  return (
    <div className="flex min-h-screen relative bg-[var(--bg-base)]">
      <Sidebar />
      <div 
        className="flex-1 flex flex-col min-h-screen transition-all duration-300 ease-in-out"
        style={{ 
          marginLeft: isMobile ? '0' : `${sidebarWidth}px`,
          width: isMobile ? '100%' : `calc(100% - ${sidebarWidth}px)`
        }}
      >
        <Header sidebarWidth={sidebarWidth} />
        <main className="flex-1 pt-[var(--header-h)] overflow-y-auto overflow-x-hidden relative">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
