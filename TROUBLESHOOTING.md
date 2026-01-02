# ARC-14 Connection Troubleshooting Guide

## 🔍 Step 1: Check Vercel Environment Variable

1. Go to https://vercel.com/dashboard
2. Find your **arc-14** project
3. Go to **Settings** → **Environment Variables**
4. **CHECK IF THIS EXISTS:**
   ```
   VITE_API_URL = https://your-render-backend-url.onrender.com/api
   ```

5. **If it doesn't exist, ADD IT:**
   - Click **Add New**
   - Name: `VITE_API_URL`
   - Value: Get from Render (see Step 2)
   - Check all: Production ✓ Preview ✓ Development ✓
   - Click **Save**

## 🔍 Step 2: Get Your Render Backend URL

1. Go to https://dashboard.render.com
2. Click your backend service
3. Copy the URL at the top (example: `https://arc14-backend-xxxx.onrender.com`)
4. Add `/api` to the end
5. Use this in Vercel: `https://arc14-backend-xxxx.onrender.com/api`

## 🔍 Step 3: Check Render Environment Variable

1. Still on Render dashboard
2. Click **Environment** tab on the left
3. **CHECK IF THIS EXISTS:**
   ```
   FRONTEND_URL = https://arc-14.vercel.app
   ```

4. **If it doesn't exist, ADD IT:**
   - Click **Add Environment Variable**
   - Key: `FRONTEND_URL`
   - Value: `https://arc-14.vercel.app`
   - Click **Save Changes**
   - Render will auto-redeploy

## 🔍 Step 4: Force Redeploy Both Services

### Vercel:
1. Go to Vercel dashboard → your project
2. **Deployments** tab
3. Click **⋯** on latest → **Redeploy**

### Render:
1. Already redeployed when you saved env variable
2. Or manually: **Manual Deploy** → **Deploy latest commit**

## 🔍 Step 5: Test in Browser Console

1. Open your Vercel app: https://arc-14.vercel.app
2. Press **F12** to open DevTools
3. Go to **Console** tab
4. Look for errors like:
   - ❌ `ERR_CONNECTION_REFUSED` = Backend URL wrong
   - ❌ `CORS error` = FRONTEND_URL not set on Render
   - ❌ `404 Not Found` = API URL missing `/api`

## 🔍 Step 6: Test Direct Backend Connection

Open this in your browser:
```
https://YOUR-RENDER-URL.onrender.com/api/health
```

Should return:
```json
{"status":"OK","message":"ARC-14 API is running"}
```

If it doesn't work, your backend isn't deployed properly.

## ✅ Quick Checklist

- [ ] Vercel has `VITE_API_URL` environment variable
- [ ] Render has `FRONTEND_URL` environment variable  
- [ ] Backend URL includes `/api` at the end
- [ ] Both services are redeployed after adding env vars
- [ ] Backend health check returns OK
- [ ] No CORS errors in browser console

## 📝 Common Issues

**Issue:** "Failed to fetch" error
**Solution:** Check if Render backend URL is correct and includes `https://`

**Issue:** CORS error
**Solution:** Add `FRONTEND_URL` to Render and redeploy

**Issue:** 404 on API calls
**Solution:** Make sure Vercel env variable ends with `/api`

Need help? Share:
1. Your Render backend URL
2. Screenshot of browser console errors
3. Screenshot of Vercel environment variables page
