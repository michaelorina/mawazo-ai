# Mawazo AI - Your Private Story

A private, on-device journaling system that builds the story of your life using Chrome's built-in AI. Built with Next.js, shadcn/ui, and modern web technologies.

## ✨ Features

- **AI-Powered Journaling**: Leverage Chrome's built-in AI APIs for enhanced writing
- **Private & Secure**: All data stays on your device
- **Beautiful UI**: Modern glassmorphism design with smooth animations
- **Mood Tracking**: Track your emotional state with visual mood selectors
- **Multimodal Input**: Support for text, voice, and image input
- **Offline-First**: Works completely offline
- **Progressive Web App**: Installable on any device
- **Notebook-Style Interface**: Paper-like writing experience with spiral binding effects
- **Real-time Stats**: Character and word count with live updates
- **Streak Tracking**: Daily writing streak counter

## 🚀 Tech Stack

- **Framework**: Next.js 15 with App Router
- **UI Components**: shadcn/ui with Radix UI primitives
- **Styling**: Tailwind CSS with custom glassmorphism effects
- **Animations**: Framer Motion for smooth interactions
- **Icons**: Lucide React & Radix UI Icons
- **Notifications**: Sonner for toast notifications
- **TypeScript**: Full type safety

## 🛠️ Development

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Getting Started

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd mawazo-ai
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Run the development server**
   ```bash
   npm run dev
   ```

4. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## 🎨 Design System

### Color Palette
- **Primary**: Green gradients for AI features
- **Background**: Dark theme with subtle green hints
- **Glass Effects**: Semi-transparent cards with backdrop blur
- **Accents**: Blue, purple, and pink for different features

### Components
- **Header**: Glassy navigation with streak counter
- **Intro Section**: Hero text with animated arrow flow
- **Journal Entry**: Notebook-style interface with paper texture
- **AI Tools**: 2x2 grid layout with icon-based navigation
- **Mood Selector**: Interactive emoji-based selection
- **Input Controls**: Voice, photo, and AI prompt buttons

### Architecture
- **Modular Components**: Separated into Header, IntroSection, and JournalEntry
- **Clean Code**: Removed unused imports and components
- **Type Safety**: Full TypeScript implementation
- **Performance**: Optimized with Next.js Image component

## 🔧 Chrome AI Integration

This app is designed to integrate with Chrome's built-in AI APIs:

- **Prompt API**: For generating writing prompts
- **Proofreader API**: For grammar and style improvements
- **Summarizer API**: For creating entry summaries
- **Translator API**: For multilingual support
- **Language Detector**: For automatic language detection
- **Writer API**: For content generation
- **Rewriter API**: For content enhancement

## 📱 Progressive Web App

The app is built as a PWA with:
- Service worker for offline functionality
- App manifest for installation
- Responsive design for all devices
- Fast loading with Next.js optimization

## 🚀 Deployment

### Vercel (Recommended)
1. Push your code to GitHub
2. Connect your repository to Vercel
3. Deploy with zero configuration

### Other Platforms
The app can be deployed to any platform that supports Next.js:
- Netlify
- Railway
- DigitalOcean App Platform
- AWS Amplify

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📞 Support

For support, email support@mawazo-ai.com or create an issue in the repository.

---

Built with ❤️ for the Google Chrome Built-in AI Challenge 2025