"use client"

import { cn } from "@/lib/utils"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState, useEffect } from "react"

// Define the navigation item type
export interface NavItem {
  icon: React.ReactNode
  href: string
  label: string
}

interface SidebarProps {
  navItems: NavItem[]
  onClick?: (e: React.MouseEvent) => void
  disabled?: boolean
}

export default function Sidebar({ navItems, onClick, disabled }: SidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(true)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const pathname = usePathname()

  useEffect(() => {
    setIsMobileMenuOpen(false)
  }, [pathname])

  // Helper function to check if the current path matches the nav item
  const isCurrentPath = (href: string) => {
    // For company admin routes: /[companyId]/path
    if (pathname.split('/').length === 3) {
      const routePattern = href.split('/').slice(2).join('/')
      const currentRoute = pathname.split('/').slice(2).join('/')
      return routePattern === currentRoute
    }
    
    // For icog admin routes: /path
    return pathname === href || pathname.startsWith(`${href}/`)
  }

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        className="absolute py-[30px] px-4 z-20 md:hidden"
      >
        <img src="/navResponsive.svg" alt="Menu" width={24} height={24} />
      </button>

      {/* Sidebar - hidden on mobile unless menu is open, shows desktop version on md screens */}
      <div 
        className={cn(
          "fixed left-0 top-0 flex flex-col h-screen bg-[#F8F8F8] transition-all duration-300 z-10",
          // Desktop styles
          "hidden md:flex",
          isCollapsed ? "md:w-[65px]" : "md:w-[200px]",
          // Mobile styles - only show when menu is open
          isMobileMenuOpen ? "flex md:w-[200px] w-[150px]" : "hidden"
        )}
      >
        <div className="flex-1 py-8">
          <nav className="space-y-3 py-24 px-2">
            {navItems.map((item, index) => (
              <Link
                key={index}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2 rounded-lg transition-colors text-sm md:text-md",
                  "hover:bg-gray-300",
                  isCurrentPath(item.href) ? "text-brand bg-brand-opacity" : "text-gray-700",
                  // Only center justify on desktop when collapsed
                  isCollapsed && "md:justify-center",
                  disabled ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-100'
                )}
                title={isCollapsed ? item.label : undefined}
                onClick={onClick}
              >
                {item.icon}
                {/* Always show labels on mobile, only show on desktop when not collapsed */}
                {(!isCollapsed || isMobileMenuOpen) && <span>{item.label}</span>}
              </Link>
            ))}
          </nav>
        </div>

        {/* Collapse button - only visible on desktop */}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="hidden md:flex items-center justify-center gap-3 px-3 py-[13px] mx-2 mb-8 rounded-lg transition-colors text-center border border-[#CED4DA]"
        >
          {isCollapsed ? <img src="/sidebarbutton.svg" alt="icon" width={7} height={8} /> : ""}
          {!isCollapsed && <span className="text-sm">Collapse</span>}
        </button>
      </div>
    </>
  )
}
