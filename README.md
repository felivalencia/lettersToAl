# 🖋️ Letters to Al

A poetic, human-centered space for expressing thoughts, feelings, and reflections. Letters to Al allows people to write anonymous letters that join a constellation of shared human experiences, visualized in an interactive 3D star map where emotional content influences both color and positioning.

## ✨ Project Philosophy

Letters to Al is not primarily a technological showcase, but a timeless, human-centered, expressive space. The technology serves the emotional, poetic experience rather than drawing attention to itself. Our focus is on creating meaningful connections through shared human experiences and emotions.

## 🌟 Features

- **Write Letters**: Share your thoughts anonymously or with an optional account
- **Automatic Emotion Analysis**: Each letter is analyzed using AI to detect its emotional tone
- **Explore the Constellation**: Navigate a 3D visualization where each letter is represented as a star
- **Emotional Clustering**: Letters are colorized based on detected emotions, creating natural visual patterns
- **Interactive Filtering**: Filter letters by author or emotion to explore different perspectives
- **Minimal & Poetic**: Focus on the human experience, not technological complexity

## 💭 Emotion Analysis

Letters to Al uses a sophisticated emotion analysis system:

- **OpenAI Integration**: Each letter is analyzed using OpenAI's GPT-3.5 Turbo to detect its dominant emotion
- **Emotion-Color Mapping**: Each emotion maps to a consistent color (e.g., happy is gold, sad is blue)
- **Fallback System**: If OpenAI is unavailable, a keyword-based algorithm provides emotion detection
- **Visual Representation**: Letters with similar emotions appear in the same color in the constellation
- **Background Processing**: Analysis happens automatically on submission with no user input required

## 🚀 Tech Stack

### Frontend
- Next.js with React & TypeScript
- SCSS for maintainable, expressive styling 
- Three.js for 3D constellation visualization
- Framer Motion for animations

### Backend
- Express.js with TypeScript
- Supabase for database and authentication
- OpenAI API for emotion analysis

## 🛠️ Development Setup

### Prerequisites
- Node.js (v18+)
- npm or yarn
- Supabase account
- OpenAI API key

### Environment Variables

#### Frontend (`.env.local`)
```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
NEXT_PUBLIC_API_URL=http://localhost:3001/api
```

#### Backend (`.env`)
```
PORT=3001
FRONTEND_URL=http://localhost:3000
JWT_SECRET=your_jwt_secret
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_KEY=your_supabase_service_key
OPENAI_API_KEY=your_openai_api_key
```

### Database Setup

Create a `letters` table in Supabase with the following schema:

```sql
CREATE TABLE letters (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  content text NOT NULL,
  emotion text, -- Detected emotion for the letter
  color text, -- Color associated with the emotion
  location text, -- Positional data for constellation view
  is_anonymous boolean DEFAULT true,
  user_id uuid REFERENCES auth.users(id), -- optional
  username text, -- Cached username for better performance
  created_at timestamp DEFAULT now()
);
```

### Installation & Running

#### Frontend
```bash
cd frontend
npm install
npm run dev
```

#### Backend
```bash
cd backend
npm install
npm run dev
```

#### Populating Example Letters
```bash
cd backend
npm run upload-examples
```

## 🌠 Constellation View

The constellation view is the heart of the Letters to Al experience:

- **Interactive 3D Environment**: Navigate through a galaxy of letters
- **Star Representation**: Each letter appears as a star with a color based on its emotion
- **Connection Lines**: Letters that are emotionally similar have subtle connecting lines
- **Tooltips**: Hover over stars to see the author and emotion
- **Click Interaction**: Click on any star to read the full letter
- **Filtering System**: Filter letters by author or emotion using the filter panel
- **Camera Controls**: Zoom, rotate, and pan to explore the constellation

## 📝 Development Phases

### Phase 1.0 (Current Release)
- Complete letter writing functionality
- Emotion analysis integration with OpenAI
- 3D constellation visualization with filtering
- Anonymous letter submission

### Phase 1.1 (Next Steps)
- Enhanced mobile optimization
- Advanced clustering algorithms
- User profile enhancements
- Drawing capabilities

### Phase 2.0 (Future Release)
- Voice letter recording
- Temporal visualizations (letters over time)
- Improved accessibility features
- AI-powered letter discovery

## 🧠 Design Principles

1. **Simplicity Over Complexity**: Clear, expressive, maintainable code
2. **Human-Centered**: Technology in service of the human experience
3. **Subtle Aesthetics**: Visual elements enhance without overwhelming
4. **Privacy-Focused**: Minimal data collection, anonymous by default
5. **Accessibility**: Available to everyone, graceful degradation
6. **Clean Styling**: No inline styles, everything in SCSS for readability and maintainability

## 🤝 Contributing

Contributions that align with our philosophical and technical approach are welcome. Please read the `.cursorrules` file for detailed development guidelines.

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.