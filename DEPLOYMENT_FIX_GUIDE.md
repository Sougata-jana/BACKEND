# 🚀 Deployment Fix Guide

## Problem
Your frontend is failing to load videos because of CORS and API connection issues.

## ✅ Solutions Applied

### 1. Backend CORS Configuration Fixed
- ✅ Added automatic support for Vercel deployments
- ✅ Added proper CORS headers
- ✅ Allows `vercel.app` domains automatically

### 2. What You Need to Do

#### A. Update Backend Environment Variables on Vercel

Go to your backend Vercel project → Settings → Environment Variables and add:

```
ORIGIN_CORS=https://your-frontend-url.vercel.app
```

**Example:**
```
ORIGIN_CORS=https://frontend-rjuc.vercel.app
```

#### B. Update Frontend Environment Variables on Vercel

Go to your frontend Vercel project → Settings → Environment Variables and add:

```
VITE_API_URL=https://your-backend-url.vercel.app/api/v1
```

**Your current backend URL (from console):**
```
VITE_API_URL=https://backend-3mku.vercel.app/api/v1
```

#### C. Redeploy Both Projects

After setting environment variables:
1. Backend: Go to Deployments → Latest → Click "..." → Redeploy
2. Frontend: Go to Deployments → Latest → Click "..." → Redeploy

### 3. Test Your Deployment

Open browser console and check:
1. No CORS errors ✅
2. API calls succeed ✅
3. Videos load ✅

## 🔧 Additional Fixes

### If still not working:

1. **Check Backend Logs:**
   - Go to Vercel Dashboard → Your Backend Project → Deployments
   - Click on latest deployment → View Function Logs
   - Look for CORS or error messages

2. **Check Frontend Console:**
   - Open DevTools → Console tab
   - Check Network tab for failed requests
   - Note the exact error messages

3. **Verify URLs:**
   - Frontend `.env.production`: Should have correct backend URL
   - Backend `ORIGIN_CORS`: Should have correct frontend URL

## 📋 Quick Checklist

- [ ] Backend deployed and running
- [ ] Frontend deployed and running
- [ ] Backend `ORIGIN_CORS` set with frontend URL
- [ ] Frontend `VITE_API_URL` set with backend URL
- [ ] Both projects redeployed after environment variable changes
- [ ] No CORS errors in browser console
- [ ] API calls returning data

## 🆘 Still Having Issues?

If problems persist, check:
1. MongoDB connection string is correct in backend
2. Cloudinary credentials are correct
3. All required environment variables are set
4. Backend health check works: `https://your-backend.vercel.app/health`

## 📞 Environment Variables Needed

### Backend (.env)
```
MONGODB_URI=your-mongodb-connection-string
ORIGIN_CORS=https://your-frontend.vercel.app
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
ACCESS_TOKEN_SECRET=your-secret
REFRESH_TOKEN_SECRET=your-secret
```

### Frontend (.env.production)
```
VITE_API_URL=https://your-backend.vercel.app/api/v1
```
