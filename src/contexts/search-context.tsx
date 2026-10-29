'use client'

import { createContext, useContext, useEffect, useState } from 'react'

import type { Dispatch, ReactElement, ReactNode, SetStateAction } from 'react'

export interface SearchContextType {
  open: boolean
  setOpen: Dispatch<SetStateAction<boolean>>
}

const SearchContext = createContext<SearchContextType | null>(null)

export function SearchProvider({ children }: { children: ReactNode }): ReactElement {
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setOpen((prev) => !prev)
      }
    }
    document.addEventListener('keydown', down)
    return () => document.removeEventListener('keydown', down)
  }, [])

  return <SearchContext.Provider value={{ open, setOpen }}>{children}</SearchContext.Provider>
}

export function useSearch(): SearchContextType {
  const context = useContext(SearchContext)
  if (!context) {
    throw new Error('useSearch must be used within SearchProvider')
  }
  return context
}
