'use client'

import React, { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { Calendar, Clock, Heart, Search, Filter, BookOpen, Trash2, Edit3, Sparkles, Mic, Camera, ChevronDown, Smile, Frown, Star, Zap, Brain, Coffee, Moon, Star as StarIcon, Save, X } from 'lucide-react'
import { toast } from 'sonner'
import { generateLifeStory, isChromeAIAvailable, analyzeMood } from '@/lib/ai'
import { getEntries, deleteEntry, JournalEntry } from '@/lib/storage'

// JournalEntry interface is now imported from storage.ts

const moodIcons: { [key: string]: React.ComponentType<{ className?: string }> } = {
  happy: Smile,
  sad: Frown,
  excited: Star,
  anxious: Brain,
  peaceful: Heart,
  confused: Brain,
  grateful: Heart,
  motivated: Zap,
  tired: Coffee,
  reflective: Moon,
  hopeful: StarIcon
}

const moodColors: { [key: string]: string } = {
  happy: 'text-yellow-400',
  sad: 'text-blue-400',
  excited: 'text-orange-400',
  anxious: 'text-red-400',
  peaceful: 'text-green-400',
  confused: 'text-purple-400',
  grateful: 'text-pink-400',
  motivated: 'text-cyan-400',
  tired: 'text-amber-400',
  reflective: 'text-indigo-400',
  hopeful: 'text-emerald-400'
}

export default function JournalEntries() {
  const [entries, setEntries] = useState<JournalEntry[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedMood, setSelectedMood] = useState<string | null>(null)
  const [sortBy, setSortBy] = useState<'date' | 'mood' | 'words'>('date')
  const [isGeneratingStory, setIsGeneratingStory] = useState(false)
  const [generatedStory, setGeneratedStory] = useState('')
  const [showStoryPreview, setShowStoryPreview] = useState(false)
  const [expandedEntryId, setExpandedEntryId] = useState<string | null>(null)
  const [editingEntryId, setEditingEntryId] = useState<string | null>(null)
  const [editContent, setEditContent] = useState('')
  const [showMoodDropdown, setShowMoodDropdown] = useState(false)
  const [showSortDropdown, setShowSortDropdown] = useState(false)
  const moodDropdownRef = useRef<HTMLDivElement>(null)
  const sortDropdownRef = useRef<HTMLDivElement>(null)

  // Load entries from storage
  useEffect(() => {
    setEntries(getEntries())
  }, [])

  // Listen for new entries
  useEffect(() => {
    const handleStorageChange = () => {
      setEntries(getEntries())
    }

    window.addEventListener('storage', handleStorageChange)
    return () => window.removeEventListener('storage', handleStorageChange)
  }, [])

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (moodDropdownRef.current && !moodDropdownRef.current.contains(event.target as Node)) {
        setShowMoodDropdown(false)
      }
      if (sortDropdownRef.current && !sortDropdownRef.current.contains(event.target as Node)) {
        setShowSortDropdown(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const filteredEntries = entries
    .filter(entry => 
      entry.content.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .filter(entry => !selectedMood || entry.moods.includes(selectedMood))
    .sort((a, b) => {
      switch (sortBy) {
        case 'date':
          return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
        case 'words':
          return b.wordCount - a.wordCount
        case 'mood':
          return a.moods.join(',').localeCompare(b.moods.join(','))
        default:
          return 0
      }
    })

  const handleGenerateLifeStory = async () => {
    if (entries.length === 0) {
      toast.error('No entries to generate story from')
      return
    }

    setIsGeneratingStory(true)
    setGeneratedStory('')
    setShowStoryPreview(false)
    
    try {
      if (!isChromeAIAvailable()) {
        toast.error('Chrome AI APIs not available')
        return
      }
      
      const allContent = entries.map(entry => entry.content)
      
      // Generate story
      const story = await generateLifeStory(allContent)
      
      setGeneratedStory(story)
      setShowStoryPreview(true)
      
      toast.success('Life story generated!', {
        description: 'Review your story and choose to download or regenerate',
        duration: 5000
      })
    } catch (error) {
      console.error('Story generation error:', error)
      toast.error(`Story generation failed: ${(error as Error).message}`)
    }
    setIsGeneratingStory(false)
  }

  const handleDownloadStory = () => {
    if (!generatedStory) return
    
    const now = new Date()
    const date = now.toISOString().split('T')[0] // YYYY-MM-DD
    const time = now.toTimeString().split(' ')[0].replace(/:/g, '-') // HH-MM-SS
    
    const storyBlob = new Blob([generatedStory], { type: 'text/plain' })
    const storyUrl = URL.createObjectURL(storyBlob)
    const downloadLink = document.createElement('a')
    downloadLink.href = storyUrl
    downloadLink.download = `life-story-${date}-${time}.txt`
    document.body.appendChild(downloadLink)
    downloadLink.click()
    document.body.removeChild(downloadLink)
    URL.revokeObjectURL(storyUrl)
    
    toast.success('Life story downloaded!')
  }

  const handleRegenerateStory = () => {
    setShowStoryPreview(false)
    setGeneratedStory('')
    handleGenerateLifeStory()
  }

  const handleCloseStoryPreview = () => {
    setShowStoryPreview(false)
    setGeneratedStory('')
  }

  const handleAnalyzeEntryMood = async (entry: JournalEntry) => {
    if (!isChromeAIAvailable()) {
      toast.error('Chrome AI APIs not available')
      return
    }

    try {
      const analyzedMoods = await analyzeMood(entry.content)
      if (analyzedMoods.length > 0) {
        // Update the entry with analyzed moods
        const updatedEntries = entries.map(e => 
          e.id === entry.id 
            ? { ...e, moods: analyzedMoods }
            : e
        )
        setEntries(updatedEntries)
        
        // Update localStorage
        localStorage.setItem('journalEntries', JSON.stringify(updatedEntries))
        
        toast.success(`Analyzed mood: ${analyzedMoods.join(', ')}`, {
          description: 'Mood has been added to this entry'
        })
      } else {
        toast.info('No clear mood detected in this entry')
      }
    } catch (error) {
      console.error('Mood analysis failed:', error)
      toast.error('Failed to analyze mood for this entry')
    }
  }

  const handleDeleteEntry = (entryId: string) => {
    deleteEntry(entryId)
    toast.success('Entry deleted')
  }

  const handleReadFullEntry = (entry: JournalEntry) => {
    setExpandedEntryId(expandedEntryId === entry.id ? null : entry.id)
  }

  const handleEditEntry = (entry: JournalEntry) => {
    setEditingEntryId(entry.id)
    setEditContent(entry.content)
    setExpandedEntryId(entry.id) // Also expand the entry when editing
  }

  const handleSaveEdit = (entryId: string) => {
    if (!editContent.trim()) {
      toast.error('Entry content cannot be empty')
      return
    }

    const updatedEntries = entries.map(e => 
      e.id === entryId 
        ? { ...e, content: editContent.trim(), wordCount: editContent.trim().split(/\s+/).length }
        : e
    )
    setEntries(updatedEntries)
    localStorage.setItem('journalEntries', JSON.stringify(updatedEntries))
    setEditingEntryId(null)
    setEditContent('')
    toast.success('Entry updated successfully!')
  }

  const handleCancelEdit = () => {
    setEditingEntryId(null)
    setEditContent('')
  }

      const moods = ['happy', 'sad', 'excited', 'anxious', 'peaceful', 'confused', 'grateful', 'motivated', 'tired', 'reflective', 'hopeful']

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="w-full mt-4 sm:mt-8 px-2 sm:px-0"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 sm:mb-6 gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-green-400 to-green-300 bg-clip-text text-transparent">
            📚 My Journal Entries
          </h2>
          <p className="text-gray-400 mt-1 text-sm sm:text-base">Your personal stories and memories</p>
        </div>
        <div className="flex items-center gap-2 sm:gap-3">
          <Button
            onClick={handleGenerateLifeStory}
            disabled={entries.length === 0 || isGeneratingStory}
            className="bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white"
          >
            <Sparkles className="w-4 h-4 mr-2" />
            {isGeneratingStory ? 'Generating...' : 'Generate Life Story'}
          </Button>
        <Badge variant="outline" className="bg-green-500/10 border-green-400/30 text-green-400">
          {entries.length} entries
        </Badge>
        </div>
      </div>

      {/* Story Generation Progress */}
      {isGeneratingStory && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 p-4 bg-purple-500/10 border border-purple-400/30 rounded-lg"
        >
          <div className="flex items-center gap-3 mb-3">
            <Sparkles className="w-5 h-5 text-purple-400 animate-pulse" />
            <h3 className="text-lg font-semibold text-purple-300">Generating Your Life Story...</h3>
          </div>
          <div className="bg-gray-800/50 rounded-lg p-4">
            <div className="flex items-center gap-3">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-400"></div>
              <p className="text-gray-300">Creating your witty life reflection...</p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Story Preview */}
      {showStoryPreview && generatedStory && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 p-6 bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-400/30 rounded-lg"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <BookOpen className="w-6 h-6 text-purple-400" />
              <h3 className="text-xl font-bold text-purple-300">Your Life Story</h3>
            </div>
            <button
              onClick={handleCloseStoryPreview}
              className="text-gray-400 hover:text-white transition-colors"
            >
              ✕
            </button>
          </div>
          
          <div className="bg-gray-900/50 rounded-lg p-6 max-h-96 overflow-y-auto mb-4">
            <p className="text-gray-200 leading-relaxed whitespace-pre-wrap">
              {generatedStory}
            </p>
      </div>
          
          <div className="flex gap-3">
            <Button
              onClick={handleDownloadStory}
              className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white"
            >
              📥 Download Story
            </Button>
            <Button
              onClick={handleRegenerateStory}
              variant="outline"
              className="border-purple-400/50 text-purple-300 hover:bg-purple-500/10"
            >
              🔄 Regenerate
            </Button>
            <Button
              onClick={handleCloseStoryPreview}
              variant="outline"
              className="border-gray-400/50 text-gray-300 hover:bg-gray-500/10"
            >
              🗑️ Clear Story
            </Button>
          </div>
        </motion.div>
      )}

      {/* Search and Filter Controls */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-gray-800/40 backdrop-blur-sm border border-gray-700/40 rounded-xl p-6 mb-6"
      >
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search your entries..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-gray-700/60 border border-gray-600/40 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-400/50 focus:border-green-400/50 hover:bg-gray-600/60 transition-colors"
            />
          </div>

          {/* Filters Row */}
          <div className="flex flex-col sm:flex-row gap-4">
          {/* Mood Filter */}
            <div className="flex items-center gap-3">
              <Filter className="text-gray-400 w-5 h-5 flex-shrink-0" />
              <div className="relative" ref={moodDropdownRef}>
                <button
                  onClick={() => setShowMoodDropdown(!showMoodDropdown)}
                  className="flex items-center justify-between px-4 py-3 bg-gray-700/60 border border-gray-600/40 rounded-lg text-white hover:bg-gray-600/60 transition-colors cursor-pointer min-w-[160px]"
                >
                  <span className="flex items-center gap-2">
                    {selectedMood ? (
                      <>
                        {React.createElement(moodIcons[selectedMood], { className: `w-4 h-4 ${moodColors[selectedMood]}` })}
                        {selectedMood.charAt(0).toUpperCase() + selectedMood.slice(1)}
                      </>
                    ) : (
                      'All moods'
                    )}
                  </span>
                  <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${showMoodDropdown ? 'rotate-180' : ''}`} />
                </button>
                
                {showMoodDropdown && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="absolute top-full left-0 right-0 mt-1 bg-gray-800 border border-gray-600/40 rounded-lg shadow-lg z-50 max-h-60 overflow-y-auto"
                  >
                    <button
                      onClick={() => {
                        setSelectedMood(null)
                        setShowMoodDropdown(false)
                      }}
                      className="w-full px-4 py-3 text-left text-white hover:bg-gray-700/60 transition-colors rounded-t-lg flex items-center gap-2"
                    >
                      <Filter className="w-4 h-4 text-gray-400" />
                      All moods
                    </button>
                    {moods.map((mood, index) => (
                      <button
                        key={mood}
                        onClick={() => {
                          setSelectedMood(mood)
                          setShowMoodDropdown(false)
                        }}
                        className={`w-full px-4 py-3 text-left text-white hover:bg-gray-700/60 transition-colors flex items-center gap-2 ${
                          index === moods.length - 1 ? 'rounded-b-lg' : ''
                        }`}
                      >
                        {React.createElement(moodIcons[mood], { className: `w-4 h-4 ${moodColors[mood]}` })}
                        <span>{mood.charAt(0).toUpperCase() + mood.slice(1)}</span>
                      </button>
                    ))}
                  </motion.div>
                )}
              </div>
          </div>

          {/* Sort */}
            <div className="flex items-center gap-3">
              <div className="relative" ref={sortDropdownRef}>
                <button
                  onClick={() => setShowSortDropdown(!showSortDropdown)}
                  className="flex items-center justify-between px-4 py-3 bg-gray-700/60 border border-gray-600/40 rounded-lg text-white hover:bg-gray-600/60 transition-colors cursor-pointer min-w-[160px]"
                >
                  <span className="flex items-center gap-2">
                    {sortBy === 'date' && (
                      <>
                        <Calendar className="w-4 h-4 text-blue-400" />
                        Sort by date
                      </>
                    )}
                    {sortBy === 'words' && (
                      <>
                        <Edit3 className="w-4 h-4 text-green-400" />
                        Sort by length
                      </>
                    )}
                    {sortBy === 'mood' && (
                      <>
                        <Smile className="w-4 h-4 text-yellow-400" />
                        Sort by mood
                      </>
                    )}
                  </span>
                  <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${showSortDropdown ? 'rotate-180' : ''}`} />
                </button>
                
                {showSortDropdown && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="absolute top-full left-0 right-0 mt-1 bg-gray-800 border border-gray-600/40 rounded-lg shadow-lg z-50"
                  >
                    <button
                      onClick={() => {
                        setSortBy('date')
                        setShowSortDropdown(false)
                      }}
                      className="w-full px-4 py-3 text-left text-white hover:bg-gray-700/60 transition-colors flex items-center gap-2 rounded-t-lg"
                    >
                      <Calendar className="w-4 h-4 text-blue-400" />
                      Sort by date
                    </button>
                    <button
                      onClick={() => {
                        setSortBy('words')
                        setShowSortDropdown(false)
                      }}
                      className="w-full px-4 py-3 text-left text-white hover:bg-gray-700/60 transition-colors flex items-center gap-2"
                    >
                      <Edit3 className="w-4 h-4 text-green-400" />
                      Sort by length
                    </button>
                    <button
                      onClick={() => {
                        setSortBy('mood')
                        setShowSortDropdown(false)
                      }}
                      className="w-full px-4 py-3 text-left text-white hover:bg-gray-700/60 transition-colors flex items-center gap-2 rounded-b-lg"
                    >
                      <Smile className="w-4 h-4 text-yellow-400" />
                      Sort by mood
                    </button>
                  </motion.div>
                )}
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Entries Grid */}
      <div className="grid gap-3 sm:gap-4">
        {filteredEntries.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-12"
          >
            <BookOpen className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-400 mb-2">No entries found</h3>
            <p className="text-gray-500">
              {searchTerm || selectedMood 
                ? 'Try adjusting your search or filter criteria'
                : 'Start writing your first journal entry to see it here!'
              }
            </p>
          </motion.div>
        ) : (
          filteredEntries.map((entry, index) => (
            <motion.div
              key={entry.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * index }}
              className="bg-gradient-to-br from-gray-800/40 via-gray-900/30 to-gray-800/20 border border-gray-700/30 rounded-xl p-4 sm:p-6 hover:border-green-400/30 transition-all duration-300 group"
            >
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between mb-3 gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-2">
                    <h3 className="text-lg sm:text-xl font-semibold text-white group-hover:text-green-400 transition-colors">
                      Journal Entry
                    </h3>
                    <div className="flex flex-wrap gap-1 max-w-full">
                      {entry.moods.map((mood, index) => (
                        <Badge key={index} variant="outline" className="bg-gray-700/50 border-gray-600/30 text-gray-300 text-xs px-1 py-0.5 truncate max-w-[80px] flex items-center gap-1">
                          {React.createElement(moodIcons[mood], { 
                            className: `w-3 h-3 ${moodColors[mood]}` 
                          })}
                          <span className="truncate">{mood}</span>
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-1 sm:gap-2 text-xs sm:text-sm text-gray-400 mb-3">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3 h-3 sm:w-4 sm:h-4 text-blue-400" />
                      <span className="truncate">
                        {new Date(entry.timestamp).toLocaleDateString('en-US', { 
                        weekday: 'short', 
                        month: 'short', 
                        day: 'numeric' 
                      })}
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3 sm:w-4 sm:h-4 text-green-400" />
                      <span className="truncate">
                        {new Date(entry.timestamp).toLocaleTimeString('en-US', {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Heart className="w-3 h-3 sm:w-4 sm:h-4 text-pink-400" />
                      <span className="truncate">{entry.wordCount}w</span>
                    </div>
                    {entry.hasAudio && (
                      <div className="flex items-center gap-1">
                        <Mic className="w-3 h-3 sm:w-4 sm:h-4 text-blue-400" />
                        <span className="text-blue-400 truncate">
                          A{entry.audioFiles && entry.audioFiles.length > 1 ? entry.audioFiles.length : ''}
                        </span>
                      </div>
                    )}
                    {entry.hasImage && (
                      <div className="flex items-center gap-1">
                        <Camera className="w-3 h-3 sm:w-4 sm:h-4 text-purple-400" />
                        <span className="text-purple-400 truncate">
                          I{entry.imageFiles && entry.imageFiles.length > 1 ? entry.imageFiles.length : ''}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEditEntry(entry)}
                    className="bg-gray-700/50 border-gray-600/30 text-gray-300 hover:bg-green-500/20 hover:border-green-400/50 p-2 sm:p-2"
                    title="Edit this entry"
                  >
                    <Edit3 className="w-3 h-3 sm:w-4 sm:h-4 text-green-400" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleAnalyzeEntryMood(entry)}
                    className="bg-gray-700/50 border-gray-600/30 text-gray-300 hover:bg-purple-500/20 hover:border-purple-400/50 p-2 sm:p-2"
                    title="Analyze mood for this entry"
                  >
                    <Sparkles className="w-3 h-3 sm:w-4 sm:h-4 text-purple-400" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDeleteEntry(entry.id)}
                    className="bg-gray-700/50 border-gray-600/30 text-gray-300 hover:bg-red-500/20 hover:border-red-400/50 p-2 sm:p-2"
                  >
                    <Trash2 className="w-3 h-3 sm:w-4 sm:h-4 text-red-400" />
                  </Button>
                </div>
              </div>
              
              {editingEntryId === entry.id ? (
                <div className="space-y-3">
                  <Textarea
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                    className="min-h-[120px] bg-gray-800/50 border-gray-600/30 text-gray-300 placeholder-gray-500 resize-none"
                    placeholder="Edit your journal entry..."
                  />
                  <div className="flex gap-2">
                    <Button
                      onClick={() => handleSaveEdit(entry.id)}
                      size="sm"
                      className="bg-green-500 hover:bg-green-600 text-white"
                    >
                      <Save className="w-4 h-4 mr-1 text-white" />
                      Save
                    </Button>
                    <Button
                      onClick={handleCancelEdit}
                      variant="outline"
                      size="sm"
                      className="border-gray-600/30 text-gray-300 hover:bg-gray-700/50"
                    >
                      <X className="w-4 h-4 mr-1 text-gray-300" />
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <>
                  <p className={`text-gray-300 leading-relaxed text-sm sm:text-base break-words overflow-hidden hyphens-auto max-w-full ${
                    expandedEntryId === entry.id ? '' : 'line-clamp-3'
                  }`}>
                    {entry.content}
              </p>
              
              <div className="mt-4 pt-4 border-t border-gray-700/30">
                <Button
                  variant="outline"
                  size="sm"
                      onClick={() => handleReadFullEntry(entry)}
                  className="bg-transparent border-green-400/30 text-green-400 hover:bg-green-500/10 hover:border-green-400/50"
                >
                      {expandedEntryId === entry.id ? 'Show Less' : 'Read Full Entry'}
                </Button>
              </div>
                </>
              )}
            </motion.div>
          ))
        )}
      </div>
    </motion.div>
  )
}

