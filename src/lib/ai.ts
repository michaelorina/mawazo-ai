// Chrome Built-in AI APIs integration for Mawazo AI with Gemini Nano
declare global {
  interface Window {
    ai?: {
      languageModel?: {
        create: (options?: { systemPrompt?: string }) => Promise<{
          prompt: (prompt: string) => Promise<string>
        }>
      }
      // Alternative API structures
      prompt?: (prompt: string, options?: Record<string, unknown>) => Promise<string>
      rewrite?: (text: string, options?: Record<string, unknown>) => Promise<string>
      summarize?: (text: string, options?: Record<string, unknown>) => Promise<string>
      write?: (prompt: string, options?: Record<string, unknown>) => Promise<string>
      translate?: (text: string, targetLang: string) => Promise<string>
      proofread?: (text: string) => Promise<string>
    }
    // Direct LanguageModel API
    LanguageModel?: {
      create: (options?: { systemPrompt?: string }) => Promise<{
        prompt: (prompt: string) => Promise<string>
      }>
    }
  }
}

export const isChromeAIAvailable = () => {
  return typeof window !== 'undefined' && (('ai' in window) || ('LanguageModel' in window))
}

export const testChromeAI = async () => {
  if (!isChromeAIAvailable()) {
    return { available: false, error: 'Chrome AI not available' }
  }
  
  try {
    // Test direct LanguageModel API first
    if (window.LanguageModel) {
      const session = await window.LanguageModel.create({
        systemPrompt: 'You are a helpful assistant.'
      })
      const result = await session.prompt('Hello, can you respond with "AI is working"?')
      return { available: true, result, api: 'LanguageModel' }
    }
    // Test window.ai.languageModel API
    else if (window.ai?.languageModel) {
      const session = await window.ai.languageModel.create({
        systemPrompt: 'You are a helpful assistant.'
      })
      const result = await session.prompt('Hello, can you respond with "AI is working"?')
      return { available: true, result, api: 'ai.languageModel' }
    }
    // Test direct prompt API
    else if (window.ai?.prompt) {
      const result = await window.ai.prompt('Hello, can you respond with "AI is working"?')
      return { available: true, result, api: 'ai.prompt' }
    }
    else {
      return { available: false, error: 'No suitable API found', availableAPIs: Object.keys(window) }
    }
  } catch (error) {
    return { available: false, error: (error as Error).message }
  }
}

export const initiateModelDownload = async () => {
  if (!isChromeAIAvailable()) {
    return { success: false, error: 'Chrome AI not available' }
  }
  
  try {
    // Try direct LanguageModel API first
    if (window.LanguageModel) {
      const session = await window.LanguageModel.create({
        systemPrompt: 'You are a helpful assistant.'
      })
      // Try a simple prompt to trigger download
      await session.prompt('test')
      return { success: true, message: 'Model download initiated successfully' }
    }
    // Try window.ai.languageModel API
    else if (window.ai?.languageModel) {
      const session = await window.ai.languageModel.create({
        systemPrompt: 'You are a helpful assistant.'
      })
      // Try a simple prompt to trigger download
      await session.prompt('test')
      return { success: true, message: 'Model download initiated successfully' }
    } else {
      return { success: false, error: 'LanguageModel API not available' }
    }
  } catch (error) {
    const errorMessage = (error as Error).message
    // Check if it's a download-related error
    if (errorMessage.includes('download') || errorMessage.includes('model') || errorMessage.includes('initialization')) {
      return { success: true, message: 'Model download initiated - this may take a few minutes' }
    }
    return { success: false, error: errorMessage }
  }
}

// Helper function to clean up markdown formatting
const cleanMarkdown = (text: string): string => {
  return text
    .replace(/\*\*(.*?)\*\*/g, '$1') // Remove bold **text**
    .replace(/\*(.*?)\*/g, '$1')     // Remove italic *text*
    .replace(/`(.*?)`/g, '$1')       // Remove code `text`
    .replace(/#{1,6}\s*/g, '')       // Remove headers # ## ###
    .replace(/^\s*[-*+]\s*/gm, '')   // Remove bullet points
    .replace(/^\s*\d+\.\s*/gm, '')   // Remove numbered lists
    .replace(/>\s*/g, '')            // Remove blockquotes >
    .trim()
}

// Analyze the emotional tone and mood of journal text
export const analyzeMood = async (text: string): Promise<string[]> => {
  if (!isChromeAIAvailable()) {
    return [] // Return empty array if AI not available
  }
  
  try {
    // Try direct LanguageModel API first
    if (window.LanguageModel) {
      const session = await window.LanguageModel.create({
        systemPrompt: 'You are a mood analyzer. Analyze the emotional tone of the provided text and return EXACTLY 1-3 single words from this exact list: happy, sad, excited, anxious, peaceful, confused, grateful, motivated, tired, reflective, hopeful. Return ONLY the mood words separated by commas. NO explanations, NO additional text, NO markdown. Maximum 3 words. If no clear mood, return "neutral".'
      })
      const analysis = await session.prompt(`Analyze the mood of this text: ${text}`)
      const cleaned = cleanMarkdown(analysis)
      const moods = cleaned.split(',').map(m => m.trim().toLowerCase()).filter(m => m)
      return moods.slice(0, 3) // Limit to maximum 3 moods
    }
    // Try window.ai.languageModel API
    else if (window.ai?.languageModel) {
      const session = await window.ai.languageModel.create({
        systemPrompt: 'You are a mood analyzer. Analyze the emotional tone of the provided text and return EXACTLY 1-3 single words from this exact list: happy, sad, excited, anxious, peaceful, confused, grateful, motivated, tired, reflective, hopeful. Return ONLY the mood words separated by commas. NO explanations, NO additional text, NO markdown. Maximum 3 words. If no clear mood, return "neutral".'
      })
      const analysis = await session.prompt(`Analyze the mood of this text: ${text}`)
      const cleaned = cleanMarkdown(analysis)
      const moods = cleaned.split(',').map(m => m.trim().toLowerCase()).filter(m => m)
      return moods.slice(0, 3) // Limit to maximum 3 moods
    }
    // Fallback to direct API calls
    else if (window.ai?.prompt) {
      const analysis = await window.ai.prompt(`Analyze the mood of this text and return EXACTLY 1-3 single words from: happy, sad, excited, anxious, peaceful, confused, grateful, motivated, tired, reflective, hopeful. Maximum 3 words separated by commas: ${text}`)
      const cleaned = cleanMarkdown(analysis)
      const moods = cleaned.split(',').map(m => m.trim().toLowerCase()).filter(m => m)
      return moods.slice(0, 3) // Limit to maximum 3 moods
    } else {
      return [] // Return empty array if no API found
    }
  } catch (error) {
    console.error('AI mood analysis failed:', error)
    return [] // Return empty array if AI fails
  }
}

export const enhanceWriting = async (text: string): Promise<string> => {
  if (!isChromeAIAvailable()) {
    // Fallback: return original text with a note
    return `${text}\n\n[Note: AI enhancement unavailable - Chrome AI APIs not enabled]`
  }
  
  try {
    let enhancedText = ''
    
    // Try direct LanguageModel API first
    if (window.LanguageModel) {
      const session = await window.LanguageModel.create({
        systemPrompt: 'You are a comedy writer. Take the given text and expand it in a funny, witty, sarcastic way. Write exactly 2-3 sentences maximum of pure comedy. Be hilarious, clever, and sarcastic. Return only the funny expanded version with no explanations, no options, no additional text, no markdown formatting.'
      })
      enhancedText = await session.prompt(`Make this funny and sarcastic in 2-3 sentences:\n\n${text}`)
    }
    // Try window.ai.languageModel API
    else if (window.ai?.languageModel) {
      const session = await window.ai.languageModel.create({
        systemPrompt: 'You are a comedy writer. Take the given text and expand it in a funny, witty, sarcastic way. Write exactly 2-3 sentences maximum of pure comedy. Be hilarious, clever, and sarcastic. Return only the funny expanded version with no explanations, no options, no additional text, no markdown formatting.'
      })
      enhancedText = await session.prompt(`Make this funny and sarcastic in 2-3 sentences:\n\n${text}`)
    }
    // Fallback to direct API calls
    else if (window.ai?.rewrite) {
      enhancedText = await window.ai.rewrite(text)
    } else if (window.ai?.prompt) {
      enhancedText = await window.ai.prompt(`Make this funny and sarcastic: ${text}`)
    } else {
      return `${text}\n\n[Note: AI enhancement unavailable - No suitable API found]`
    }
    
    // Clean up any markdown formatting that might have slipped through
    return cleanMarkdown(enhancedText)
    
  } catch (error) {
    console.error('AI enhancement failed:', error)
    return `${text}\n\n[Note: AI enhancement failed: ${(error as Error).message}]`
  }
}

export const summarizeContent = async (text: string): Promise<string> => {
  if (!isChromeAIAvailable()) {
    return 'Summary unavailable - Chrome AI APIs not enabled'
  }
  
  try {
    // Try direct LanguageModel API first
    if (window.LanguageModel) {
      const session = await window.LanguageModel.create({
        systemPrompt: 'You are a journal assistant. Create exactly 4 short, concise sentences that summarize the journal entry. Focus on the main events, emotions, and key insights. Each sentence should be clear and impactful. Return only the 4 sentences without any explanations, numbers, or bullet points.'
      })
      return await session.prompt(`Summarize this journal entry in exactly 4 short sentences:\n\n${text}`)
    }
    // Try window.ai.languageModel API
    else if (window.ai?.languageModel) {
      const session = await window.ai.languageModel.create({
        systemPrompt: 'You are a journal assistant. Create exactly 4 short, concise sentences that summarize the journal entry. Focus on the main events, emotions, and key insights. Each sentence should be clear and impactful. Return only the 4 sentences without any explanations, numbers, or bullet points.'
      })
      return await session.prompt(`Summarize this journal entry in exactly 4 short sentences:\n\n${text}`)
    }
    // Fallback to direct API calls
    else if (window.ai?.summarize) {
      return await window.ai.summarize(text)
    } else if (window.ai?.prompt) {
      return await window.ai.prompt(`Summarize this journal entry in 4 short sentences: ${text}`)
    } else {
      return 'Summary unavailable - No suitable API found'
    }
  } catch (error) {
    console.error('AI summarization failed:', error)
    return 'Summary unavailable - AI processing failed: ' + (error as Error).message
  }
}

// Hardcoded journaling prompts for instant response
const JOURNAL_PROMPTS = [
  "What made you smile today? What are you grateful for?",
  "What moment today made you pause and think, 'huh, that's interesting'?",
  "If today had a soundtrack, what songs would be on it and why?",
  "What's one thing that happened today that you didn't expect?",
  "What conversation or interaction stuck with you today?",
  "What did you learn about yourself today, even if it's something small?",
  "What's one thing you did today that you're proud of?",
  "If you could relive one moment from today, which would it be and why?",
  "What emotion did you feel most strongly today and what triggered it?",
  "What's something you noticed today that you usually overlook?"
]

export const generateJournalPrompt = async (): Promise<string> => {
  // Return a random prompt instantly - no AI needed!
  const randomIndex = Math.floor(Math.random() * JOURNAL_PROMPTS.length)
  return JOURNAL_PROMPTS[randomIndex]
}

export const translateEntry = async (text: string, targetLang: string): Promise<string> => {
  if (!isChromeAIAvailable()) {
    return `Translation unavailable - Chrome AI APIs not enabled. Original text: ${text}`
  }
  
  try {
    // Try direct LanguageModel API first
    if (window.LanguageModel) {
      const session = await window.LanguageModel.create({
        systemPrompt: 'You are a translation machine. Your ONLY job is to translate text. Do NOT provide explanations, options, alternatives, notes, or any other text. Do NOT say "Here are options" or "The translation is". Do NOT add language labels like "Deutsch:" or "Spanish:". Just translate the text and return ONLY the translated text. Nothing else.'
      })
      const translated = await session.prompt(`Translate this to ${targetLang}. Return only the translation:\n\n${text}`)
      return cleanMarkdown(translated)
    }
    // Try window.ai.languageModel API
    else if (window.ai?.languageModel) {
      const session = await window.ai.languageModel.create({
        systemPrompt: 'You are a translation machine. Your ONLY job is to translate text. Do NOT provide explanations, options, alternatives, notes, or any other text. Do NOT say "Here are options" or "The translation is". Do NOT add language labels like "Deutsch:" or "Spanish:". Just translate the text and return ONLY the translated text. Nothing else.'
      })
      const translated = await session.prompt(`Translate this to ${targetLang}. Return only the translation:\n\n${text}`)
      return cleanMarkdown(translated)
    }
    // Fallback to direct API calls
    else if (window.ai?.translate) {
      return await window.ai.translate(text, targetLang)
    } else if (window.ai?.prompt) {
      return await window.ai.prompt(`Translate this to ${targetLang}. Return only the translation: ${text}`)
    } else {
      return `Translation unavailable - No suitable API found. Original text: ${text}`
    }
  } catch (error) {
    console.error('AI translation failed:', error)
    return `Translation unavailable - AI processing failed: ${(error as Error).message}. Original text: ${text}`
  }
}

export const proofreadEntry = async (text: string): Promise<string> => {
  if (!isChromeAIAvailable()) {
    return text // Return original text if AI not available
  }
  
  try {
    // Try direct LanguageModel API first
    if (window.LanguageModel) {
      const session = await window.LanguageModel.create({
        systemPrompt: 'You are a text processor that fixes spelling and grammar errors. Your output must be EXACTLY one of these two things: 1) The corrected text if there are errors, OR 2) The original text unchanged if there are no errors. You must NOT include any explanations, commentary, options, suggestions, alternatives, stylistic advice, or any other text. You must NOT use phrases like "here is", "here are", "the corrected version is", "the text is already grammatically correct", "however", "depending on", "you could make", "here are a few options", "option 1", "option 2", "option 3", "the original is perfectly good", "the best choice depends", "subtle variations", "more polished feel", "slightly more", "more empathetic", "more concise", "more formal", "more playful", "more encouraging", "it is a perfectly fine sentence", "if you are looking for", "this is a bit more", "more conversational", "slightly more descriptive", "however the original", "there is nothing wrong", "no correction is strictly necessary", "the text is grammatically correct", "it is a perfectly fine sentence", "here are a few slightly more polished options", "depending on the nuance you want to convey", "adds a bit more emphasis", "emphasizes the importance", "slightly more direct and concise", "the original sentence is perfectly acceptable", "these options offer subtle variations in phrasing", "the corrected text is", "here is why", "quotation marks", "the original text used", "while sometimes acceptable", "using double quotation marks", "is generally preferred", "when quoting someone", "capitalization", "the phrase", "should be capitalized", "when it is part of", "a quoted statement", "the text can be improved for clarity", "ranging from subtle to more polished", "replacing with", "is a little more formal", "changing the verb conjugation", "makes it flow better", "using is a very common", "the best option depends on the context", "option is generally the most natural", "but it can be improved", "for clarity and naturalness", "here are a few options", "ranging from subtle to more polished", "option 1", "option 2", "option 3", "slightly more formal", "replacing usually with typically", "is a little more formal", "more concise and common", "changing the verb conjugation", "makes it flow better", "most natural and common", "using often is a very common", "and natural way to phrase this", "the best option depends on the context", "and the desired tone", "however option 3", "is generally the most natural", "and commonly used phrasing". You must NOT answer questions. You must NOT provide examples. You must NOT give multiple versions. You must return EXACTLY the corrected text or the original text unchanged.'
      })
      const proofread = await session.prompt(`Correct this text: ${text}`)
      return cleanMarkdown(proofread)
    }
    // Try window.ai.languageModel API
    else if (window.ai?.languageModel) {
      const session = await window.ai.languageModel.create({
        systemPrompt: 'You are a text processor that fixes spelling and grammar errors. Your output must be EXACTLY one of these two things: 1) The corrected text if there are errors, OR 2) The original text unchanged if there are no errors. You must NOT include any explanations, commentary, options, suggestions, alternatives, stylistic advice, or any other text. You must NOT use phrases like "here is", "here are", "the corrected version is", "the text is already grammatically correct", "however", "depending on", "you could make", "here are a few options", "option 1", "option 2", "option 3", "the original is perfectly good", "the best choice depends", "subtle variations", "more polished feel", "slightly more", "more empathetic", "more concise", "more formal", "more playful", "more encouraging", "it is a perfectly fine sentence", "if you are looking for", "this is a bit more", "more conversational", "slightly more descriptive", "however the original", "there is nothing wrong", "no correction is strictly necessary", "the text is grammatically correct", "it is a perfectly fine sentence", "here are a few slightly more polished options", "depending on the nuance you want to convey", "adds a bit more emphasis", "emphasizes the importance", "slightly more direct and concise", "the original sentence is perfectly acceptable", "these options offer subtle variations in phrasing", "the corrected text is", "here is why", "quotation marks", "the original text used", "while sometimes acceptable", "using double quotation marks", "is generally preferred", "when quoting someone", "capitalization", "the phrase", "should be capitalized", "when it is part of", "a quoted statement", "the text can be improved for clarity", "ranging from subtle to more polished", "replacing with", "is a little more formal", "changing the verb conjugation", "makes it flow better", "using is a very common", "the best option depends on the context", "option is generally the most natural", "but it can be improved", "for clarity and naturalness", "here are a few options", "ranging from subtle to more polished", "option 1", "option 2", "option 3", "slightly more formal", "replacing usually with typically", "is a little more formal", "more concise and common", "changing the verb conjugation", "makes it flow better", "most natural and common", "using often is a very common", "and natural way to phrase this", "the best option depends on the context", "and the desired tone", "however option 3", "is generally the most natural", "and commonly used phrasing". You must NOT answer questions. You must NOT provide examples. You must NOT give multiple versions. You must return EXACTLY the corrected text or the original text unchanged.'
      })
      const proofread = await session.prompt(`Correct this text: ${text}`)
      return cleanMarkdown(proofread)
    }
    // Fallback to direct API calls
    else if (window.ai?.proofread) {
      return await window.ai.proofread(text)
    } else if (window.ai?.prompt) {
      return await window.ai.prompt(`Check and correct: ${text}`)
    } else {
      return text // Return original text if no API found
    }
  } catch (error) {
    console.error('AI proofreading failed:', error)
    return text // Return original text if AI fails
  }
}

export const generateLifeStory = async (entries: string[], onProgress?: (text: string) => void): Promise<string> => {
  if (!isChromeAIAvailable()) {
    return 'Life story generation unavailable - Chrome AI APIs not enabled. You have ' + entries.length + ' journal entries.'
  }
  
  const combinedEntries = entries.join('\n\n')
  
  try {
    // Try direct LanguageModel API first
    if (window.LanguageModel) {
      const session = await window.LanguageModel.create({
        systemPrompt: 'You are a witty, sarcastic, and wise life story narrator. Write a novel-style reflection that captures the person\'s journey with humor, insight, and a touch of sarcasm. Be funny but not mean, wise but not preachy, and honest but not cruel. Write it like a clever friend telling their story with wit and wisdom. Include observations about patterns, growth, and the absurdity of life. Make it engaging and entertaining to read. Do not use any markdown formatting, asterisks, or special characters.'
      })
      const story = await session.prompt(`Create a witty, sarcastic, and wise life story reflection from these journal entries. Write it like a novel chapter with humor and insight:\n\n${combinedEntries}`)
      
      // Clean markdown and return immediately
      const cleanedStory = cleanMarkdown(story)
      if (onProgress) {
        onProgress(cleanedStory)
      }
      
      return cleanedStory
    }
    // Try window.ai.languageModel API
    else if (window.ai?.languageModel) {
      const session = await window.ai.languageModel.create({
        systemPrompt: 'You are a witty, sarcastic, and wise life story narrator. Write a novel-style reflection that captures the person\'s journey with humor, insight, and a touch of sarcasm. Be funny but not mean, wise but not preachy, and honest but not cruel. Write it like a clever friend telling their story with wit and wisdom. Include observations about patterns, growth, and the absurdity of life. Make it engaging and entertaining to read. Do not use any markdown formatting, asterisks, or special characters.'
      })
      const story = await session.prompt(`Create a witty, sarcastic, and wise life story reflection from these journal entries. Write it like a novel chapter with humor and insight:\n\n${combinedEntries}`)
      
      // Clean markdown and return immediately
      const cleanedStory = cleanMarkdown(story)
      if (onProgress) {
        onProgress(cleanedStory)
      }
      
      return cleanedStory
    }
    // Fallback to direct API calls
    else if (window.ai?.write) {
      const story = await window.ai.write(`Create a witty, sarcastic, and wise life story reflection from these journal entries: ${combinedEntries}`)
      
      // Clean markdown and return immediately
      const cleanedStory = cleanMarkdown(story)
      if (onProgress) {
        onProgress(cleanedStory)
      }
      
      return cleanedStory
    } else if (window.ai?.prompt) {
      const story = await window.ai.prompt(`Create a witty, sarcastic, and wise life story reflection from these journal entries: ${combinedEntries}`)
      
      // Clean markdown and return immediately
      const cleanedStory = cleanMarkdown(story)
      if (onProgress) {
        onProgress(cleanedStory)
      }
      
      return cleanedStory
    } else {
      return 'Life story generation unavailable - No suitable API found. You have ' + entries.length + ' journal entries.'
    }
  } catch (error) {
    console.error('AI life story generation failed:', error)
    return 'Life story generation unavailable - AI processing failed: ' + (error as Error).message + '. You have ' + entries.length + ' journal entries.'
  }
}
