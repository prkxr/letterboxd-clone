## CineJournal (Letterboxd-Style Platform)

CineJournal is a full-stack movie tracking and social discovery platform inspired by Letterboxd, built with Next.js, Prisma, NextAuth, PostgreSQL, and TMDB.

### Implemented Foundation

- Authentication with NextAuth (Google + GitHub)
- User profiles with social graph (follow/unfollow)
- Film logging and ratings
- Reviews + review engagement groundwork
- Watchlists and custom lists
- Tagging for logs and lists
- Activity feed and notifications
- Discovery filters powered by TMDB
- Recommendation engine using ratings + social signals
- Admin metrics endpoint and admin page
- Scalable API route architecture with shared guards/utilities
- Modern vintage cinematic UI with film grain, muted palettes, poster-focused cards, and responsive light/dark theming support

### Stack

- Next.js App Router
- Prisma ORM + PostgreSQL
- NextAuth v5
- TMDB API integration
- Tailwind CSS v4

### Environment Variables

Required:

- `DATABASE_URL`
- `DIRECT_URL`
- `TMDB_API_KEY`
- `AUTH_SECRET`
- `NEXTAUTH_SECRET`
- `NEXTAUTH_URL`
- `AUTH_GOOGLE_ID`
- `AUTH_GOOGLE_SECRET`
- `AUTH_GITHUB_ID` (optional)
- `AUTH_GITHUB_SECRET` (optional)

Google OAuth setup must also include an authorized redirect URI that matches your app URL exactly, for example:

- `http://localhost:3000/api/auth/callback/google`

If you deploy elsewhere, add that production callback URL in Google Cloud Console too.

### Setup

1. Install dependencies:

```bash
npm install
```

2. Generate Prisma client:

```bash
npx prisma generate
```

3. Push schema to DB (or use migrate in your workflow):

```bash
npx prisma db push
```

4. Start development:

```bash
npm run dev
```

### Key Routes

- `/` Home + TMDB search + trending
- `/login` Auth page
- `/app` Personal dashboard
- `/discover` Search/discovery filters
- `/recommendations` Personalized recommendations
- `/profile/[username]` Public profile
- `/admin` Admin panel

### API Surface (Core)

- `POST /api/logs`, `GET /api/logs`
- `POST /api/reviews`, `GET /api/reviews`
- `POST|DELETE|GET /api/watchlist`
- `POST|GET /api/lists`
- `POST|DELETE /api/lists/[id]/items`
- `POST|DELETE /api/social/follow`
- `GET /api/feed`
- `GET|PATCH /api/notifications`
- `GET|POST /api/discovery/search`
- `GET|POST /api/recommendations`
- `GET /api/admin/metrics`

### Notes

A full production clone still needs iterative hardening:

- stricter input validation (zod/class-validator)
- rate limiting and abuse controls
- background jobs for fan-out notifications
- richer recommendation model
- complete moderation tooling and audit logs
