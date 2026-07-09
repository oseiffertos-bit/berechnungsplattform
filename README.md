# Berechnungsplattform

Next.js 15 · Supabase · Vercel

## Deployment

### 1. Supabase
- Neues Projekt anlegen
- SQL Editor → `SUPABASE_SETUP.sql` ausführen
- Project Settings → API → URL und anon key kopieren

### 2. GitHub
- Repository anlegen, ZIP-Inhalt hochladen

### 3. Vercel
- GitHub Repo importieren
- Environment Variables setzen:
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- Deploy

### 4. Supabase Redirect URL
- Authentication → URL Configuration
- Site URL: `https://deine-app.vercel.app`
- Redirect URLs: `https://deine-app.vercel.app/**`

## Lokale Entwicklung
```bash
npm install
cp .env.local.example .env.local
# .env.local befüllen
npm run dev
```
