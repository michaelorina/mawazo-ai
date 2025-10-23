'use client'

import { useState } from 'react'

// Declare LanguageModel and MediaRecorder for TypeScript
declare global {
  interface Window {
    LanguageModel?: {
      create: (options?: { systemPrompt?: string }) => Promise<{
        prompt: (prompt: string) => Promise<string>
      }>
    }
    currentMediaRecorder?: MediaRecorder
  }
}
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Mic, Camera, PenTool, FileText, Globe, CheckCircle, Smile, Frown, Zap, Heart, Brain, HelpCircle, ThumbsUp, Target, Wand2, RotateCcw, Coffee, Moon, Star, Sparkles } from 'lucide-react'
import { toast } from 'sonner'
import { enhanceWriting, summarizeContent, generateJournalPrompt, translateEntry, proofreadEntry, analyzeMood, isChromeAIAvailable } from '@/lib/ai'
import { saveEntry } from '@/lib/storage'

const moods = [
  { icon: Smile, label: 'Happy', value: 'happy', color: 'text-yellow-400' },
  { icon: Frown, label: 'Sad', value: 'sad', color: 'text-blue-400' },
  { icon: Zap, label: 'Excited', value: 'excited', color: 'text-orange-400' },
  { icon: Heart, label: 'Anxious', value: 'anxious', color: 'text-red-400' },
  { icon: Brain, label: 'Peaceful', value: 'peaceful', color: 'text-green-400' },
  { icon: HelpCircle, label: 'Confused', value: 'confused', color: 'text-gray-400' },
  { icon: ThumbsUp, label: 'Grateful', value: 'grateful', color: 'text-purple-400' },
  { icon: Target, label: 'Motivated', value: 'motivated', color: 'text-pink-400' },
  { icon: Coffee, label: 'Tired', value: 'tired', color: 'text-amber-400' },
  { icon: Moon, label: 'Reflective', value: 'reflective', color: 'text-indigo-400' },
  { icon: Star, label: 'Hopeful', value: 'hopeful', color: 'text-cyan-400' },
]

const languages = [
  { code: 'es', name: 'Spanish', flag: '🇪🇸' },
  { code: 'fr', name: 'French', flag: '🇫🇷' },
  { code: 'de', name: 'German', flag: '🇩🇪' },
  { code: 'it', name: 'Italian', flag: '🇮🇹' },
  { code: 'pt', name: 'Portuguese', flag: '🇵🇹' },
  { code: 'ru', name: 'Russian', flag: '🇷🇺' },
  { code: 'ja', name: 'Japanese', flag: '🇯🇵' },
  { code: 'ko', name: 'Korean', flag: '🇰🇷' },
  { code: 'zh', name: 'Chinese', flag: '🇨🇳' },
  { code: 'ar', name: 'Arabic', flag: '🇸🇦' },
  { code: 'hi', name: 'Hindi', flag: '🇮🇳' },
  { code: 'nl', name: 'Dutch', flag: '🇳🇱' },
]

export default function JournalEntry() {
  const [journalText, setJournalText] = useState('')
  const [selectedMoods, setSelectedMoods] = useState<string[]>([])
  const [isProcessing, setIsProcessing] = useState(false)
  const [enhancedText, setEnhancedText] = useState('')
  const [audioFiles, setAudioFiles] = useState<string[]>([])
  const [imageFiles, setImageFiles] = useState<string[]>([])
  const [isRecording, setIsRecording] = useState(false)
  const [summaryText, setSummaryText] = useState('')
  const [translatedText, setTranslatedText] = useState('')
  const [showLanguageSelect, setShowLanguageSelect] = useState(false)
  const [proofreadText, setProofreadText] = useState('')


  const handleMoodSelect = (mood: string) => {
    setSelectedMoods(prev => {
      if (prev.includes(mood)) {
        // Remove mood if already selected
        const newMoods = prev.filter(m => m !== mood)
        toast.success(`Removed ${mood} mood`)
        return newMoods
      } else {
        // Add mood if not selected
        const newMoods = [...prev, mood]
        toast.success(`Added ${mood} mood`)
        return newMoods
      }
    })
  }

  const handleSaveEntry = () => {
    if (!journalText.trim()) {
      toast.error('Please write something before saving!')
      return
    }
    
    const contentToSave = enhancedText || journalText
    
    // Save using storage utility - instant save without mood analysis
    saveEntry({
      content: contentToSave,
      moods: selectedMoods,
      audioFiles: audioFiles.length > 0 ? audioFiles : undefined,
      imageFiles: imageFiles.length > 0 ? imageFiles : undefined,
      hasAudio: audioFiles.length > 0,
      hasImage: imageFiles.length > 0
    })
    
    toast.success('Entry saved successfully!')
    setJournalText('')
    setSelectedMoods([])
    setEnhancedText('')
    setAudioFiles([])
    setImageFiles([])
    setIsRecording(false)
  }

  const handleVoiceInput = async () => {
    // If already recording, stop the recording
    if (isRecording) {
      stopVoiceRecording()
      return
    }

    try {
      // Request microphone access
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      
      // Create MediaRecorder
      const mediaRecorder = new MediaRecorder(stream)
      const audioChunks: Blob[] = []
      
      mediaRecorder.ondataavailable = (event) => {
        audioChunks.push(event.data)
      }
      
      mediaRecorder.onstop = () => {
        // Create audio blob
        const audioBlob = new Blob(audioChunks, { type: 'audio/wav' })
        
        // Convert to base64
        const reader = new FileReader()
        reader.onload = () => {
          const base64Audio = reader.result as string
          setAudioFiles(prev => [...prev, base64Audio])
          toast.success(`Audio recorded and attached! (${audioFiles.length + 1} audio file${audioFiles.length + 1 > 1 ? 's' : ''})`)
        }
        reader.readAsDataURL(audioBlob)
        
        // Stop all tracks
        stream.getTracks().forEach(track => track.stop())
        setIsRecording(false)
      }
      
      // Start recording
      mediaRecorder.start()
      setIsRecording(true)
      toast.info('🎤 Recording... Click "Stop Recording" to finish!')
      
      // Store mediaRecorder reference for stopping
      window.currentMediaRecorder = mediaRecorder
      
    } catch (error) {
      console.error('Microphone access error:', error)
      toast.error('Microphone access denied or not available')
      setIsRecording(false)
    }
  }

  const stopVoiceRecording = () => {
    const mediaRecorder = window.currentMediaRecorder
    if (mediaRecorder && mediaRecorder.state === 'recording') {
      mediaRecorder.stop()
      delete window.currentMediaRecorder
      setIsRecording(false)
      toast.info('Stopping recording...')
    }
  }

  const handlePhotoInput = () => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = 'image/*'
    input.multiple = true // Allow multiple file selection
    input.onchange = (e) => {
      const files = (e.target as HTMLInputElement).files
      if (files && files.length > 0) {
        let processedCount = 0
        const totalFiles = files.length
        
        Array.from(files).forEach((file) => {
          // Convert image to base64
          const reader = new FileReader()
          reader.onload = () => {
            const base64Image = reader.result as string
            setImageFiles(prev => [...prev, base64Image])
            processedCount++
            
            if (processedCount === totalFiles) {
              toast.success(`${totalFiles} image${totalFiles > 1 ? 's' : ''} attached to entry!`)
            }
          }
          reader.readAsDataURL(file)
        })
      }
    }
    input.click()
  }

  const handleAIPrompt = async () => {
    setIsProcessing(true)
    try {
      if (!isChromeAIAvailable()) {
        toast.error('Chrome AI APIs not available')
        return
      }
      
      const prompt = await generateJournalPrompt()
      
      // If there's existing text, add the prompt on a new line
      if (journalText.trim()) {
        setJournalText(prevText => prevText + '\n\n' + prompt)
      } else {
        // If no existing text, just set the prompt
        setJournalText(prompt)
      }
      
      toast.success('AI prompt added!')
    } catch (error) {
      console.error('AI prompt error:', error)
      toast.error(`Failed to generate prompt: ${(error as Error).message}`)
    }
    setIsProcessing(false)
  }

  const handleClearForm = () => {
    // Check if there's any content to clear
    const hasContent = journalText.trim() || selectedMoods.length > 0 || audioFiles.length > 0 || imageFiles.length > 0 || enhancedText.trim() || summaryText.trim() || translatedText.trim() || proofreadText.trim()
    
    if (!hasContent) {
      toast.info('Form is already empty!')
      return
    }

    // Clear all form data
    setJournalText('')
    setSelectedMoods([])
    setAudioFiles([])
    setImageFiles([])
    setEnhancedText('')
    setSummaryText('')
    setTranslatedText('')
    setProofreadText('')
    setShowLanguageSelect(false)
    setIsRecording(false)
    
    toast.success('Form cleared!')
  }

  const handleImproveWriting = async () => {
    if (!journalText.trim()) {
      toast.error('Write something first!')
      return
    }

    setIsProcessing(true)
    try {
      if (!isChromeAIAvailable()) {
        toast.error('Chrome AI APIs not available')
        return
      }
      
      const enhanced = await enhanceWriting(journalText)
      setEnhancedText(enhanced)
      toast.success('Writing enhanced with AI!')
    } catch (error) {
      console.error('AI enhancement error:', error)
      toast.error(`AI enhancement failed: ${(error as Error).message}`)
    }
    setIsProcessing(false)
  }

  const handleSummarize = async () => {
    if (!journalText.trim()) {
      toast.error('Write something first!')
      return
    }

    setIsProcessing(true)
    try {
      if (!isChromeAIAvailable()) {
        toast.error('Chrome AI APIs not available')
        return
      }
      
      const summary = await summarizeContent(journalText)
      setSummaryText(summary)
      toast.success('Summary generated!')
    } catch (error) {
      console.error('AI summarization error:', error)
      toast.error(`Summary failed: ${(error as Error).message}`)
    }
    setIsProcessing(false)
  }

  const handleSaveSummary = () => {
    if (!summaryText.trim()) {
      toast.error('No summary to save!')
      return
    }

    // Save summary as a separate entry
    saveEntry({
      content: `📝 SUMMARY:\n\n${summaryText}`,
      moods: ['reflective'] // Default mood for summaries
    })
    
    toast.success('Summary saved as separate entry!')
    setSummaryText('')
  }

  const handleDownloadSummary = () => {
    if (!summaryText.trim()) {
      toast.error('No summary to download!')
      return
    }

    // Create a downloadable summary file
    const now = new Date()
    const date = now.toISOString().split('T')[0] // YYYY-MM-DD
    const time = now.toTimeString().split(' ')[0].replace(/:/g, '-') // HH-MM-SS
    
    const summaryBlob = new Blob([summaryText], { type: 'text/plain' })
    const summaryUrl = URL.createObjectURL(summaryBlob)
    const downloadLink = document.createElement('a')
    downloadLink.href = summaryUrl
    downloadLink.download = `journal-summary-${date}-${time}.txt`
    document.body.appendChild(downloadLink)
    downloadLink.click()
    document.body.removeChild(downloadLink)
    URL.revokeObjectURL(summaryUrl)
    
    toast.success('Summary downloaded!')
  }

  const handleTranslate = () => {
    if (!journalText.trim()) {
      toast.error('Write something first!')
      return
    }

    // Show language selection
    setShowLanguageSelect(true)
  }

  const handleLanguageSelect = async (languageCode: string) => {
    const selectedLanguage = languages.find(lang => lang.code === languageCode)
    if (!selectedLanguage) return

    setIsProcessing(true)
    setShowLanguageSelect(false)
    
    try {
      if (!isChromeAIAvailable()) {
        toast.error('Chrome AI APIs not available')
        return
      }
      
      const translated = await translateEntry(journalText, languageCode)
      setTranslatedText(translated)
      toast.success(`Translated to ${selectedLanguage.name}!`)
    } catch (error) {
      console.error('AI translation error:', error)
      toast.error(`Translation failed: ${(error as Error).message}`)
    }
    setIsProcessing(false)
  }

  const handleProofread = async () => {
    if (!journalText.trim()) {
      toast.error('Write something first!')
      return
    }

    setIsProcessing(true)
    try {
      if (!isChromeAIAvailable()) {
        toast.error('Chrome AI APIs not available')
        return
      }
      
      const proofread = await proofreadEntry(journalText)
      setProofreadText(proofread)
      toast.success('Text proofread and corrected!')
    } catch (error) {
      console.error('AI proofreading error:', error)
      toast.error(`Proofreading failed: ${(error as Error).message}`)
    }
    setIsProcessing(false)
  }

  const handleAnalyzeMood = async () => {
    if (!journalText.trim()) {
      toast.error('Write something first!')
      return
    }

    setIsProcessing(true)
    try {
      const analyzedMoods = await analyzeMood(journalText)
      if (analyzedMoods.length > 0) {
        // Update selected moods with analyzed ones
        setSelectedMoods(analyzedMoods)
        toast.success(`Detected mood: ${analyzedMoods.join(', ')}`, {
          description: 'Mood has been automatically selected for you'
        })
      } else {
        toast.info('No clear mood detected in your text')
      }
    } catch (error) {
      console.error('AI mood analysis error:', error)
      toast.error(`Mood analysis failed: ${(error as Error).message}`)
    }
    setIsProcessing(false)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4 }}
      className="w-full max-w-full mt-2 px-2 sm:px-0"
    >
          {/* Recording Banner */}
          {isRecording && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-4 bg-red-500/20 border border-red-400/50 rounded-lg p-3"
            >
              <div className="flex items-center justify-center gap-3">
                <div className="w-3 h-3 bg-red-400 rounded-full animate-pulse"></div>
                <span className="text-red-300 font-medium">🎤 Recording in progress...</span>
                <div className="w-3 h-3 bg-red-400 rounded-full animate-pulse"></div>
              </div>
            </motion.div>
          )}

      {/* Notebook Paper Background */}
      <div className="relative bg-gradient-to-br from-gray-800/30 via-gray-900/40 to-gray-800/20 min-h-[400px] rounded-2xl border border-gray-700/30 shadow-2xl overflow-hidden w-full max-w-full">
        {/* Paper texture lines */}
        <div className="absolute inset-0 opacity-5 pointer-events-none">
          {Array.from({ length: 15 }).map((_, i) => (
            <div
              key={i}
              className="h-px bg-gray-400/20"
              style={{ top: `${i * 25 + 30}px` }}
            />
          ))}
        </div>
        
        {/* Spiral binding effect */}
        <div className="absolute left-0 top-0 w-8 h-full bg-gradient-to-b from-gray-600/10 to-gray-800/15 pointer-events-none">
          {Array.from({ length: 12 }).map((_, i) => (
            <div
              key={i}
              className="absolute w-2 h-2 border-2 border-gray-500/20 rounded-full"
              style={{ top: `${i * 30 + 15}px`, left: '12px' }}
            />
          ))}
        </div>

        <div className="pl-8 sm:pl-12 pr-4 sm:pr-8 py-4 overflow-hidden">
          
          {/* Header Section */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
            className="mb-3"
          >
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <div className="flex-1">
                <h2 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-green-400 to-green-300 bg-clip-text text-transparent">
                  📝 My Journal Entry
                </h2>
                <div className="flex flex-wrap items-center gap-1 sm:gap-2 mt-1 sm:mt-2 text-xs sm:text-sm text-gray-400">
                  <span>{new Date().toLocaleDateString()}</span>
                  <span>•</span>
                  <span>{journalText.length} chars</span>
                  <span>•</span>
                  <span>{journalText.split(' ').filter(word => word.length > 0).length} words</span>
                  {selectedMoods.length > 0 && (
                    <>
                      <span>•</span>
                      <span className="text-green-400 font-medium">{selectedMoods.length} mood{selectedMoods.length > 1 ? 's' : ''}</span>
                    </>
                  )}
                </div>
              </div>
              <div className="flex items-center space-x-2 flex-shrink-0">
                {isRecording ? (
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-red-400 rounded-full animate-pulse"></div>
                    <span className="text-xs text-red-400 font-medium">Recording...</span>
                  </div>
                ) : (
                  <>
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                    <span className="text-xs text-gray-400">Writing...</span>
                  </>
                )}
              </div>
            </div>
          </motion.div>

          {/* Main Writing Area */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="relative mb-3"
          >
            <Textarea
              placeholder="✨ Start writing your thoughts here... Let your mind flow freely. What made you smile today? What are you grateful for? What's weighing on your mind?"
              value={journalText}
              onChange={(e) => {
                setJournalText(e.target.value)
                if (enhancedText) {
                  setEnhancedText('') // Clear enhanced text when user types
                }
              }}
              className="w-full min-h-[150px] bg-transparent border-none text-gray-200 placeholder-gray-500 text-base leading-relaxed resize-none focus:outline-none focus:ring-0"
            />
            {enhancedText && (
              <div className="mt-2 p-3 bg-green-500/10 border border-green-400/30 rounded-lg">
                <p className="text-sm text-green-300 mb-2">✨ AI Enhanced Version:</p>
                <p className="text-gray-200 italic">{enhancedText}</p>
                <div className="mt-2 flex gap-2">
                  <button
                    onClick={() => {
                      setJournalText(enhancedText)
                      setEnhancedText('')
                    }}
                    className="text-xs bg-green-500/20 text-green-300 px-2 py-1 rounded hover:bg-green-500/30"
                  >
                    Use Enhanced Version
                  </button>
                  <button
                    onClick={() => setEnhancedText('')}
                    className="text-xs text-gray-400 hover:text-white"
                  >
                    Keep Original
                  </button>
                </div>
              </div>
            )}

            {/* Summary Preview */}
            {summaryText && (
              <div className="mt-3 p-3 bg-blue-500/10 border border-blue-400/30 rounded-lg">
                <p className="text-sm text-blue-300 mb-2">📄 AI Summary (4 sentences):</p>
                <p className="text-gray-200 italic leading-relaxed">{summaryText}</p>
                <div className="mt-3 flex gap-2">
                  <button
                    onClick={handleSaveSummary}
                    className="text-xs bg-blue-500/20 text-blue-300 px-3 py-1 rounded hover:bg-blue-500/30 transition-colors"
                  >
                    Save as Entry
                  </button>
                  <button
                    onClick={handleDownloadSummary}
                    className="text-xs bg-green-500/20 text-green-300 px-3 py-1 rounded hover:bg-green-500/30 transition-colors"
                  >
                    Download
                  </button>
                  <button
                    onClick={() => setSummaryText('')}
                    className="text-xs text-gray-400 hover:text-white transition-colors"
                  >
                    Dismiss
                  </button>
                </div>
              </div>
            )}

            {/* Language Selection */}
            {showLanguageSelect && (
              <div className="mt-3 p-3 bg-purple-500/10 border border-purple-400/30 rounded-lg">
                <p className="text-sm text-purple-300 mb-3">🌍 Select language to translate to:</p>
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                  {languages.map((language) => (
                    <button
                      key={language.code}
                      onClick={() => handleLanguageSelect(language.code)}
                      className="flex flex-col items-center p-2 bg-gray-700/50 border border-gray-600/30 rounded-lg hover:bg-purple-500/20 hover:border-purple-400/50 transition-all duration-200"
                    >
                      <span className="text-lg mb-1">{language.flag}</span>
                      <span className="text-xs text-gray-300">{language.name}</span>
                    </button>
                  ))}
                </div>
                <button
                  onClick={() => setShowLanguageSelect(false)}
                  className="mt-3 text-xs text-gray-400 hover:text-white transition-colors"
                >
                  Cancel
                </button>
              </div>
            )}

            {/* Translation Preview */}
            {translatedText && (
              <div className="mt-3 p-3 bg-purple-500/10 border border-purple-400/30 rounded-lg">
                <p className="text-sm text-purple-300 mb-2">🌍 Translation:</p>
                <p className="text-gray-200 italic leading-relaxed">{translatedText}</p>
                <div className="mt-3 flex gap-2">
                  <button
                    onClick={() => {
                      setJournalText(translatedText)
                      setTranslatedText('')
                    }}
                    className="text-xs bg-purple-500/20 text-purple-300 px-3 py-1 rounded hover:bg-purple-500/30 transition-colors"
                  >
                    Use Translation
                  </button>
                  <button
                    onClick={() => setTranslatedText('')}
                    className="text-xs text-gray-400 hover:text-white transition-colors"
                  >
                    Dismiss
                  </button>
                </div>
              </div>
            )}

            {/* Proofread Preview */}
            {proofreadText && (
              <div className="mt-3 p-3 bg-yellow-500/10 border border-yellow-400/30 rounded-lg">
                <p className="text-sm text-yellow-300 mb-2">✏️ Proofread & Corrected:</p>
                <p className="text-gray-200 italic leading-relaxed">{proofreadText}</p>
                <div className="mt-3 flex gap-2">
                  <button
                    onClick={() => {
                      setJournalText(proofreadText)
                      setProofreadText('')
                    }}
                    className="text-xs bg-yellow-500/20 text-yellow-300 px-3 py-1 rounded hover:bg-yellow-500/30 transition-colors"
                  >
                    Use Corrected Version
                  </button>
                  <button
                    onClick={() => setProofreadText('')}
                    className="text-xs text-gray-400 hover:text-white transition-colors"
                  >
                    Keep Original
                  </button>
                </div>
              </div>
            )}

            {/* Attached Media Preview */}
            {(audioFiles.length > 0 || imageFiles.length > 0) && (
              <div className="mt-3 p-3 bg-gray-700/30 border border-gray-600/30 rounded-lg">
                <p className="text-sm text-gray-300 mb-2">📎 Attached Media:</p>
                <div className="flex flex-wrap gap-2">
                  {audioFiles.map((_, index) => (
                    <div key={`audio-${index}`} className="flex items-center gap-2 bg-blue-500/10 border border-blue-400/30 rounded-lg px-2 py-1">
                      <Mic className="w-3 h-3 text-blue-400" />
                      <span className="text-xs text-blue-300">Audio {index + 1}</span>
                      <button
                        onClick={() => setAudioFiles(prev => prev.filter((_, i) => i !== index))}
                        className="text-xs text-gray-400 hover:text-red-400 ml-1"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                  {imageFiles.map((_, index) => (
                    <div key={`image-${index}`} className="flex items-center gap-2 bg-purple-500/10 border border-purple-400/30 rounded-lg px-2 py-1">
                      <Camera className="w-3 h-3 text-purple-400" />
                      <span className="text-xs text-purple-300">Image {index + 1}</span>
                      <button
                        onClick={() => setImageFiles(prev => prev.filter((_, i) => i !== index))}
                        className="text-xs text-gray-400 hover:text-red-400 ml-1"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Writing indicator */}
            {journalText.length > 0 && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="absolute top-4 right-4"
              >
                <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
              </motion.div>
            )}

          </motion.div>


          {/* AI Tools Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="grid grid-cols-2 lg:grid-cols-5 gap-2 mb-3"
          >
            <motion.button
              whileHover={{ scale: 1.05, rotate: 1 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleImproveWriting}
              disabled={!journalText.trim() || isProcessing}
              className="flex flex-col items-center space-y-2 p-3 bg-gray-800/40 border border-gray-600/30 rounded-lg transition-all hover:bg-green-500/10 hover:border-green-400/50 disabled:opacity-50 disabled:cursor-not-allowed group"
            >
              <PenTool className="w-6 h-6 text-green-400 group-hover:animate-pulse" />
              <div className="text-center">
                <div className="font-medium text-sm text-white">Improve</div>
                <div className="text-xs text-gray-400">Writing Style</div>
              </div>
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.05, rotate: -1 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleSummarize}
              disabled={!journalText.trim() || isProcessing}
              className="flex flex-col items-center space-y-2 p-3 bg-gray-800/40 border border-gray-600/30 rounded-lg transition-all hover:bg-green-500/10 hover:border-green-400/50 disabled:opacity-50 disabled:cursor-not-allowed group"
            >
              <FileText className="w-6 h-6 text-green-400 group-hover:animate-pulse" />
              <div className="text-center">
                <div className="font-medium text-sm text-white">Summary</div>
                <div className="text-xs text-gray-400">Key Points</div>
              </div>
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.05, rotate: 1 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleTranslate}
              disabled={!journalText.trim() || isProcessing}
              className="flex flex-col items-center space-y-2 p-3 bg-gray-800/40 border border-gray-600/30 rounded-lg transition-all hover:bg-green-500/10 hover:border-green-400/50 disabled:opacity-50 disabled:cursor-not-allowed group"
            >
              <Globe className="w-6 h-6 text-green-400 group-hover:animate-pulse" />
              <div className="text-center">
                <div className="font-medium text-sm text-white">Translate</div>
                <div className="text-xs text-gray-400">Languages</div>
              </div>
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.05, rotate: -1 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleProofread}
              disabled={!journalText.trim() || isProcessing}
              className="flex flex-col items-center space-y-2 p-3 bg-gray-800/40 border border-gray-600/30 rounded-lg transition-all hover:bg-green-500/10 hover:border-green-400/50 disabled:opacity-50 disabled:cursor-not-allowed group"
            >
              <CheckCircle className="w-6 h-6 text-green-400 group-hover:animate-pulse" />
              <div className="text-center">
                <div className="font-medium text-sm text-white">Proofread</div>
                <div className="text-xs text-gray-400">Grammar</div>
              </div>
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.05, rotate: 1 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleAnalyzeMood}
              disabled={!journalText.trim() || isProcessing}
              className="flex flex-col items-center space-y-2 p-3 bg-gray-800/40 border border-gray-600/30 rounded-lg transition-all hover:bg-purple-500/10 hover:border-purple-400/50 disabled:opacity-50 disabled:cursor-not-allowed group"
            >
              <Sparkles className="w-6 h-6 text-purple-400 group-hover:animate-pulse" />
              <div className="text-center">
                <div className="font-medium text-sm text-white">Analyze</div>
                <div className="text-xs text-gray-400">Mood</div>
              </div>
            </motion.button>

          </motion.div>

          {/* Mood Selection */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="mb-3"
          >
            <h3 className="text-lg font-semibold bg-gradient-to-r from-green-400 to-green-300 bg-clip-text text-transparent mb-2">
              How are you feeling? {selectedMoods.length > 0 && <span className="text-sm text-gray-400">({selectedMoods.length} selected)</span>}
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
              {moods.map((mood) => {
                const IconComponent = mood.icon
                const isSelected = selectedMoods.includes(mood.value)
                return (
                <motion.button
                  key={mood.value}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleMoodSelect(mood.value)}
                  className={`flex flex-col items-center space-y-1 px-2 py-3 rounded-lg transition-all border ${
                      isSelected
                      ? 'bg-green-500/20 border-green-400 shadow-lg'
                      : 'border-gray-600/40 hover:bg-gray-700/50 hover:border-gray-500/50'
                  }`}
                >
                    <IconComponent className={`w-5 h-5 ${mood.color} ${isSelected ? 'opacity-100' : 'opacity-70'}`} />
                  <span className="text-xs text-gray-300 text-center leading-tight">{mood.label}</span>
                    {isSelected && <CheckCircle className="w-3 h-3 text-green-400 mt-1" />}
                </motion.button>
                )
              })}
            </div>
          </motion.div>

          {/* Input Controls & Save */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9 }}
            className="flex flex-wrap items-center justify-between gap-4"
          >
            <div className="flex flex-wrap items-center gap-3">
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleVoiceInput}
                  className={`bg-gray-800/60 border-gray-600/50 text-white hover:bg-blue-500/20 hover:border-blue-400/50 transition-all duration-300 group ${
                    audioFiles.length > 0 ? 'border-blue-400 bg-blue-500/10' : ''
                  } ${isRecording ? 'border-red-400 bg-red-500/20 animate-pulse' : ''}`}
                >
                  <Mic className={`w-4 h-4 mr-2 ${isRecording ? 'text-red-400 animate-pulse' : 'text-blue-400 group-hover:animate-pulse'}`} />
                  {isRecording ? 'Stop Recording' : audioFiles.length > 0 ? `Audio (${audioFiles.length})` : 'Voice'}
                </Button>
              </motion.div>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handlePhotoInput}
                  className={`bg-gray-800/60 border-gray-600/50 text-white hover:bg-purple-500/20 hover:border-purple-400/50 transition-all duration-300 group ${
                    imageFiles.length > 0 ? 'border-purple-400 bg-purple-500/10' : ''
                  }`}
                >
                  <Camera className="w-4 h-4 mr-2 text-purple-400 group-hover:animate-pulse" />
                  {imageFiles.length > 0 ? `Images (${imageFiles.length})` : 'Photo'}
                </Button>
              </motion.div>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleAIPrompt}
                  disabled={isProcessing}
                  className="bg-gray-800/60 border-gray-600/50 text-white hover:bg-orange-500/20 hover:border-orange-400/50 transition-all duration-300 group disabled:opacity-50"
                >
                  <Wand2 className="w-4 h-4 mr-2 text-orange-400 group-hover:animate-pulse" />
                  {isProcessing ? 'Generating...' : 'AI Prompt'}
                </Button>
              </motion.div>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleClearForm}
                  className="bg-gray-800/60 border-gray-600/50 text-white hover:bg-red-500/20 hover:border-red-400/50 transition-all duration-300 group"
                >
                  <RotateCcw className="w-4 h-4 mr-2 text-red-400 group-hover:animate-pulse" />
                  Clear
                </Button>
              </motion.div>
            </div>

            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                onClick={handleSaveEntry}
                disabled={!journalText.trim()}
                className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white shadow-lg hover:shadow-green-500/25 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed px-8 py-2"
              >
                <motion.span
                  animate={journalText.trim() ? { scale: [1, 1.1, 1] } : {}}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  💾 Save Entry
                </motion.span>
              </Button>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </motion.div>
  )
}

