# CreatorFlow AI 🚀

> **AI-Powered Audience Intelligence and YouTube Content Automation Platform**  
> *From audience insights to action.*

CreatorFlow AI helps YouTube creators turn their audience comments into data-driven content strategies. It uses Google Gemini AI to analyze comments, identify trending topics, generate content ideas, scripts, and SEO-optimized metadata — all in one beautiful dashboard.

---

## ✨ Features

| Feature | Description |
|---|---|
| **Audience Intelligence** | Sentiment analysis, unanswered questions extraction, topic clustering |
| **Content Planner** | AI idea generator with virality scores, script/outline creator |
| **Content Calendar** | Interactive monthly calendar for scheduling uploads and streams |
| **Stream Studio** | AI agenda planner, pre-stream checklist, stream templates |
| **Video Management** | Performance stats, AI SEO optimizer for titles/tags/descriptions |
| **Integrations** | YouTube Data API connection, sync frequency settings |
| **Settings** | Channel persona, AI model preferences, API key management |
| **Demo Mode** | Full demo experience with rich mock data — no API keys needed |

---

## 🛠 Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Styling**: Tailwind CSS v4 with custom design system
- **AI**: Google Gemini 1.5 Flash (via `@google/generative-ai`)
- **Database**: MongoDB (via Mongoose + connection pooling)
- **Auth**: NextAuth v5 (Google OAuth + demo credential fallback)
- **State**: TanStack React Query
- **Icons**: Lucide React
- **Types**: Zod schema validation

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn
- (Optional) MongoDB Atlas account
- (Optional) Google Cloud project with YouTube Data API v3 enabled
- (Optional) Google AI Studio account for Gemini API

### 1. Clone & Install

```bash
git clone https://github.com/Gauravkkaushal/CreatorFlow.git
cd CreatorFlow
npm install
```

### 2. Environment Variables

Copy the example file and fill in your values:

```bash
cp .env.example .env.local
```

Edit `.env.local`:

```env
# ─── Required for real data ────────────────────────────────────────────────
GEMINI_API_KEY=AIza...                # Google AI Studio → API Keys
MONGODB_URI=mongodb+srv://...         # MongoDB Atlas connection string
YOUTUBE_API_KEY=AIza...               # Google Cloud Console → YouTube Data API v3

# ─── Google OAuth (required for real auth) ─────────────────────────────────
GOOGLE_CLIENT_ID=...apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-...
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=<random-32-char-string>

# ─── Demo mode (set to true to skip all API calls) ─────────────────────────
DEMO_MODE=true
NEXT_PUBLIC_DEMO_MODE=true
```

> **Tip**: If `DEMO_MODE=true` or any required key is missing, the app automatically uses mock data — perfect for exploring the UI without any setup.

### 3. Run the Dev Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

- **Landing page**: `http://localhost:3000`
- **Dashboard**: `http://localhost:3000/dashboard`
- **Demo login**: Click "Try Demo" on the landing page (no credentials needed)

---

## 📁 Project Structure

```
creatorflow-ai/
├── app/
│   ├── (dashboard)/          # Protected dashboard routes
│   │   ├── dashboard/        # Overview page
│   │   ├── audience/         # Audience intelligence
│   │   ├── content-planner/  # Content ideas & scripts
│   │   ├── calendar/         # Scheduling calendar
│   │   ├── stream-studio/    # Live stream planner
│   │   ├── video-management/ # Video SEO optimizer
│   │   ├── integrations/     # API connections
│   │   └── settings/         # User preferences
│   ├── api/
│   │   ├── auth/             # NextAuth routes
│   │   ├── ai/               # AI generation endpoints
│   │   ├── audience/         # Audience insights API
│   │   ├── calendar/         # Calendar CRUD API
│   │   ├── videos/           # Video optimization API
│   │   └── channel/          # Channel sync API
│   ├── globals.css           # Design system & Tailwind
│   ├── layout.tsx            # Root layout
│   └── page.tsx              # Landing page
├── components/
│   └── layout/               # Sidebar, top nav
├── lib/
│   ├── auth.ts               # NextAuth configuration
│   ├── demo-mode.ts          # Demo data & mode detection
│   ├── mongodb.ts            # Mongoose connection
│   └── utils.ts              # Formatting helpers
├── models/                   # Mongoose data models
│   ├── User.ts
│   ├── ConnectedChannel.ts
│   ├── ContentIdea.ts
│   ├── AudienceAnalysis.ts
│   ├── ScheduledBroadcast.ts
│   └── ...
├── schemas/                  # Zod validation schemas
├── services/
│   ├── ai/index.ts           # Gemini AI adapter + Demo adapter
│   └── youtube/index.ts      # YouTube Data API v3 service
└── types/index.ts            # Shared TypeScript types
```

---

## 🔌 API Endpoints

| Method | Path | Description |
|---|---|---|
| `POST` | `/api/ai/generate-ideas` | Generate content ideas from a topic/prompt |
| `POST` | `/api/ai/generate-script` | Generate video outline, hooks, and description |
| `GET` | `/api/audience/insights` | Get comment sentiment and topic clusters |
| `GET/POST/PUT/DELETE` | `/api/calendar` | Full CRUD for calendar events |
| `POST` | `/api/videos/optimize` | AI SEO optimizer for titles, tags, descriptions |
| `POST` | `/api/channel/sync` | Trigger YouTube channel data refresh |

---

## 🏗 Build for Production

```bash
# Type-check
npx tsc --noEmit

# Lint
npm run lint

# Production build
npm run build

# Start production server
npm start
```

---

## 🤝 Contributing

1. Fork the repo
2. Create your feature branch: `git checkout -b feature/my-feature`
3. Commit your changes: `git commit -m 'feat: add my feature'`
4. Push to the branch: `git push origin feature/my-feature`
5. Open a Pull Request

---

## 📄 License

MIT — see [LICENSE](LICENSE) for details.
