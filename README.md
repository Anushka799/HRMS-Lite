# HRMS Lite

A lightweight Human Resource Management System for managing employee records and daily attendance. Built as a full-stack assignment with a clean, production-ready UI and a simple REST API.

## 🔗 Live Demo

- **Frontend:** https://hrms-lite-bice.vercel.app
- **Backend API:** https://full-stack-coding-assignment-hrms-lite-1-0q8n.onrender.com
- **GitHub:** https://github.com/uzairkhann03/Full-Stack-Coding-Assignment-HRMS-Lite

## Project Overview
HRMS Lite enables a single admin to:
- Add, view, and delete employees
- Mark daily attendance (Present/Absent)
- View attendance history per employee
- See a dashboard summary of employee and attendance counts

## Tech Stack
- **Frontend:** React (Vite) + JavaScript
- **Backend:** Node.js + Express
- **Database:** MongoDB Atlas
- **Deployment:** Vercel (frontend), Render (backend)

## Features

### Core Features
- ✅ Employee Management (Add, View, Delete)
- ✅ Attendance Tracking (Mark Present/Absent by date)
- ✅ View attendance records per employee

### Bonus Features
- ✅ Dashboard summary (total employees, attendance counts)
- ✅ Total present days displayed per employee
- ✅ Filter attendance by date

### UI/UX
- ✅ Clean, professional layout
- ✅ Loading states
- ✅ Empty states
- ✅ Error handling with meaningful messages
- ✅ Responsive design

## API Endpoints
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/health` | API health check |
| GET | `/api/employees` | List all employees with attendance counts |
| POST | `/api/employees` | Add a new employee |
| DELETE | `/api/employees/:employeeId` | Delete an employee |
| GET | `/api/employees/:employeeId/attendance` | List attendance (optional `?date=YYYY-MM-DD`) |
| POST | `/api/employees/:employeeId/attendance` | Mark attendance |
| GET | `/api/summary` | Dashboard summary stats |

## Run Locally

### 1) Backend
```bash
cd backend
npm install
npm run dev
```
The API starts on `http://localhost:3001`.

**Environment variables** (optional):
- `PORT` — API port (default `3001`)
- `MONGODB_URI` — MongoDB connection string
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
