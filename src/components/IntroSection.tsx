'use client'

import { motion } from 'framer-motion'
import { Badge } from '@/components/ui/badge'
import Image from 'next/image'
import { isChromeAIAvailable } from '@/lib/ai'
import { useState, useEffect } from 'react'
import { Info, CheckCircle, AlertCircle } from 'lucide-react'

export default function IntroSection() {
  const [aiAvailable, setAiAvailable] = useState(false)
  const [showHelp, setShowHelp] = useState(false)

  useEffect(() => {
    setAiAvailable(isChromeAIAvailable())
  }, [])

  return (
    <div className="flex flex-col lg:flex-row gap-4 py-6">
      {/* Text Content - 3/4 width */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.1 }}
        className="flex-1 lg:w-3/4"
      >
        <div className="text-center lg:text-left py-4">
          <h2 className="text-2xl font-bold bg-gradient-to-r from-green-400 to-green-300 bg-clip-text text-transparent mb-3">
            Watch Your Story Unfold
          </h2>
          <p className="text-gray-300 mb-4 text-base">
            Your private journaling companion powered by Chrome&apos;s built-in AI. Capture thoughts, track moods, and let your story come to life.
          </p>
          <div className="flex flex-wrap justify-center lg:justify-start gap-2 text-sm">
            <div className="relative">
              <Badge 
                variant="secondary" 
                className={`${aiAvailable ? 'bg-green-500/20 text-green-300 border-green-400/30' : 'bg-amber-500/20 text-amber-300 border-amber-400/30'} cursor-help`}
                onMouseEnter={() => setShowHelp(true)}
                onMouseLeave={() => setShowHelp(false)}
              >
                {aiAvailable ? (
                  <>
                    <CheckCircle className="w-3 h-3 mr-1" />
                    AI Ready
                  </>
                ) : (
                  <>
                    <AlertCircle className="w-3 h-3 mr-1" />
                    AI Setup Needed
                  </>
                )}
              </Badge>
              
              {/* Help Tooltip */}
              {showHelp && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="absolute top-full left-0 mt-2 w-80 bg-gray-800 border border-gray-600 rounded-lg p-3 shadow-lg z-50"
                >
                  <div className="flex items-start gap-2">
                    <Info className="w-4 h-4 text-blue-400 mt-0.5 flex-shrink-0" />
                    <div className="text-xs text-gray-300">
                      {aiAvailable ? (
                        <div>
                          <p className="font-medium text-green-400 mb-1">Chrome AI is ready!</p>
                          <p>All AI features like enhance, translate, proofread, and mood analysis are available.</p>
                        </div>
                      ) : (
                        <div>
                          <p className="font-medium text-amber-400 mb-1">Enable Chrome AI for full features</p>
                          <p className="mb-2">To use AI features, enable Chrome&apos;s built-in AI:</p>
                          <ol className="list-decimal list-inside space-y-1 text-xs">
                            <li>Go to <code className="bg-gray-700 px-1 rounded">chrome://flags</code></li>
                            <li>Search for &quot;Chrome AI&quot;</li>
                            <li>Enable &quot;Chrome Built-in AI&quot;</li>
                            <li>Restart Chrome</li>
                          </ol>
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              )}
            </div>
            
            <Badge variant="secondary" className="bg-blue-500/20 text-blue-300 border-blue-400/30">
              🔒 Private
            </Badge>
            <Badge variant="secondary" className="bg-purple-500/20 text-purple-300 border-purple-400/30">
              📱 Offline
            </Badge>
          </div>
        </div>
      </motion.div>

      {/* Arrow Section - 1/4 width */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.3 }}
        className="flex justify-center lg:justify-start items-start lg:w-1/4 pr-6"
      >
        <div className="flex flex-col items-center space-y-2 pt-6">
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <Image src="/arrow.png" alt="Arrow pointing to notebook" width={48} height={48} className="w-10 h-10 lg:w-12 lg:h-12" />
          </motion.div>
          <span className="text-sm font-medium text-green-400 hidden lg:block">Start Writing</span>
        </div>
      </motion.div>
    </div>
  )
}
