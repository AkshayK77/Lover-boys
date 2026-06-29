# MotionLab

**Sports science education meets intelligent fitness tracking.**

MotionLab merges expert-reviewed biomechanics content with AI-powered workout planning, so every exercise recommendation is grounded in movement science, every warmup protocol is sport-specific, and the AI coach knows your full training history.

---

## What it is

Most recreational athletes train in a knowledge vacuum. YouTube technique videos have no injury context. Fitness apps track workouts but don't explain why the exercises exist. Sports physios provide expert guidance at a cost most athletes can't sustain.

MotionLab is the fix: a platform that teaches you the sports science behind your sport and connects that knowledge directly to how you train.

**8 sports. 5 pillars deep each:**
- **Learn the Sport** — technique, biomechanics, skill progressions
- **Movement Science** — joint mechanics, force vectors, kinetic chain analysis
- **Injury Prevention** — expert-reviewed warmup protocols, risk reduction
- **Training** — sport-supplementary strength plans with progressive overload
- **Recovery** — load management, deload science, return-to-play protocols

**Phase 2 (current):** Table Tennis and Football with full 5-pillar coverage. Basketball, Badminton, Running, Tennis, Cycling, Swimming in 2025.

---

## Stack

| Layer | Technology |
|---|---|
| Frontend | React 19 + TypeScript 6 (strict) + Tailwind CSS 4 + Vite 8 |
| Routing | React Router 7 |
| Backend | Supabase (Auth, PostgreSQL, Edge Functions, Storage, RLS) |
| AI | Groq LLM via Supabase Edge Function — key server-side only, never in client bundle |
| Offline | IndexedDB (offline-first workout session tracking, background sync) |
| Native | Capacitor (`com.motionlab.app`) — iOS + Android |
| Analytics | PostHog (anonymous session IDs only, no PII) |
| Error tracking | Sentry (PII scrubbed before logging) |

---

## Project structure

```
motionlab/
├── src/
│   ├── components/
│   │   ├── layout/          # PublicLayout, AppLayout
│   │   ├── navigation/      # PublicNav (dark glass, 1400px breakpoint)
│   │   └── ui/
│   │       ├── FuturisticElements.tsx   # Shared design system primitives
│   │       ├── AnatomyDiagram.tsx       # Interactive full-body SVG muscle diagram
│   │       └── ...                      # Button, Input, Card, Badge, etc.
│   ├── contexts/            # AuthContext, UIContext
│   ├── lib/                 # supabase.ts, profiles.ts, utils.ts
│   ├── pages/
│   │   ├── public/          # HomePage, SportsPage, SportDetailPage, AboutPage, etc.
│   │   ├── app/             # DashboardPage, LearningPathsPage, MovementSciencePage, etc.
│   │   ├── auth/            # AuthPage (login + signup + password reset)
│   │   └── onboarding/      # OnboardingPage (6-step profile builder)
│   ├── types/               # Shared TypeScript types (Profile, etc.)
│   └── index.css            # Design tokens + futuristic CSS utilities
├── supabase/
│   └── migrations/          # 5 SQL migration files — exact PRD §8 schema
└── public/
```

---

## Design system

Dark futuristic aesthetic — not "default AI startup blue."

| Token | Value | Usage |
|---|---|---|
| `--color-void` | `#080C14` | Hero / dark section background |
| `--color-void-mid` | `#0D1420` | Secondary dark sections |
| `primary-olive` | `#606C38` | Brand anchor, primary CTAs, active states |
| `primary-green` | `#264653` | Secondary accent |
| `--color-grid-line` | `rgba(96,108,56,0.12)` | CSS grid overlay on dark sections |

**CSS utilities:** `.grid-overlay`, `.scanline`, `.card-futuristic`, `.text-gradient-olive`, `.pill-tag`, `.step-badge`, `.bracket`, `.hr-node`

**Shared components:** `NodeLine`, `CornerBox`, `PillTag`, `SectionHeader`, `FuturisticCard`, `LightCard`, `StepBadge`, `DarkSection`, `AnatomyDiagram`

---

## Getting started

```bash
# Install dependencies
npm install

# Copy environment template
cp .env.example .env.local
# Fill in your Supabase project URL and anon key

# Start dev server
npm run dev

# Build for production
npm run build
```

### Environment variables

```bash
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

> **Security:** The `GROQ_API_KEY` and `USDA_API_KEY` live exclusively in Supabase Edge Function secrets. They are never exposed to the client bundle.

### Database setup

```bash
# Apply all migrations to your Supabase project
supabase db push

# Or link and push
supabase link --project-ref your-project-ref
supabase db push
```

The 5 migration files in `supabase/migrations/` create the complete schema:
- `001` — Profiles, roles, notifications, bookmarks, sport schedules
- `002` — Education (sports, experts, learning paths, modules, lessons, articles, certifications)
- `003` — Training (exercises, workout plans, sessions, measurements, muscle volume log, progress photos)
- `004` — Nutrition (meal history, Indian food database with 25 seeded items)
- `005` — Community (discussions, comments, votes with triggers) + AI coach conversations

All tables have RLS enabled. Test RLS policies before marking any table production-ready.

---

## Security constraints

These are non-negotiable:

- All API keys (Groq, USDA) server-side via Supabase Edge Functions only — never in client bundle
- RLS on every table
- No PII in PostHog — anonymous session IDs only
- No PII in Sentry — scrub user-identifying fields before logging
- Progress photos: private Supabase Storage bucket, signed URLs only
- Community image uploads: public bucket (user-consented for community sharing)

---

## Phase roadmap

| Phase | Weeks | Status |
|---|---|---|
| Phase 1 — Foundation | 1–4 | Complete |
| Phase 2 — Core Platform | 5–10 | In progress |
| Phase 3 — AI + Depth | 11–16 | Upcoming |
| Phase 4 — Growth | 17–24 | Upcoming |

**Phase 2 deliverables (current):**
- [x] Sport detail pages (5 pillars) — TT + Football with full content
- [x] Learning paths page (beginner → advanced per sport)
- [x] Movement Science page with interactive anatomy diagram
- [x] Injury Prevention page with warmup protocols
- [ ] Community (Reddit-style, sport-tagged)
- [ ] AI Coach page
- [ ] Workout tracking
- [ ] Nutrition logging

---

## Built by

**Aditya Saiprasad** — Education, Content & Community  
[linkedin.com/in/aditya-saiprasad](https://www.linkedin.com/in/aditya-saiprasad/)

**Akshay Kannan** — Training, AI & Infrastructure  
[linkedin.com/in/akshay-kannan-8403ba230](https://www.linkedin.com/in/akshay-kannan-8403ba230/)
