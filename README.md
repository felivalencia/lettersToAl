# 🌟 Letters to Al

A poetic, human-centered space for expressing thoughts, feelings, and reflections. Letters to Al allows people to write anonymous letters that join a constellation of shared human experiences, visualized in an interactive 3D star map where emotional content influences both color and positioning.

## ✨ Project Philosophy

Letters to Al is not primarily a technological showcase, but a timeless, human-centered, expressive space. The technology serves the emotional, poetic experience rather than drawing attention to itself. Our focus is on creating meaningful connections through shared human experiences and emotions.

## 🧠 System Architecture

The application follows a modern client-server architecture:

### Frontend (Next.js)
- **Single Page Application** built with Next.js, React, and TypeScript
- **Client-side routing** with dynamic page rendering
- **Three.js integration** for 3D constellation visualization
- **Responsive design** with SCSS for styling

### Backend (Express.js)
- **RESTful API** built with Express.js and TypeScript
- **Supabase integration** for database and authentication
- **OpenAI API** for emotion analysis and embedding generation
- **JWT authentication** for secure user sessions

### Database (PostgreSQL via Supabase)
- **Letters table** for storing user submissions
- **Users table** for authentication
- **Vector embeddings** for similarity calculations and clustering

## 📡 API Routes & Endpoints

### Authentication Routes (`/api/auth`)

| Endpoint | Method | Description | Authentication |
|----------|--------|-------------|----------------|
| `/register` | POST | Register a new user | None |
| `/login` | POST | Log in a user | None |
| `/logout` | POST | Log out a user | None |
| `/me` | GET | Get current user details | JWT Cookie |
| `/check` | GET | Check authentication status | None |
| `/search` | GET | Search users by username | None |

### Letter Routes (`/api/letters`)

| Endpoint | Method | Description | Authentication |
|----------|--------|-------------|----------------|
| `/` | GET | Get all letters | None |
| `/` | POST | Create a new letter | Optional |
| `/:id` | GET | Get a letter by ID | None |
| `/user/me` | GET | Get letters by current user | JWT Cookie |
| `/similar/:query` | GET | Find similar letters | None |
| `/update-usernames` | POST | Update usernames on letters | None |

## 🛠️ Core Services

### Authentication Service
- **User registration** with username, email, and password
- **JWT-based authentication** with HttpOnly cookies
- **Session management** with token verification

### Letter Service
- **Letter creation** with automatic emotion analysis
- **Vector embeddings** generation for semantic similarity
- **User association** for both anonymous and authenticated letters

### Emotion Service
- **OpenAI integration** for detecting emotions in submitted letters
- **Emotion-to-color mapping** for visual representation
- **Fallback algorithm** for offline emotion detection

### Embedding Service
- **OpenAI-powered embeddings** for semantic content representation
- **Cosine similarity calculations** for finding related letters
- **Dimensionality management** for efficient storage

### Clustering Service
- **Background clustering** of letters based on semantic similarity
- **Position generation** for 3D spatial arrangement
- **Connection strength calculation** between related letters

## 🖥️ Frontend Pages

### Main Pages
- **Home** (`/`): Entry point with introduction and navigation
- **Writing** (`/writing`): Letter composition interface
- **Constellation** (`/constellation`): Interactive 3D visualization
- **Letter View** (`/letters/:id`): Individual letter display
- **Profile** (`/profile`): User profile with personal letters
- **Authentication** (`/auth/login`, `/auth/register`): User login/signup

### Key Components
- **ConstellationCanvas**: Three.js 3D visualization of letters
- **Star**: Individual letter representation in the constellation
- **AuthProvider**: Global authentication state management
- **WritingForm**: Letter composition interface
- **LetterCard**: Letter display component

## 💾 Database Schema

### Letters Table
```sql
CREATE TABLE letters (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  content TEXT NOT NULL,
  drawing TEXT,
  emotion TEXT,
  color TEXT,
  location TEXT,
  embedding VECTOR(384),
  is_anonymous BOOLEAN DEFAULT true,
  user_id UUID REFERENCES auth.users(id),
  username TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);
```

### Users Table (Managed by Supabase Auth)
- Standard Supabase auth.users table with additional profile information

## 🔄 Data Flow

### Letter Creation Flow
1. User composes a letter in the writing interface
2. Letter is submitted to the backend via API
3. Backend generates an embedding vector using OpenAI
4. Backend analyzes emotional content using OpenAI
5. Letter is stored in the database with metadata
6. User receives confirmation of submission

### Constellation Visualization Flow
1. Frontend requests all letters from the backend
2. Backend returns letters with embeddings, emotions, and metadata
3. Frontend calculates positions and connections based on similarity
4. Three.js renders the interactive visualization
5. User can filter, search, and interact with letters

## 🧪 Vector Embedding System

The application uses a sophisticated vector embedding system to create meaningful connections between letters:

1. **Embedding Generation**: When a letter is submitted, the content is sent to OpenAI's embedding API to generate a vector representing its semantic meaning.

2. **Similarity Calculation**: Using cosine similarity, the backend can find letters with similar content or emotional tone.

3. **Spatial Arrangement**: Letters are positioned in 3D space based on their embeddings, with similar letters appearing closer together.

4. **Connection Visualization**: Lines connect related letters, with opacity and thickness determined by similarity scores.

5. **Clustering**: Background processes group letters into clusters for more efficient visualization and discovery.

## 🎨 Emotion Analysis System

The emotion analysis workflow:

1. **Text Analysis**: Letter content is analyzed using OpenAI's GPT-3.5 to detect the dominant emotion.

2. **Emotion Mapping**: Detected emotions are mapped to specific colors:
   - happy → Gold (#FFD700)
   - sad → Cornflower Blue (#6495ED)
   - reflective → Medium Purple (#9370DB)
   - excited → Tomato (#FF6347)
   - calm → Light Sea Green (#20B2AA)
   - anxious → Dark Orange (#FF8C00)
   - grateful → Lime Green (#32CD32)
   - hopeful → Sky Blue (#87CEEB)
   - curious → Medium Orchid (#BA55D3)
   - loving → Hot Pink (#FF69B4)
   - lonely → Slate Gray (#708090)
   - confused → Peru (#CD853F)
   - inspired → Dark Turquoise (#00CED1)

3. **Fallback System**: If OpenAI is unavailable, a keyword-based algorithm provides emotion detection.

## 🚀 Development Setup

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

## 📦 Project File Structure

### Backend Structure
```
backend/
├── src/
│   ├── config/        # Configuration settings
│   ├── controllers/   # Request handlers
│   ├── routes/        # API route definitions
│   ├── services/      # Business logic
│   ├── types/         # TypeScript type definitions
│   ├── utils/         # Utility functions
│   ├── scripts/       # Maintenance scripts
│   ├── index.ts       # Application entry point
│   └── startup.ts     # Startup configuration
├── .env               # Environment variables
├── package.json       # Dependencies
└── tsconfig.json      # TypeScript configuration
```

### Frontend Structure
```
frontend/
├── app/               # Next.js pages and routes
│   ├── auth/          # Authentication pages
│   ├── constellation/ # Constellation visualization
│   ├── letters/       # Letter viewing pages
│   ├── profile/       # User profile page
│   ├── writing/       # Letter composition
│   ├── layout.tsx     # Root layout component
│   └── page.tsx       # Home page
├── components/        # Reusable components
│   ├── ui/            # UI components
│   ├── auth-provider.tsx  # Authentication context
│   └── visualization/ # Visualization components
├── lib/               # Utility libraries
│   ├── api.ts         # API client
│   ├── clustering.ts  # Clustering algorithms
│   └── utils.ts       # Utility functions
├── styles/            # SCSS stylesheets
│   ├── components/    # Component styles
│   ├── _variables.scss # Global variables
│   └── globals.scss   # Global styles
├── public/            # Static assets
├── .env.local         # Environment variables
└── package.json       # Dependencies
```

## 🌠 Deployment Considerations

### Frontend Deployment
- Static site generation with Next.js
- Vercel or Netlify for hosting
- Environment variable configuration
- HTTPS enforcement

### Backend Deployment
- Node.js hosting with Express
- Environment variable security
- API rate limiting
- Error logging and monitoring
- Database connection pooling

### Database Deployment
- Supabase managed PostgreSQL
- Regular backups
- Connection security
- Query performance optimization

## 🔒 Security Considerations

- HttpOnly cookies for authentication
- CORS configuration for API access
- Input validation on all endpoints
- Rate limiting for API requests
- Content filtering for submissions
- Secure environment variable handling
- No sensitive data exposed to the frontend

## 🧠 Design Principles

1. **Simplicity Over Complexity**: Clear, expressive, maintainable code
2. **Human-Centered**: Technology in service of the human experience
3. **Subtle Aesthetics**: Visual elements enhance without overwhelming
4. **Privacy-Focused**: Minimal data collection, anonymous by default
5. **Accessibility**: Available to everyone, graceful degradation
6. **Clean Styling**: No inline styles, everything in SCSS for readability and maintainability

## 📝 Future Development Roadmap

### Phase 1.1
- Enhanced mobile optimization
- Advanced clustering algorithms
- User profile enhancements
- Drawing capabilities

### Phase 2.0
- Voice letter recording
- Temporal visualizations (letters over time)
- Improved accessibility features
- AI-powered letter discovery
- Social sharing capabilities
- Language translation

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.