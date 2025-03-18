# 🖋️ Letters to Al

A poetic, human-centered space for expressing thoughts, feelings, and reflections. Letters to Al allows people to write anonymous letters that join a constellation of shared human experiences, visualized in an interactive 3D star map.

## ✨ Project Philosophy

Letters to Al is not primarily a technological showcase, but a timeless, human-centered, expressive space. The technology serves the emotional, poetic experience rather than drawing attention to itself.

## 🌟 Features

- **Write Letters**: Share your thoughts anonymously or with an optional account
- **Explore the Constellation**: Navigate a 3D visualization where each letter is represented as a star
- **Emotional Clustering**: Letters are arranged based on emotional similarity, creating natural patterns
- **Minimal & Poetic**: Focus on the human experience, not technological complexity

## 🚀 Tech Stack

### Frontend
- Next.js with React & TypeScript
- Tailwind CSS for styling
- Three.js for 3D visualization
- Framer Motion for animations

### Backend
- Express.js with TypeScript
- Supabase for database and authentication

## 🛠️ Development Setup

### Prerequisites
- Node.js (v18+)
- npm or yarn
- Supabase account

### Environment Variables

#### Frontend (`.env.local`)
```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

#### Backend (`.env`)
```
PORT=3001
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_KEY=your_supabase_service_key
```

### Database Setup

Create a `letters` table in Supabase with the following schema:

```sql
CREATE TABLE letters (
  id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
  content text NOT NULL,
  drawing jsonb, -- Vector graphic data for drawings
  embedding jsonb, -- AI-generated emotional embedding as JSON array
  cluster_id integer, -- Emotional cluster ID
  created_at timestamp DEFAULT now(),
  anonymous boolean DEFAULT true,
  author_id uuid REFERENCES auth.users(id) -- optional
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

## 📝 Development Phases

### Phase 0.1 (Current MVP)
- Basic writing UI (letters only)
- Supabase integration
- Initial constellation view

### Phase 0.2 (Next Steps)
- AI embeddings integration
- Enhanced clustering
- Drawing mode

### Phase 1.0 (Future Release)
- Complete polished aesthetics
- Mobile optimization
- Accessibility refinements

## 🧠 Design Principles

1. **Simplicity Over Complexity**: Clear, expressive, maintainable code
2. **Human-Centered**: Technology in service of the human experience
3. **Subtle Aesthetics**: Visual elements enhance without overwhelming
4. **Privacy-Focused**: Minimal data collection, anonymous by default
5. **Accessibility**: Available to everyone, graceful degradation

## 🤝 Contributing

Contributions that align with our philosophical and technical approach are welcome. Please read the `.cursorrules` file for detailed development guidelines.

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.