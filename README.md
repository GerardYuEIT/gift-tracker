# Gift Tracker

A small app for keeping track of who you're getting gifts for, what occasion, and your gift ideas/status (planned, bought, given).

**Live demo:** https://gift-tracker-eg.netlify.app/

## Features

- Add, edit, and delete people with an occasion (birthday, Christmas, wedding, etc.) and notes
- Add, edit, and delete gift ideas per person, with price, link, and status
- Search and filter people by name/occasion
- Light/dark theme

## Tech stack

- **Frontend:** React, TypeScript, Vite, Tailwind CSS
- **Backend:** Spring Boot, deployed on Railway

## Team

- Frontend: Gerard
- Backend: Ethan

## Running locally

```bash
npm install
npm run dev
```

The app talks to the live backend at `https://gift-tracker-api-production.up.railway.app` (configured in `src/api/client.ts`) — no local backend setup needed.
