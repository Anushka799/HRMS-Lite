# HRMS Lite - Setup Instructions

## Environment Variables

### For Vercel Frontend Deployment

Add these environment variables in your Vercel project settings:

- `VITE_API_BASE`: Set this to your Render backend API URL
  - Format: `https://hrms-lite-api-[YOUR-ID].onrender.com`
  - Get your actual URL from the Render dashboard

### For Render Deployment

The `render.yaml` automatically sets `VITE_API_BASE` using the backend service URL.

## Deployment Steps

1. **Deploy to Render**: Push to GitHub, Render will auto-deploy both frontend and backend
2. **Deploy to Vercel**: 
   - Connect your GitHub repo to Vercel
   - Set `VITE_API_BASE` environment variable to your Render backend URL
   - Redeploy after adding the environment variable

## Local Development

Run the backend:
```bash
cd backend
python -m uvicorn main:app --host 0.0.0.0 --port 3001 --reload
```

Run the frontend:
```bash
cd frontend
npm install
npm run dev
```

The frontend will use `http://localhost:3001` by default for local development.
