# Kamis Maker

A web app to classify and rank your played games and watched movies using custom tier categories — from Red to Platinum.

Built with **Next.js 16**, **Tailwind CSS**, and **Supabase** (PostgreSQL). Deployable to **Vercel**.

## Score Categories (worst to best)

Red, Yellow, Bronze Yellow, Bronze, Silver Bronze, Silver, Gold Silver, Gold, Platinum Gold, Platinum

## Features

- **Games list** — Add/edit/delete games with name, picture, start/finish dates, "left unfinished" flag, and score
- **Movies list** — Add/edit/delete movies with name, picture, watch date, and score
- **Sorting** — Sort games by start date, finish date, or score; sort movies by watch date or score
- **Tier List** — Visual tier list view of games ranked by category, filterable by year
- **PNG Export** — Download the tier list as a PNG image

## Setup

### 1. Supabase

1. Create a free project at supabase.com
2. Go to the SQL Editor and run the contents of `supabase/migration.sql`
3. Copy your project URL and anon key from Settings > API

### 2. Environment Variables

```bash
cp .env.local.example .env.local
```

Edit `.env.local` with your Supabase credentials:

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### 3. Install & Run

```bash
npm install
npm run dev
```

Open http://localhost:3000

### 4. Deploy to Vercel

1. Push to a Git repository
2. Import the project into Vercel
3. Add the two environment variables in the Vercel project settings
4. Deploy
