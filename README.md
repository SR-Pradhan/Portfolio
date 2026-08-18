# Portfolio

Personal portfolio for **Sruti Ranjan Pradhan**, an aspiring AI Engineer with a backend
development foundation. A single-page site with an AI assistant that answers questions
about my work, backed by a small Express API.

**Live:** [portfolio-omega-jade-83.vercel.app](https://portfolio-omega-jade-83.vercel.app)

---

## What's in it

- **Scroll HUD** across the top that tracks how much of the page you've covered
- **AI chatbot** that answers questions about my background, streamed token by token
  over Server-Sent Events. Its knowledge base is generated from the site's own content,
  so it can't invent an employer or a grade.
- **Achievements** as an alternating timeline. Hovering a card unlocks a fan of proof
  photos; clicking opens them full size, which is also the only route on mobile where
  there is no hover.
- **Education** drawn along a serpentine SVG curve, with the node for each entry
  measured off the path rather than positioned by hand
- **Contact form** with server-side validation, a honeypot field, and per-IP rate
  limiting
- **Light and dark themes**, no flash on first paint
- **Reduced-motion support** throughout: the starfield renders static, the cursor
  follower doesn't mount, and scroll-driven transforms are skipped

## Stack

**Frontend** Next.js 16 (App Router, Turbopack) · React 19 · TypeScript ·
Tailwind CSS v4 · Motion · deployed on Vercel

**Backend** Express 5 · TypeScript · Zod · Groq (`openai/gpt-oss-120b`) ·
Resend · deployed on Render

Tailwind v4 is configured CSS-first. There is no `tailwind.config.js`; design tokens
live in `@theme inline` inside `frontend/src/app/globals.css`.

## Layout

```
Portfolio/
├── frontend/                 Next.js app
│   ├── public/
│   │   ├── proof/            achievement photos, content-hashed filenames
│   │   └── certificates/     certificate scans
│   ├── scripts/
│   │   └── add-proof.mjs     converts, hashes and files images
│   └── src/
│       ├── app/              layout, page, metadata, robots, sitemap, OG image
│       ├── components/       one file per section, plus shared UI
│       ├── data/site.ts      ← all content lives here
│       ├── hooks/
│       └── lib/
└── backend/                  Express API
    ├── scripts/
    │   ├── sync-context.ts   generates the chatbot's knowledge base from site.ts
    │   └── copy-data.mjs     copies that JSON into the build output
    └── src/
        ├── routes/           /api/chat, /api/contact
        └── lib/              Groq client, mailer
```

**All text content lives in one file: `frontend/src/data/site.ts`.** Components hold no
copy. Changing a project description, a job title or a skill means editing that file and
nothing else.

## Running locally

Two terminals:

```bash
cd backend  && npm install && cp .env.example .env       && npm run dev   # :4000
cd frontend && npm install && cp .env.example .env.local  && npm run dev   # :3000
```

Neither `.env` needs filling in to start. Without `GROQ_API_KEY` the chat endpoint
replies with a message pointing at my email instead of failing, and without
`RESEND_API_KEY` contact submissions are logged to the console. Both degrade rather
than break, so a fresh clone runs with no accounts and no keys.

### Checks before committing

```bash
cd frontend && npx tsc --noEmit && npm run build
cd backend  && npm run typecheck
```

### After editing content

```bash
cd backend && npm run sync:context   # regenerate the chatbot's knowledge base
```

Then restart the backend. The context is read once at import, so a running server keeps
serving the previous version even though the file on disk has changed.

### Adding proof photos

```bash
cd frontend && node scripts/add-proof.mjs nexify photo-1.jpg photo-2.jpg
```

Converts each image to WebP, caps the long edge at 1280px, and writes it with a content
hash in the filename. The hash is not decoration: Next's image optimizer caches by URL
and rejects query strings, so a changed filename is the only thing that reliably
invalidates a replaced image. The script prints the line to paste into `site.ts`.

## Deploying

Backend first, since the frontend build needs its URL.

**Backend** on Render: root directory `backend`, build `npm install && npm run build`,
start `npm start`. Set `GROQ_API_KEY` and `ALLOWED_ORIGINS`.

**Frontend** on Vercel: root directory `frontend`. Set `NEXT_PUBLIC_API_URL` to the
backend URL and `NEXT_PUBLIC_SITE_URL` to the site's own origin.

Then set `ALLOWED_ORIGINS` on the backend to the deployed frontend origin, or CORS
blocks both the chat and the contact form.

`NEXT_PUBLIC_*` values are inlined at build time, so changing one requires a redeploy,
not just an environment edit.

## Notes

- The chatbot only accepts `user` and `assistant` roles from the client. A visitor
  cannot inject a `system` message, which is the main defence against prompt injection.
- Model output is rendered as React elements, never as HTML. A visitor can steer what
  the model says, so `dangerouslySetInnerHTML` on that output would be an injection
  surface.
- Rate limits are in-memory and per-IP: 5 contact messages and 30 chat messages per
  hour. Fine for one instance; a multi-instance deployment would need shared state.

---

Designed and built by Sruti Ranjan Pradhan.
