# WK Poule 2026 - Elloro X Recranet

## Project Overview
A World Cup 2026 prediction pool (poule) web app for Elloro X Recranet colleagues (~35 participants).

## Tech Stack
- **Framework**: Next.js 16 (App Router, TypeScript)
- **Styling**: Tailwind CSS v4
- **Database & Auth**: Supabase (PostgreSQL, Google OAuth + email/password)
- **Match Data**: football-data.org API (free tier, 10 req/min)
- **Hosting**: Vercel (free tier)

## Project Structure
```
src/
├── app/
│   ├── (app)/              # Authenticated app pages (layout with nav)
│   │   ├── page.tsx        # Leaderboard (home)
│   │   ├── wedstrijden/    # Match overview
│   │   ├── voorspellingen/ # Prediction entry
│   │   └── bonus/          # Bonus questions
│   ├── api/sync-matches/   # API route to sync match data from football-data.org
│   ├── auth/callback/      # OAuth callback handler
│   ├── login/              # Login page
│   └── register/           # Registration page
├── components/             # Client components (PredictionForm, BonusForm, Navigation)
└── lib/
    ├── supabase/           # Supabase client (browser, server, middleware)
    └── types/              # Database types
```

## Key Commands
- `npm run dev` — Start development server
- `npm run build` — Production build
- `curl /api/sync-matches?secret=$SYNC_SECRET` — Sync match data from football-data.org

## Database
- Schema defined in `supabase-schema.sql`
- Points are auto-calculated via database triggers when match results are updated
- RLS policies ensure users can only edit their own predictions

## Scoring System
- Exact score: 5 points
- Correct goal difference: 3 points
- Correct winner/draw: 2 points
- Bonus questions: 5-10 points each

## Environment Variables
See `.env.local.example` for required variables.

## Language
- UI is in Dutch (Nederlands)
- Code and comments in English
