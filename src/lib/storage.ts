// Local storage utilities for Mawazo AI

export interface JournalEntry {
  id: string
  content: string
  moods: string[]
  timestamp: string
  wordCount: number
  audioFiles?: string[] // Array of Base64 encoded audio data
  imageFiles?: string[] // Array of Base64 encoded image data
  hasAudio?: boolean
  hasImage?: boolean
}

const STORAGE_KEY = 'mawazo-entries'

export const saveEntry = (entry: Omit<JournalEntry, 'id' | 'timestamp' | 'wordCount'>) => {
  const newEntry: JournalEntry = {
    id: Date.now().toString(),
    content: entry.content,
    moods: entry.moods,
    timestamp: new Date().toISOString(),
    wordCount: entry.content.split(' ').length,
    audioFiles: entry.audioFiles,
    imageFiles: entry.imageFiles,
    hasAudio: entry.hasAudio || false,
    hasImage: entry.hasImage || false
  }
  
  const existingEntries = getEntries()
  const updatedEntries = [newEntry, ...existingEntries]
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedEntries))
  
  // Trigger storage event for other components
  window.dispatchEvent(new Event('storage'))
  
  return newEntry
}

export const getEntries = (): JournalEntry[] => {
  const entries = localStorage.getItem(STORAGE_KEY)
  return entries ? JSON.parse(entries) : []
}

export const deleteEntry = (entryId: string) => {
  const entries = getEntries()
  const updatedEntries = entries.filter(entry => entry.id !== entryId)
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedEntries))
  
  // Trigger storage event for other components
  window.dispatchEvent(new Event('storage'))
}

export const calculateStreak = (): number => {
  const entries = getEntries()
  if (entries.length === 0) return 0
  
  const today = new Date()
  let streak = 0
  
  for (let i = 0; i < 365; i++) {
    const checkDate = new Date(today)
    checkDate.setDate(today.getDate() - i)
    const dateStr = checkDate.toISOString().split('T')[0]
    
    const hasEntry = entries.some(entry => 
      entry.timestamp.startsWith(dateStr)
    )
    
    if (hasEntry) {
      streak++
    } else if (i > 0) {
      break
    }
  }
  
  return streak
}
