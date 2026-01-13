# 🚀 Vercel Deployment Checklist

## ⚠️ CRITICAL: Backend URL Changed!

Your new backend URL is: `https://backend-3whu.vercel.app`

## 📋 Step-by-Step Fix Guide

### 1️⃣ Backend Environment Variables (Vercel Dashboard)

Go to: **Vercel Dashboard → backend-3whu project → Settings → Environment Variables**

**Add/Update these variables:**

```
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
ACCESS_TOKEN_SECRET=your_access_token_secret
REFRESH_TOKEN_SECRET=your_refresh_token_secret
ACCESS_TOKEN_EXPIRY=1d
REFRESH_TOKEN_EXPIRY=10d

CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret

ORIGIN_CORS=https://frontend-rjuc.vercel.app
```

**Important:** Replace `https://frontend-rjuc.vercel.app` with your actual frontend URL!

---

### 2️⃣ Frontend Environment Variables (Vercel Dashboard)

Go to: **Vercel Dashboard → frontend project → Settings → Environment Variables**

**Add this variable:**

```
VITE_API_URL=https://backend-3whu.vercel.app/api/v1
```

---

### 3️⃣ Admin Panel Environment Variables (Vercel Dashboard)

Go to: **Vercel Dashboard → admin project → Settings → Environment Variables**

**Add this variable:**

```
VITE_API_URL=https://backend-3whu.vercel.app/api/v1
```

---

## 🔄 After Setting Variables

1. **Redeploy Backend:**
   - Go to Vercel → backend project → Deployments
   - Click "..." on latest deployment → Redeploy

2. **Redeploy Frontend:**
   - Go to Vercel → frontend project → Deployments
   - Click "..." on latest deployment → Redeploy

3. **Redeploy Admin:**
   - Go to Vercel → admin project → Deployments
   - Click "..." on latest deployment → Redeploy

---

## 🧪 Testing After Deployment

### Test Backend Health:
```
https://backend-3whu.vercel.app/health
```
Should return: `{"status":"OK","message":"Server is running"}`

### Test Backend API:
```
https://backend-3whu.vercel.app/api/v1/videos?page=1&limit=5
```
Should return video data (might be empty if no videos)

### Test Frontend:
Open your frontend URL and check browser console for errors.

---

## ❌ Common Errors & Solutions

### Error: "Access to XMLHttpRequest blocked by CORS policy"
**Solution:** Make sure `ORIGIN_CORS` in backend matches your frontend URL exactly.

### Error: "500 Internal Server Error"
**Solution:** Check backend function logs in Vercel for the actual error. Usually missing MongoDB or Cloudinary credentials.

### Error: "404 Not Found"
**Solution:** Make sure backend is deployed correctly and routes are working. Test `/health` endpoint first.

### Error: "Failed to load resource"
**Solution:** Check that `VITE_API_URL` in frontend environment variables is correct.

---

## 📝 Quick Commands for Local Testing

### Test backend locally:
```bash
cd backend
npm run dev
```

### Test frontend locally with production backend:
```bash
cd frontend
npm run build
npm run preview
```

---

## 🔍 Debugging Tips

1. **Check Vercel Function Logs:**
   - Vercel Dashboard → Project → Deployments → Click deployment → View Function Logs

2. **Check Browser Console:**
   - Press F12 → Console tab → Look for red errors

3. **Check Network Tab:**
   - Press F12 → Network tab → Look for failed requests (red)

4. **Test Backend Directly:**
   - Use the `api-tester.html` file in your project root
   - Or use Postman/Insomnia to test endpoints

---

## ✅ Verification Checklist

- [ ] Backend environment variables set in Vercel
- [ ] Frontend environment variables set in Vercel  
- [ ] Admin environment variables set in Vercel
- [ ] Backend redeployed after setting variables
- [ ] Frontend redeployed after setting variables
- [ ] Admin redeployed after setting variables
- [ ] `/health` endpoint returns 200 OK
- [ ] `/api/v1/videos` endpoint returns data
- [ ] Frontend loads without console errors
- [ ] Can navigate pages in frontend
- [ ] Admin panel loads without errors

---

## 🆘 Still Not Working?

1. Share the **exact error message** from browser console
2. Check **Vercel function logs** for backend errors
3. Verify all environment variables are set correctly
4. Make sure MongoDB connection string is correct
5. Test backend `/health` endpoint directly in browser

---

## 📌 Important URLs

- **Backend:** https://backend-3whu.vercel.app
- **Backend Health:** https://backend-3whu.vercel.app/health
- **Backend API:** https://backend-3whu.vercel.app/api/v1
- **Frontend:** (your-frontend-url.vercel.app)
- **Admin:** (your-admin-url.vercel.app)

Remember: After changing ANY environment variable, you MUST redeploy the project!
