import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface ThemeStore {
  primaryColor: string
  setPrimaryColor: (color: string) => void
}

// Helper function to convert hex to HSL
function hexToHSL(hex: string) {
  // Remove the # if present
  hex = hex.replace(/^#/, '')

  // Convert hex to RGB
  const r = parseInt(hex.slice(0, 2), 16) / 255
  const g = parseInt(hex.slice(2, 4), 16) / 255
  const b = parseInt(hex.slice(4, 6), 16) / 255

  // Find greatest and smallest channel values
  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  
  let h = 0
  let s = 0
  const l = (max + min) / 2

  if (max !== min) {
    const d = max - min
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
    
    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0)
        break
      case g:
        h = (b - r) / d + 2
        break
      case b:
        h = (r - g) / d + 4
        break
    }
    
    h /= 6
  }

  return {
    h: Math.round(h * 360),
    s: Math.round(s * 100),
    l: Math.round(l * 100)
  }
}

// Function to update theme colors
function updateCSSVariables(color: string) {
  const hsl = hexToHSL(color)
  document.documentElement.style.setProperty('--brand-primary', `${hsl.h} ${hsl.s}% ${hsl.l}%`)
  document.documentElement.style.setProperty('--brand-primary-hover', `${hsl.h} ${hsl.s}% ${hsl.l - 7}%`)
}

export const useThemeStore = create<ThemeStore>()(
  persist(
    (set) => ({
      primaryColor: '#0B75FF',
      setPrimaryColor: (color) => {
        set({ primaryColor: color })
        updateCSSVariables(color)
      }
    }),
    {
      name: 'theme-storage'
    }
  )
)