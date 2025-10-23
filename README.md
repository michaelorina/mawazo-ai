# 🧠 Mawazo AI - Your Private Story

> **"Mawazo"** - Swahili for "thoughts" or "ideas"

A private, on-device journaling system powered by Chrome's built-in AI APIs. Capture your thoughts, track moods, and let your story come to life with intelligent assistance.

🌐 **Live Demo**: [https://mawazo-ai.vercel.app/](https://mawazo-ai.vercel.app/)

## ✨ Features

### 🎯 Core Functionality
- **Private Journaling**: All data stays on your device - no cloud storage required
- **AI-Powered Writing**: Enhanced writing with Chrome's built-in AI APIs
- **Mood Tracking**: Select and analyze emotional states with 11 different moods
- **Multi-Modal Input**: Text, voice recording, and photo attachments
- **Smart Prompts**: AI-generated questions to inspire your writing
- **Real-time Analysis**: Instant mood detection and writing enhancement

### 🤖 AI Capabilities
- **Writing Enhancement**: Improve your writing style with witty, sarcastic comedy
- **Smart Summarization**: Generate 4-sentence summaries of your entries
- **Multi-Language Translation**: Translate to 12 different languages
- **Grammar Proofreading**: Correct mistakes and improve clarity
- **Mood Analysis**: Automatically detect emotional tone from your text
- **Life Story Generation**: Compile entries into comprehensive life stories

### 📱 User Experience
- **Responsive Design**: Optimized for desktop, tablet, and mobile
- **Beautiful UI**: Notebook-style interface with paper texture effects
- **Streak Tracking**: Visual fire icon that burns when you maintain daily streaks
- **Media Attachments**: Support for multiple audio recordings and images
- **Export Options**: Download summaries and life stories as text files
- **Offline-First**: Works completely offline once loaded

## 🚀 Getting Started

### Prerequisites
- **Chrome Browser** (Version 141+ recommended)
- **Chrome AI APIs** enabled (see setup instructions below)

### Chrome AI Setup
1. Navigate to `chrome://flags`
2. Search for "Chrome AI" or "Built-in AI"
3. Enable "Chrome Built-in AI" flag
4. Restart Chrome browser
5. Visit [Mawazo AI](https://mawazo-ai.vercel.app/) to verify AI is working

### Local Development

```bash
# Clone the repository
git clone https://github.com/michaelorina/mawazo-ai.git
cd mawazo-ai

# Install dependencies
npm install

# Run development server
npm run dev

# Open http://localhost:3000 in Chrome
```

## 🏗️ Tech Stack

### Frontend
- **Next.js 14** - React framework with App Router
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first styling
- **Framer Motion** - Smooth animations
- **Lucide React** - Beautiful icons

### AI Integration
- **Chrome Built-in AI APIs** - Local AI processing
- **Gemini Nano** - On-device language model
- **Prompt API** - Dynamic content generation
- **Summarizer API** - Content summarization
- **Writer API** - Content creation
- **Rewriter API** - Content enhancement
- **Proofreader API** - Grammar correction
- **Translator API** - Multi-language support

### Storage & Privacy
- **LocalStorage** - Client-side data persistence
- **Base64 Encoding** - Media file storage
- **No External APIs** - Complete privacy protection

## 📁 Project Structure

```
mawazo-ai/
├── src/
│   ├── app/                 # Next.js App Router
│   │   ├── globals.css     # Global styles
│   │   ├── layout.tsx      # Root layout
│   │   └── page.tsx        # Home page
│   ├── components/         # React components
│   │   ├── Header.tsx      # App header with streak
│   │   ├── IntroSection.tsx # Landing section
│   │   ├── JournalEntry.tsx # Main writing interface
│   │   ├── JournalEntries.tsx # Entry management
│   │   └── ui/            # Reusable UI components
│   └── lib/               # Utility functions
│       ├── ai.ts          # Chrome AI integration
│       ├── storage.ts     # LocalStorage utilities
│       └── utils.ts       # Helper functions
├── public/                # Static assets
│   ├── favicon.svg       # App icon
│   └── arrow.png         # UI graphics
└── README.md             # This file
```

## 🎨 Key Components

### JournalEntry.tsx
The main writing interface featuring:
- **Notebook-style design** with paper texture
- **AI tool buttons** for enhancement, summarization, translation
- **Mood selection grid** with 11 emotional states
- **Media attachment** support for audio and images
- **Real-time word count** and character tracking

### JournalEntries.tsx
Entry management system with:
- **Search and filtering** by mood and date
- **Edit and delete** functionality
- **Life story generation** from all entries
- **Export capabilities** for summaries and stories

### AI Integration (ai.ts)
Comprehensive Chrome AI API wrapper:
- **Availability detection** for Chrome AI features
- **Error handling** and fallback mechanisms
- **Content processing** with markdown cleaning
- **Multi-modal support** for text, audio, and images

## 🔒 Privacy & Security

### Data Protection
- **100% Local Processing**: All AI operations happen on your device
- **No Data Transmission**: Nothing is sent to external servers
- **LocalStorage Only**: Data persists only in your browser
- **No Analytics**: No tracking or data collection

### Security Features
- **Client-Side Encryption**: Media files stored as Base64
- **No API Keys**: No external service authentication required
- **Offline Capability**: Works without internet connection
- **Browser Sandbox**: Protected by Chrome's security model

## 🎯 Usage Guide

### Writing Your First Entry
1. **Start Writing**: Type your thoughts in the main text area
2. **Select Moods**: Choose from 11 emotional states
3. **Add Media**: Record voice notes or attach photos
4. **Use AI Tools**: Enhance, summarize, or translate your text
5. **Save Entry**: Click "Save Entry" to store your thoughts

### AI Features
- **AI Prompt**: Get inspired with random writing prompts
- **Enhance Writing**: Add witty, sarcastic details to your text
- **Summarize**: Generate 4-sentence summaries
- **Translate**: Convert to 12 different languages
- **Proofread**: Fix grammar and improve clarity
- **Analyze Mood**: Automatically detect emotional tone

### Managing Entries
- **View All**: Browse your journal entries chronologically
- **Search**: Find entries by content or mood
- **Edit**: Modify existing entries inline
- **Delete**: Remove entries you no longer need
- **Generate Life Story**: Create comprehensive narratives

## 🌍 Supported Languages

The translation feature supports 12 languages:
- 🇪🇸 Spanish
- 🇫🇷 French  
- 🇩🇪 German
- 🇮🇹 Italian
- 🇵🇹 Portuguese
- 🇷🇺 Russian
- 🇯🇵 Japanese
- 🇰🇷 Korean
- 🇨🇳 Chinese
- 🇸🇦 Arabic
- 🇮🇳 Hindi
- 🇳🇱 Dutch

## 🎨 Mood System

Track your emotional state with 11 distinct moods:
- 😊 **Happy** - Joy and contentment
- 😢 **Sad** - Melancholy and sorrow
- ⚡ **Excited** - Enthusiasm and energy
- ❤️ **Anxious** - Worry and nervousness
- 🧠 **Peaceful** - Calm and tranquility
- ❓ **Confused** - Uncertainty and doubt
- 👍 **Grateful** - Appreciation and thankfulness
- 🎯 **Motivated** - Drive and determination
- ☕ **Tired** - Fatigue and exhaustion
- 🌙 **Reflective** - Thoughtful and contemplative
- ⭐ **Hopeful** - Optimism and anticipation

## 🚀 Deployment

### Vercel (Recommended)
```bash
# Deploy to Vercel
vercel --prod

# Or connect GitHub repository for automatic deployments
```

### Other Platforms
The app can be deployed to any static hosting service:
- **Netlify**: `npm run build && npm run export`
- **GitHub Pages**: Configure for static site hosting
- **Firebase Hosting**: Deploy with Firebase CLI

## 🤝 Contributing

We welcome contributions! Here's how to get started:

1. **Fork the repository**
2. **Create a feature branch**: `git checkout -b feature/amazing-feature`
3. **Make your changes** and test thoroughly
4. **Commit your changes**: `git commit -m 'Add amazing feature'`
5. **Push to the branch**: `git push origin feature/amazing-feature`
6. **Open a Pull Request**

### Development Guidelines
- Follow TypeScript best practices
- Use Tailwind CSS for styling
- Maintain responsive design principles
- Test on multiple devices and browsers
- Ensure Chrome AI compatibility

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Google Chrome Team** - For the innovative built-in AI APIs
- **Vercel** - For seamless deployment and hosting
- **Next.js Team** - For the amazing React framework
- **Tailwind CSS** - For the utility-first CSS framework
- **Lucide** - For the beautiful icon library

## 📞 Support

- **Issues**: [GitHub Issues](https://github.com/michaelorina/mawazo-ai/issues)
- **Discussions**: [GitHub Discussions](https://github.com/michaelorina/mawazo-ai/discussions)
- **Email**: [Contact Developer](mailto:your-email@example.com)

## 🔮 Future Roadmap

- [ ] **Chrome Extension** version for easier access
- [ ] **Advanced Analytics** for mood patterns and insights
- [ ] **Export Options** for PDF and other formats
- [ ] **Collaborative Features** for shared journaling
- [ ] **Advanced AI Models** as Chrome AI evolves
- [ ] **Mobile App** using Capacitor or similar
- [ ] **Backup & Sync** with encrypted cloud storage (optional)

---

**Made with ❤️ for private, intelligent journaling**

*Start your story today at [https://mawazo-ai.vercel.app/](https://mawazo-ai.vercel.app/)*