# WK Poule 2026 - Elloro X Recranet

WK Poule voor het FIFA WK 2026 (USA/Canada/Mexico). Voorspel de uitslagen van alle wedstrijden en strijd met je collega's om de eerste plek!

## Features

- **Voorspellingen** — Vul voor elke wedstrijd je verwachte uitslag in
- **Live scores** — Wedstrijduitslagen worden automatisch opgehaald
- **Leaderboard** — Realtime stand met puntenoverzicht
- **Bonusvragen** — Extra punten voor voorspellingen over het toernooi
- **Google login** — Snel inloggen met je Google account, of maak een account aan met email

## Puntentelling

| Voorspelling | Punten |
|---|---|
| Exacte score (bijv. 2-1 en het wordt 2-1) | **5** |
| Juist doelpuntenverschil (bijv. 3-1 en het wordt 2-0) | **3** |
| Juiste winnaar of gelijkspel | **2** |

### Bonusvragen (in te vullen voor het toernooi)

- Wie wordt wereldkampioen? (10 pt)
- Wie wordt de verliezend finalist? (7 pt)
- Wie wordt topscorer? (7 pt)
- Hoe ver komt Nederland? (5 pt)
- Hoeveel doelpunten in totaal? (5 pt)
- Welk land krijgt de eerste rode kaart? (5 pt)

## Setup

### 1. Installatie

```bash
npm install
cp .env.local.example .env.local
```

### 2. Supabase

1. Maak een project aan op [supabase.com](https://supabase.com)
2. Voer `supabase-schema.sql` uit in de SQL Editor
3. Schakel Google OAuth in onder Authentication > Providers
4. Kopieer de API keys naar `.env.local`

### 3. Football-data.org

1. Registreer op [football-data.org](https://www.football-data.org/client/register) (gratis)
2. Voeg je API key toe aan `.env.local`

### 4. Lokaal draaien

```bash
npm run dev
```

### 5. Wedstrijden laden

```bash
curl "http://localhost:3000/api/sync-matches?secret=JE_SYNC_SECRET"
```

### 6. Deployen naar Vercel

1. Push naar GitHub
2. Importeer het project op [vercel.com](https://vercel.com)
3. Voeg de environment variables toe
4. Stel een [Vercel Cron Job](https://vercel.com/docs/cron-jobs) in om wedstrijden periodiek te syncen

## Tech Stack

- [Next.js](https://nextjs.org/) 16 (App Router)
- [Tailwind CSS](https://tailwindcss.com/) v4
- [Supabase](https://supabase.com/) (PostgreSQL, Auth)
- [football-data.org](https://www.football-data.org/) API
