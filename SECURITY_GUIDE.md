# 🔒 Security Guide - Environment Variables

## ⚠️ CRITICAL SECURITY RULES

### ❌ NEVER Push These to GitHub:
```
.env
.env.local
.env.production
.env.development
```

### ✅ ONLY Push This to GitHub:
```
.env.example  (template with no real values)
```

---

## 📁 File Structure

### Frontend:
```
frontend/
├── .env.example          ← ✅ Commit this (template)
├── .env.local           ← ❌ DON'T commit (your local config)
└── .env.production      ← ❌ DON'T commit (use Vercel Dashboard instead)
```

### Backend:
```
backend/
├── .env.example          ← ✅ Commit this (template)
└── .env                 ← ❌ DON'T commit (sensitive data!)
```

---

## 🚀 Secure Deployment Process

### Step 1: Local Development
1. Copy `.env.example` to `.env` (backend) or `.env.local` (frontend)
2. Fill in your real values
3. **NEVER commit these files!**

### Step 2: Vercel Deployment

#### Backend:
1. Go to Vercel Dashboard → Your Backend Project
2. Settings → Environment Variables
3. Add ALL variables from `.env.example`:
   ```
   MONGODB_URL=<your_actual_mongodb_url>
   ACCESS_TOKEN_SECRET=<your_actual_secret>
   CLOUDINARY_API_KEY=<your_actual_key>
   ORIGIN_CORS=https://your-frontend.vercel.app
   ... (all other variables)
   ```

#### Frontend:
1. Go to Vercel Dashboard → Your Frontend Project
2. Settings → Environment Variables
3. Add:
   ```
   VITE_API_URL=https://your-backend.vercel.app/api/v1
   ```

### Step 3: Verify Security
```bash
# Check what's being tracked by Git
git status

# Should NOT see:
# .env
# .env.local
# .env.production
```

---

## 🔐 Why This is Secure

| File | Committed? | Contains | Security |
|------|-----------|----------|----------|
| `.env.example` | ✅ Yes | Fake values/placeholders | ✅ Safe |
| `.env` | ❌ No | Real secrets | 🔒 In .gitignore |
| `.env.local` | ❌ No | Real local config | 🔒 In .gitignore |
| `.env.production` | ❌ No | Real production URLs | 🔒 In .gitignore |
| Vercel Dashboard | N/A | Real secrets | 🔒 Encrypted by Vercel |

---

## ✅ Updated .gitignore

Both frontend and backend now have:
```gitignore
.env
.env.local
.env.development.local
.env.test.local
.env.production
.env.production.local
```

---

## 🎯 Best Practices

1. **Local Development**: Use `.env` (backend) or `.env.local` (frontend)
2. **Production**: Use Vercel Dashboard for ALL environment variables
3. **Collaboration**: Share `.env.example` (with fake values)
4. **Secrets**: NEVER commit real API keys, passwords, or tokens
5. **Verification**: Before `git push`, run `git status` to verify

---

## 🚨 If You Already Committed .env

If you accidentally committed sensitive files:

```bash
# Remove from Git but keep locally
git rm --cached .env
git rm --cached .env.production

# Commit the removal
git commit -m "Remove sensitive environment files"

# Push
git push
```

**⚠️ Important**: The data is still in Git history! For production:
1. Rotate ALL secrets (new passwords, new API keys)
2. Update values in Vercel Dashboard

---

## ✅ Current Status

- ✅ `.env.example` created (safe to commit)
- ✅ `.gitignore` updated (blocks sensitive files)
- ✅ Real `.env` files are protected
- ✅ Vercel Dashboard should be used for production

**You're now secure!** 🔒
