# Flowline — Backend API

REST API for Flowline, a Trello/Asana-style project management tool. Built for the CodeAlpha Full Stack Development Internship.

## Features

- JWT authentication (register, login, protected routes)
- Projects with owners, members, deadlines, status
- Kanban-style tasks (status, priority, assignee, due date)
- Threaded comments on tasks (edit/delete own only)
- Project-level authorization (owner vs member permissions)
- Search, filter, sort on tasks; search on projects
- Dashboard aggregation endpoint (stats, breakdowns, activity)
- Real-time updates via Socket.IO (tasks, comments, membership)
- Centralized error handling, input validation, no plaintext passwords

## Tech Stack

Node.js, Express, MongoDB + Mongoose, JWT, bcryptjs, Socket.IO.

## Architecture

```
server/
  config/       # DB connection
  controllers/  # Route handlers / business logic
  middleware/   # Auth, project-access checks, error handler
  models/       # Mongoose schemas: User, Project, Task, Comment
  routes/       # Express routers
  utils/        # AppError, catchAsync, generateToken, seed script
  server.js     # App entry point + Socket.IO setup
```

## Installation

```bash
npm install
cp .env.example .env   # then fill in the values below
npm run dev             # nodemon, auto-restart
# or
npm start                # plain node
```

## Environment Variables (`.env`)

| Variable          | Description                              |
|--------------------|-------------------------------------------|
| `MONGO_URI`        | MongoDB connection string                |
| `JWT_SECRET`        | Long random string for signing tokens    |
| `JWT_EXPIRES_IN`   | Token lifetime, e.g. `7d`                |
| `PORT`              | API port (default 5000)                  |
| `CLIENT_URL`        | Frontend origin, for CORS                |

## Database Setup

Any MongoDB instance works — local `mongod`, Docker, or a free MongoDB Atlas cluster. Point `MONGO_URI` at it; Mongoose creates collections and indexes automatically on first run.

## Demo Data

```bash
npm run seed
```

Creates one demo project with 3 users and a handful of tasks/comments.

| Email             | Password      |
|-------------------|---------------|
| alex@demo.com     | password123   |
| sam@demo.com      | password123   |
| jordan@demo.com   | password123   |

## API Overview

```
Auth
POST   /api/auth/register
POST   /api/auth/login
GET    /api/auth/me

Users
GET    /api/users?search=

Projects
GET    /api/projects
POST   /api/projects
GET    /api/projects/:id
PUT    /api/projects/:id
DELETE /api/projects/:id
POST   /api/projects/:id/members
DELETE /api/projects/:id/members/:userId

Tasks
GET    /api/projects/:id/tasks
POST   /api/projects/:id/tasks
GET    /api/tasks/:id
PUT    /api/tasks/:id
DELETE /api/tasks/:id

Comments
GET    /api/tasks/:taskId/comments
POST   /api/tasks/:taskId/comments
PUT    /api/comments/:id
DELETE /api/comments/:id

Dashboard
GET    /api/dashboard
```

All routes except register/login require `Authorization: Bearer <token>`.

## Real-Time Events (Socket.IO)

Client emits `joinProject` / `leaveProject` with a project id. Server broadcasts to room `project:<id>`:

`task:created`, `task:updated`, `task:deleted`, `comment:created`, `comment:updated`, `comment:deleted`, `project:updated`.

## Deployment Notes

- Set `NODE_ENV=production` and a strong `JWT_SECRET`.
- Point `MONGO_URI` at a managed cluster (e.g. Atlas).
- Set `CLIENT_URL` to your deployed frontend origin for CORS.
- Works on Render, Railway, Fly.io, or any Node host — start command `npm start`.

## Future Improvements

- File attachments on tasks
- Activity log per project (not just recent tasks)
- Role-based permissions beyond owner/member
- Rate limiting on auth endpoints

## Author

Himanshu — CodeAlpha Full Stack Development Internship.
