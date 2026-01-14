# PollenBoard - AI Creative Content Board

[![Built with Pollinations.ai](https://img.shields.io/badge/Built%20with-Pollinations-8a2be2?style=for-the-badge&logo=data:image/svg+xml,%3Csvg%20xmlns%3D%22http://www.w3.org/2000/svg%22%20viewBox%3D%220%200%20124%20124%22%3E%3Ccircle%20cx%3D%2262%22%20cy%3D%2262%22%20r%3D%2262%22%20fill%3D%22%23ffffff%22/%3E%3C/svg%3E&logoColor=white&labelColor=6a0dad)](https://pollinations.ai)

A modern, responsive web application for creating, sharing, and exploring AI-generated content including images, audio, and text. Built with Next.js 15, TypeScript, and powered by [Pollinations.AI](https://pollinations.ai).

![PollenBoard Preview](docs/Preview.jpg)

## 🎥 Live Demo

### Explore Page
![Explore Page](https://i.imgur.com/RXpcpev.gif)

### Create Page
![Create Page](https://i.imgur.com/CIpP1Qc.gif)

## 🚀 Features

- **AI Image Generation**: Create stunning images from text prompts using various AI models
- **AI Audio Generation**: Generate audio from text with multiple voice options
- **Pinterest-style Grid**: Beautiful masonry layout for displaying generated content
- **Speech-to-Text**: Use your microphone to convert speech to text for prompts
- **Real-time Model Updates**: Automatically fetches latest AI models from Pollinations.AI
- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile devices
- **Interactive Modal System**: Rich modals for image details and generation
- **Audio Playback**: Listen to generated audio directly in the interface
- **Export & Share**: Easy sharing of generated content

## 🛠 Tech Stack

- **Frontend**: Next.js 15, React 18, TypeScript
- **Styling**: Tailwind CSS, Shadcn/ui components
- **AI Integration**: Pollinations.AI API
- **Deployment**: Firebase App Hosting
- **Icons**: Lucide React
- **Forms**: React Hook Form with Zod validation
- **State Management**: React hooks and context

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- Node.js 18+ and npm
- Firebase CLI (for deployment)
- Google Cloud account with billing enabled (for Gemini API)

## 🚀 Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/PollenBoard.git
cd PollenBoard
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Environment Configuration

Create a `.env.local` file in the root directory:

```bash
cp .env.example .env.local
```

Add your API keys to `.env.local`:

```env
# Google AI API Key for Gemini (required for some features)
GOOGLE_API_KEY=your_google_api_key_here

# Alternative name that some configurations use
GEMINI_API_KEY=your_google_api_key_here
```

**Getting your Google API Key:**

1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Create a new API key
3. Restrict the key to specific domains if desired

### 4. Development Server

Start the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 🏗 Building for Production

### Build the Application

```bash
npm run build
```

### Run Production Build Locally

```bash
npm run start
```

## 🚀 Deployment

### Firebase App Hosting (Recommended)

1. **Install Firebase CLI**:

   ```bash
   npm install -g firebase-tools
   ```

2. **Authenticate with Firebase**:

   ```bash
   firebase login
   ```

3. **Initialize Firebase** (if not already done):

   ```bash
   firebase init hosting
   ```

4. **Deploy to Firebase**:
   ```bash
   firebase deploy
   ```

### Vercel Deployment

1. **Install Vercel CLI**:

   ```bash
   npm install -g vercel
   ```

2. **Deploy**:
   ```bash
   vercel --prod
   ```

### Docker Deployment

Create a `Dockerfile`:

```dockerfile
FROM node:18-alpine AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

FROM node:18-alpine AS builder
WORKDIR /app
COPY . .
COPY --from=deps /app/node_modules ./node_modules
RUN npm run build

FROM node:18-alpine AS runner
WORKDIR /app
ENV NODE_ENV production
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/node_modules ./node_modules
EXPOSE 3000
CMD ["npm", "start"]
```

Build and run:

```bash
docker build -t pollenboard .
docker run -p 3000:3000 -e GOOGLE_API_KEY=your_key pollenboard
```

## ⚙️ Configuration

### Environment Variables

| Variable               | Description                    | Required | Default                 |
| ---------------------- | ------------------------------ | -------- | ----------------------- |
| `GOOGLE_API_KEY`       | Google AI API key for Gemini   | No       | -                       |
| `GEMINI_API_KEY`       | Alternative Google AI key name | No       | -                       |
| `NEXT_PUBLIC_SITE_URL` | Site URL for metadata          | No       | `http://localhost:3000` |

### Customization

#### Brand Colors

Edit `tailwind.config.ts` to customize the color scheme:

```typescript
module.exports = {
  theme: {
    extend: {
      colors: {
        primary: "#33A19F", // Teal
        accent: "#E37A71", // Salmon
        background: "#F2F4F3", // Off-white
      },
    },
  },
};
```

#### AI Models

The application automatically fetches available models from Pollinations.AI, but you can modify model preferences in `src/lib/pollinations.ts`.

## 📱 Usage

### Generating Images

1. Click the "Generate Image" button
2. Enter your text prompt
3. Select an AI model (optional)
4. Adjust image settings (size, quality, negative prompts)
5. Click "Generate" and wait for your image

### Creating Audio

1. Click the "Generate Audio" button
2. Enter text for speech synthesis
3. Choose a voice from the dropdown
4. Click "Generate" to create audio

### Using Speech-to-Text

1. Click the microphone icon in any text field
2. Allow microphone access when prompted
3. Speak your prompt clearly
4. Click stop when finished - text will be transcribed automatically

### Managing Content

- **View Details**: Click any pin to see full details
- **Play Audio**: Click play button on audio pins
- **Refresh**: Use refresh button to load latest content
- **Responsive**: Works on all device sizes

## 🔧 Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run typecheck` - Run TypeScript type checking

### Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── api/               # API routes
│   ├── explore/           # Explore page
│   ├── globals.css        # Global styles
│   └── page.tsx           # Home page
├── components/            # React components
│   ├── forms/             # Generation dialogs
│   └── ui/                # Shadcn/ui components
├── lib/                   # Utilities and API clients
├── types/                 # TypeScript types
└── hooks/                 # Custom React hooks
```

### Adding New Features

1. **New AI Model Support**:

   - Update `src/lib/pollinations.ts` to handle new model endpoints
   - Add model configuration in relevant components

2. **New Content Types**:

   - Extend `PinData` interface in `src/types/index.ts`
   - Create new generation dialog components
   - Update the main grid component

3. **Custom API Endpoints**:
   - Add new route handlers in `src/app/api/`
   - Implement proper error handling and validation

## 🐛 Troubleshooting

### Common Issues

**Build fails with TypeScript errors**

```bash
npm run typecheck
# Fix any type errors shown
```

**Images not loading**

- Check `next.config.ts` image domains configuration
- Ensure Pollinations.AI service is accessible

**API rate limits**

- The app uses Pollinations.AI free tier which has rate limits
- Consider implementing caching or upgrading to paid tier

**Environment variables not working**

- Ensure `.env.local` is in the project root
- Restart the development server after changes
- Variables must be prefixed with `NEXT_PUBLIC_` to be available client-side

### Performance Optimization

- **Image Optimization**: Direct image loading with fallback mechanisms and retry logic
- **Lazy Loading**: Implements React Suspense for progressive loading
- **Bundle Splitting**: Automatic code splitting with Next.js 15
- **Caching**: Static assets cached via Firebase CDN

## 🧪 Testing

Run the test suite:

```bash
# Type checking
npm run typecheck

# Linting
npm run lint

# Build test
npm run build
```

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📞 Support

- **Issues**: [GitHub Issues](https://github.com/yourusername/PollenBoard/issues)
- **Discussions**: [GitHub Discussions](https://github.com/yourusername/PollenBoard/discussions)
- **Email**: support@pollenboard.app

## 🙏 Acknowledgments

- [![Pollinations.AI Logo](https://raw.githubusercontent.com/pollinations/pollinations/main/assets/logo.svg)](https://pollinations.ai)
- [Pollinations.AI](https://pollinations.ai) for providing the AI generation APIs
- [Shadcn/ui](https://ui.shadcn.com) for the beautiful component library
- [Next.js](https://nextjs.org) for the amazing React framework
- [Vercel](https://vercel.com) for deployment infrastructure

---

**Made with ❤️ by the PollenBoard team**
