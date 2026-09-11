# Flowline — Frontend

React/Vite client for Flowline, a Trello/Asana-style project management tool. Built for the CodeAlpha Full Stack Development Internship.

## Features

- Auth (register/login, persistent session, protected routes)
- Dashboard: stats, status/priority breakdown, upcoming deadlines, recent activity
- Projects: search, create/edit/delete, member management
- Kanban board: drag-and-drop status updates, filters (priority/assignee), search, sort
- Task detail modal: create/edit/delete, assignee, priority, due date
- Comments: post, edit own, delete own — conversation style
- Real-time updates via Socket.IO (no manual refresh needed)
- Toast notifications for key actions
- Fully responsive: sidebar collapses on tablet and mobile, board scrolls horizontally

## Tech Stack

React 19, Vite, Tailwind CSS v4, React Router, Axios, React Hook Form, Socket.IO client.

## Architecture

```
client/
  src/
    components/   # common/ layout/ dashboard/ projects/ tasks/ comments/
    pages/        # Login, Register, Dashboard, Projects, ProjectBoard, NotFound
    layouts/      # AuthLayout, DashboardLayout
    hooks/        # useAuth, useToast, useProjectSocket
    services/     # axios instance + per-domain API calls, socket.js
    context/      # AuthContext, ToastContext
```

## Installation

```bash
npm install
cp .env.example .env   # point VITE_API_URL at your backend
npm run dev
```

## Environment Variables (`.env`)

| Variable        | Description                          |
|------------------|----------------------------------------|
| `VITE_API_URL`  | Backend API base URL, e.g. `http://localhost:5000/api` |

## Running the Backend

This client expects the Flowline backend running separately (see its own README) — start it first, then `npm run dev` here. Default dev ports: backend `5000`, frontend `5173`.

## Demo Credentials

Run `npm run seed` in the backend, then log in with:

| Email             | Password      |
|-------------------|---------------|
| alex@demo.com     | password123   |
| sam@demo.com      | password123   |
| jordan@demo.com   | password123   |

## Deployment Notes

- `npm run build` outputs a static `dist/` — deploy to Vercel, Netlify, or any static host.
- Set `VITE_API_URL` to your deployed backend's URL as a build-time env var on the host.
- Ensure the backend's `CLIENT_URL` matches this app's deployed origin (CORS).

## Future Improvements

- Offline-friendly optimistic UI for all mutations
- Rich text in task descriptions and comments
- Notification center for @mentions

## Author

Himanshu — CodeAlpha Full Stack Development Internship.
