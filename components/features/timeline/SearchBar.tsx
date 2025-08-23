'use client'

import { Search } from "lucide-react"
import { useState } from "react"

interface SearchBarProps {
  onSearch?: (query: string) => void
  placeholder?: string
  className?: string
}

export function SearchBar({ onSearch, placeholder = "検索", className = "" }: SearchBarProps) {
  const [searchQuery, setSearchQuery] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim() && onSearch) {
      onSearch(searchQuery.trim())
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value)
    // リアルタイム検索が必要な場合はここでonSearchを呼び出す
    // if (e.target.value.trim() && onSearch) {
    //   onSearch(e.target.value.trim())
    // }
  }

  return (
    <div className={`px-4 py-3 bg-white border-b border-gray-200 ${className}`}>
      <form onSubmit={handleSubmit} className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
        <input
          type="text"
          placeholder={placeholder}
          value={searchQuery}
          onChange={handleInputChange}
          className="w-full pl-10 pr-4 py-2.5 bg-gray-100 rounded-full text-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:bg-white transition-colors"
        />
      </form>
    </div>
  )
}
