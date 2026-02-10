# HRMS Lite

A lightweight Human Resource Management System for managing employee records and daily attendance. Built as a full-stack assignment with a clean, production-ready UI and a simple REST API.



## Project Overview
HRMS Lite enables a single admin to:
- Add, view, and delete employees
- Mark daily attendance (Present/Absent)
- View attendance history per employee
- See a dashboard summary of employee and attendance counts

## Tech Stack
- **Frontend:** React (Vite) + JavaScript
- **Backend:** Python + FastAPI
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

### 1) Backend (Python)
```bash
cd backend
pip install -r requirements.txt
python main.py
```
The API starts on `http://localhost:3001`.

**Environment variables** (optional):
- `PORT` — API port (default `3001`)
- `MONGODB_URI` — MongoDB connection string

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
- **Backend (Render):**
  - Root directory: `backend`
  - Build command: `pip install -r requirements.txt`
  - Start command: `uvicorn main:app --host 0.0.0.0 --port $PORT`
  - Set `MONGODB_URI` environment variable
- **Frontend (Vercel/Netlify):**
  - Root directory: `frontend`
  - Build command: `npm install && npm run build`
  - Output directory: `dist`
  - Set `VITE_API_BASE` to your deployed backend URL

