'use client'

import { useState } from 'react'
import { Toaster } from '@/components/ui/sonner'
import Header from '@/components/Header'
import IntroSection from '@/components/IntroSection'
import JournalEntry from '@/components/JournalEntry'
import JournalEntries from '@/components/JournalEntries'

export default function Home() {
  const [streakCount] = useState(0)

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-800">
      <Toaster />
      
      <Header streakCount={streakCount} />

      <main className="px-6 pb-4 pt-20">
        <IntroSection />
        <JournalEntry />
        <JournalEntries />
      </main>
    </div>
  )
}