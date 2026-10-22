# PrepTrack

PrepTrack is a syllabus-first exam preparation tracker. Anyone can browse exams and their subjects/topics; Google sign-in enables topic progress, a personal dashboard, and role-gated syllabus administration.

## Requirements

- Node.js 20+
- The PrepTrack Spring Boot API running at `http://localhost:8080`
- A Google OAuth Web Client ID with `http://localhost:3000` configured as an authorized JavaScript origin. Add `http://localhost:3001` too if port 3000 is occupied.

## Setup

1. Copy `.env.example` to `.env.local`.
2. Set `NEXT_PUBLIC_GOOGLE_CLIENT_ID` to the same Google OAuth client ID configured by the backend. `NEXT_PUBLIC_API_URL` defaults to `http://localhost:8080`.
3. Install and run the frontend:

   ```bash
   npm install
   npm run dev
   ```

4. Open `http://localhost:3000`.

The backend must allow credentialed CORS requests from the frontend origin. The Spring Security configuration in this repository allows `localhost:3000` and `localhost:3001` for local development.

## Routes

- `/` — public home and exam catalog
- `/exams/[id]` — public syllabus with optional signed-in progress tracking
- `/dashboard` — signed-in user's topic totals and started exams
- `/admin` — exam, subject, and topic management for `ADMIN` users

## Checks

```bash
npm run lint
npm run build
```
