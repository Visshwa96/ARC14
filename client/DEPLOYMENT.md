# ARC-14 Deployment Guide

## ✅ Code Fixed!

The frontend now uses environment variables to connect to the backend.

## 🚀 Configure Vercel

### Step 1: Add Environment Variable in Vercel Dashboard

1. Go to your Vercel project: https://vercel.com/dashboard
2. Select your **ARC-14 frontend** project
3. Go to **Settings** → **Environment Variables**
4. Add this variable:
   ```
   Name: VITE_API_URL
   Value: https://your-backend-url.onrender.com/api
   ```
   ⚠️ Replace `your-backend-url.onrender.com` with your actual Render backend URL
   ⚠️ Make sure to include `/api` at the end
   ⚠️ Use `https://` not `http://`

5. Select all environments: **Production**, **Preview**, **Development**
6. Click **Save**

### Step 2: Find Your Render Backend URL

1. Go to https://dashboard.render.com
2. Click on your **ARC-14 backend** service
3. Copy the URL at the top (looks like: `https://arc14-backend-xxxx.onrender.com`)

### Step 3: Redeploy Frontend

After adding the environment variable:

```bash
cd d:\ARC14\arc14\client
git add .
git commit -m "Configure API URL for production"
git push origin frontend
```

Vercel will automatically redeploy with the new environment variable.

### Step 4: Update Backend CORS

Make sure your backend allows requests from your Vercel domain:

1. Open `server/.env` on Render
2. Add your Vercel URL to `FRONTEND_URL`:
   ```
   FRONTEND_URL=https://your-app.vercel.app
   ```

## 🧪 Test the Connection

After deployment, open your Vercel app and check the browser console:
- Open DevTools (F12)
- Go to **Console** tab
- Look for API request errors
- Should see successful requests to your Render backend

## 📝 Local Development

For local development, the app uses `.env.local`:
```bash
VITE_API_URL=http://localhost:5000/api
```

This file is already created and git-ignored.
