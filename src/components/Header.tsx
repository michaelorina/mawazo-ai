'use client'

import { motion } from 'framer-motion'
import { useState, useEffect } from 'react'
import { calculateStreak } from '@/lib/storage'
import { Flame } from 'lucide-react'

interface HeaderProps {
  streakCount: number
}

export default function Header({ streakCount }: HeaderProps) {
  const [currentStreak, setCurrentStreak] = useState(streakCount)

  useEffect(() => {
    setCurrentStreak(calculateStreak())
    
    // Listen for storage changes to update streak
    const handleStorageChange = () => {
      setCurrentStreak(calculateStreak())
    }
    
    window.addEventListener('storage', handleStorageChange)
    return () => window.removeEventListener('storage', handleStorageChange)
  }, [])
  return (
    <motion.header 
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="fixed top-0 left-0 right-0 z-40 bg-gray-900/20 backdrop-blur-xl border-b border-gray-700/30 shadow-lg w-full"
    >
      <div className="w-full px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center shadow-lg">
              <span className="text-white font-bold text-lg">M</span>
            </div>
            <div>
              <h1 className="text-lg font-bold text-white">
                Mawazo<span className='text-green-400'> AI</span>
              </h1>
              <p className="text-xs text-gray-400">your private story</p>
            </div>
          </div>
          <div className="text-right">
            <div className="flex items-center justify-end gap-2">
              <span className="text-2xl font-bold text-green-400">{currentStreak}</span>
              {currentStreak > 0 ? (
                <motion.div
                  animate={{ 
                    scale: [1, 1.1, 1],
                    rotate: [0, 5, -5, 0]
                  }}
                  transition={{ 
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                >
                  <Flame className="w-6 h-6 text-orange-500" />
                </motion.div>
              ) : (
                <Flame className="w-6 h-6 text-gray-500" />
              )}
            </div>
            <div className="text-xs text-gray-400">day streak</div>
          </div>
        </div>
      </div>
    </motion.header>
  )
}
