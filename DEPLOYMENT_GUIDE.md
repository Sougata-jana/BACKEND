# 🚀 Vercel Deployment Guide

## Problem Fixed:
✅ CORS error - Backend wasn't allowing frontend domain
✅ Environment variables configured
✅ Vercel configuration files created

## 📝 Backend Deployment Steps:

### 1. Deploy Backend to Vercel:
1. Go to https://vercel.com
2. Click "Add New" → "Project"
3. Import your repository
4. Select the `backend` folder as root directory
5. Add these Environment Variables in Vercel Dashboard:

```
PORT=3000
MONGODB_URL=mongodb+srv://janasougata198:backend@cluster0.gbkails.mongodb.net
ORIGIN_CORS=https://backend-8amvf-d0vegilfkd7-sougata-janas-projects.vercel.app,https://backend-8amvf.vercel.app,https://*.vercel.app
ACCESS_TOKEN_SECRET=ASDFGHTYJK34JJnjfknlnnfj787ffvv*hvkbkWRTNNFLLLSNNTNPMVKS
ACCESS_TOKEN_SECRET_EXPIRES=1d
REFRESH_TOKEN_SECRET=ASDFGHTYJK34JJnjfknlnnfj787ffvv*hvkbkWRTNNFLLLSNNTNPMVKS
REFRESH_TOKEN_SECRET_EXPIRES=10d
CLOUDINARY_CLOUD_NAME=backendsougata
CLOUDINARY_API_KEY=554793567774219
CLOUDINARY_API_KEY_SECRET=hiRzLy73RycD1pJRuYng2IBzVro
GMAIL_USER=janasougata198@gmail.com
GMAIL_APP_PASSWORD=jnzrvuypzvpcshrh
ADMIN_GMAIL_ID=janasougata198@gmail.com
ADMIN_GMAIL_PASSWORD=123456789
SIGHTENGINE_API_USER=1267495216
SIGHTENGINE_API_SECRET=aci67bkditGN8SwyZq8qa8ped4fUAMk4
NODE_ENV=production
```

6. Click Deploy

### 2. Get Backend URL:
After deployment, copy your backend URL (e.g., https://your-backend.vercel.app)

## 📝 Frontend Deployment Steps:

### 1. Update Frontend Environment:
1. Open `.env.production` file
2. Replace with your actual backend URL:
   ```
   VITE_API_URL=https://YOUR-ACTUAL-BACKEND-URL.vercel.app/api/v1
   ```

### 2. Deploy Frontend to Vercel:
1. Go to https://vercel.com
2. Click "Add New" → "Project"
3. Import your repository
4. Select the `frontend` folder as root directory
5. Add Environment Variable:
   ```
   VITE_API_URL=https://YOUR-ACTUAL-BACKEND-URL.vercel.app/api/v1
   ```
6. Click Deploy

### 3. Update Backend CORS:
1. After frontend is deployed, get the frontend URL
2. Go to Backend Vercel project → Settings → Environment Variables
3. Update `ORIGIN_CORS` to include your frontend URL:
   ```
   ORIGIN_CORS=https://your-frontend.vercel.app,https://*.vercel.app
   ```
4. Redeploy backend

## ⚠️ Important Notes:

1. **Never commit .env files to Git** - They contain sensitive data
2. **Use Vercel Dashboard** for environment variables in production
3. **Wildcard domains**: Using `https://*.vercel.app` allows all your Vercel apps
4. **After any changes**, redeploy the affected service

## 🔄 Current Status:

✅ Backend vercel.json created
✅ Frontend vercel.json created
✅ Environment files created
✅ CORS configuration updated

## 🎯 Next Steps:

1. Add ALL environment variables to Vercel Dashboard (backend)
2. Update frontend .env.production with actual backend URL
3. Add VITE_API_URL to Vercel Dashboard (frontend)
4. Deploy both services
5. Test the application

## 🐛 Debugging:

If you still see CORS errors:
- Check browser console for exact error
- Verify environment variables in Vercel Dashboard
- Make sure both deployments are successful
- Check that URLs in ORIGIN_CORS match exactly
