"use client"

import { cn } from "@/lib/utils"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState } from "react"

// Define the navigation item type
export interface NavItem {
  icon: React.ReactNode
  href: string
  label: string
}

interface SidebarProps {
  navItems: NavItem[]
  onClick?: (e: React.MouseEvent) => void
}

export default function Sidebar({ navItems, onClick }: SidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(true)
  const pathname = usePathname()

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
    <div 
      className={cn(
        "fixed left-0 top-0 flex flex-col h-screen bg-[#F8F8F8] transition-all duration-300 z-10",
        isCollapsed ? "w-[65px]" : "w-[200px]"
      )}
    >
      <div className="flex-1 py-8">
        <nav className="space-y-3 py-24 px-2">
          {navItems.map((item, index) => (
            <Link
              key={index}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-lg transition-colors text-md",
                "hover:bg-gray-300",
                isCurrentPath(item.href) ? "text-brand bg-brand-opacity" : "text-gray-700",
                isCollapsed && "justify-center"
              )}
              title={isCollapsed ? item.label : undefined}
              onClick={onClick}
            >
              {item.icon}
              {!isCollapsed && <span>{item.label}</span>}
            </Link>
          ))}
        </nav>
      </div>

      {/* Collapse button */}
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className={cn(
          "flex items-center justify-center gap-3 px-3 py-[13px] mx-2 mb-8 rounded-lg transition-colors text-center  border border-[#CED4DA]",
          isCollapsed && "justify-center bg-white w-[40px] mx-auto"
        )}
      >
        {isCollapsed ? <img src="/sidebarbutton.svg" alt="icon" width={7} height={8} /> : ""}
        {!isCollapsed && <span className="text-sm ">Collapse </span>}
      </button>
    </div>
  )
}
