# Portfolio

Personal portfolio site — a Next.js frontend and a small Express API, kept in
separate folders in one repo.

```
Portfolio/
├── frontend/   Next.js 16 · React 19 · Tailwind v4 · Motion
└── backend/    Node · Express 5 · TypeScript · Zod
```

## Running it locally

Two terminals.

**Backend** (port 4000):

```bash
cd backend
cp .env.example .env
npm install
npm run dev
```

**Frontend** (port 3000):

```bash
cd frontend
cp .env.example .env.local
npm install
npm run dev
```

Open http://localhost:3000.

## Editing the content

Everything on the site — name, projects, jobs, skills, achievements, links —
lives in a single file: `frontend/src/data/site.ts`. Items marked `TODO` are
placeholders. Change that file and the whole site updates; no component edits
needed.

Drop `resume.pdf` and `avatar.jpg` into `frontend/public/`.

## Contact form

The form posts to `POST /api/contact` on the backend, which validates the
payload, rate-limits by IP, and screens bots with a honeypot field.

Without `RESEND_API_KEY` set, messages are logged to the backend console
instead of emailed — so local development needs no accounts or secrets. Set the
key (and `CONTACT_TO_EMAIL`) in `backend/.env` to send real email.

## Deploying

- **Frontend** → Vercel. Set root directory to `frontend`, and set
  `NEXT_PUBLIC_API_URL` to the deployed backend URL.
- **Backend** → Render, Railway, or Fly. Set root directory to `backend`,
  build `npm run build`, start `npm start`, and set `ALLOWED_ORIGINS` to the
  deployed frontend URL.
