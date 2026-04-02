# WK Poule 2026 - Elloro X Recranet

## Project Overview
A World Cup 2026 prediction pool (poule) web app for Elloro X Recranet colleagues (~35 participants).
Deployed at https://wk-poule-theta.vercel.app

## Tech Stack
- **Framework**: Next.js 16 (App Router, TypeScript)
- **Styling**: Tailwind CSS v4, Clash Display font
- **Database & Auth**: Supabase (PostgreSQL, email/password auth)
- **Match Data**: football-data.org API (free tier, 10 req/min)
- **Hosting**: Vercel (free tier), auto-deploys from GitHub

## Project Structure
```
src/
├── app/
│   ├── (app)/              # Authenticated app pages (layout with nav)
│   │   ├── page.tsx        # Leaderboard (home) with scoring explanation
│   │   ├── wedstrijden/    # Matches + predictions combined, group standings
│   │   ├── bonus/          # Bonus questions (tournament + group predictions)
│   │   ├── profiel/        # User profile (name + avatar)
│   │   └── admin/          # Admin page for scoring bonus questions
│   ├── api/sync-matches/   # API route to sync match data from football-data.org
│   ├── auth/callback/      # OAuth callback handler
│   ├── login/              # Login page
│   └── register/           # Registration page
├── components/
│   ├── PredictionForm.tsx   # Match prediction input (locks at match start)
│   ├── BonusForm.tsx        # Bonus question input (full-width mobile)
│   ├── GroupStandings.tsx   # Group stage standings table
│   ├── AdminBonusScorer.tsx # Admin: score bonus questions (auto + manual)
│   ├── Navigation.tsx       # Orange navbar, responsive mobile tabs
│   ├── ProfileForm.tsx      # Profile editor with emoji avatars
│   └── Tooltip.tsx          # Custom tooltip via React portal
└── lib/
    ├── supabase/           # Supabase client (browser, server, middleware)
    └── types/              # Database types
```

## Key Commands
- `npm run dev` — Start development server
- `npm run build` — Production build
- `vercel --prod` — Deploy to production
- `curl /api/sync-matches?secret=$SYNC_SECRET` — Sync match data from football-data.org

## Database
- Schema defined in `supabase-schema.sql`
- Supabase project ref: `ltgnvwnfjfabvujotwae`
- Points are auto-calculated via database triggers when match results are updated
- RLS policies: users can only edit own predictions, predictions visible after match starts
- Bonus question points are scored manually via /admin

## Scoring System
### Match predictions
- Exact score: 5 points
- Correct goal difference: 3 points
- Correct winner/draw: 2 points

### Bonus questions (scored manually by admin)
- Tournament questions: 7-15 points each (champion, top scorer, cards, etc.)
- Group predictions: 3 pts for correct group winner, 2 pts for correct runner-up (12 groups)

## Admin
- Admin page at /admin (restricted by email whitelist in admin/page.tsx)
- Current admins: rens@recranet.com, rens@elloro.nl, rensmaljers@gmail.com, dazz@elloro.nl
- Auto-score: type correct answer, scores all exact matches (case-insensitive)
- Manual score: click 0 or max points per individual prediction

## Environment Variables
See `.env.local.example` for required variables.

## Language
- UI is in Dutch (Nederlands)
- Code and comments in English
