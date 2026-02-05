# HRMS Lite

A lightweight Human Resource Management System for managing employee records and daily attendance. Built as a full-stack assignment with a clean, production-ready UI and a simple REST API.

## Project Overview
HRMS Lite enables a single admin to:
- Add, view, and delete employees
- Mark daily attendance (Present/Absent)
- View attendance history per employee
- See a small dashboard summary of employee and attendance counts

## Tech Stack
- **Frontend:** React (Vite)
- **Backend:** Node.js + Express
- **Database:** SQLite (file-based)
- **Deployment:** Vercel/Netlify (frontend), Render/Railway (backend)

## Features
- Employee CRUD (create, list, delete)
- Attendance tracking by date
- Summary dashboard cards
- Loading/empty/error UI states
- Server-side validation and meaningful errors

## API Endpoints
- `GET /api/health` — API health check
- `GET /api/employees` — list employees (includes attendance counts)
- `POST /api/employees` — add an employee
- `DELETE /api/employees/:employeeId` — delete employee
- `GET /api/employees/:employeeId/attendance?date=YYYY-MM-DD` — list attendance (optional date filter)
- `POST /api/employees/:employeeId/attendance` — mark attendance
- `GET /api/summary` — dashboard summary

## Run Locally

### 1) Backend
```bash
cd backend
npm install
npm run dev
```
The API starts on `http://localhost:3001`.

**Optional environment variables**:
- `PORT` — API port (default `3001`)
- `DB_PATH` — SQLite file path (default `backend/data/hrms.db`)
- `CORS_ORIGIN` — allowed frontend origin (default `*`)

### 2) Frontend
```bash
cd frontend
npm install
npm run dev
```
The app runs at `http://localhost:5173`.

**Optional environment variables**:
- `VITE_API_BASE` — backend base URL (default `http://localhost:3001`)

Create `frontend/.env` for production builds:
```bash
VITE_API_BASE=https://your-backend-url
```

## Deployment Notes
- **Backend (Render/Railway):**
  - Root directory: `backend`
  - Build command: `npm install`
  - Start command: `npm start`
  - Set `CORS_ORIGIN` to your frontend URL
- **Frontend (Vercel/Netlify):**
  - Root directory: `frontend`
  - Build command: `npm install && npm run build`
  - Output directory: `dist`
  - Set `VITE_API_BASE` to your deployed backend URL

## Assumptions & Limitations
- Single admin user (no authentication)
- Attendance is unique per employee per date
- SQLite is file-based; production should use persistent storage
- Time is based on the server clock for summary “today” counts

---

If you want, I can also add deployment-ready configs (Render/Vercel) or seed data.
