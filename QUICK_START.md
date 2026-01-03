# 🎯 QUICK START - Content Moderation (100% FREE)

## ⚡ Super Fast Setup (3 Steps)

### Step 1: Install Packages
Double-click: **`install-moderation.bat`**

OR manually run:
```bash
cd backend
npm install @tensorflow/tfjs-node nsfwjs sharp
```

### Step 2: Start Backend
```bash
cd backend
npm run dev
```

Wait for: "✅ Content moderation ready!"

### Step 3: Test It!
- Go to Upload page
- Try uploading with title "sex" → Should BLOCK ❌
- Try normal video → Should WORK ✅

---

## ✅ What's Included

### Frontend (Upload.jsx)
- ⚠️ Warning banner about 18+ content
- ✔️ Policy agreement checkbox
- 🚫 Error messages for blocked content

### Backend (Automatic)
- 🤖 AI checks thumbnail images
- 📝 Text filtering for title/description  
- 🛡️ Blocks inappropriate content

---

## 🎛️ Customize Settings

**File:** `backend/src/utils/contentModerator.js`

### Make Detection More Strict:
```javascript
const threshold = 0.4; // Very strict (40%)
```

### Make Detection More Lenient:
```javascript
const threshold = 0.8; // Lenient (80%)
```

### Add Custom Banned Words:
```javascript
const inappropriateKeywords = [
  'porn', 'sex', 'xxx', 'adult', '18+',
  'your-custom-word', // Add here
];
```

---

## 🧪 Testing

### Test Bad Content:
1. Upload video with title: "xxx adult content"
2. Should show: 🚫 "Upload blocked: inappropriate text"

### Test Image Detection:
1. Upload video with inappropriate thumbnail
2. Should show: 🚫 "Content detected as inappropriate"

### Test Good Content:
1. Normal title: "My Cooking Tutorial"
2. Clean thumbnail
3. Should upload successfully ✅

---

## 📊 What Gets Checked

✓ **Video Title** - Scans for bad words  
✓ **Description** - Scans for bad words  
✓ **Thumbnail Image** - AI analyzes for adult content  

---

## 💰 Cost

**ZERO! Everything is FREE:**
- No AWS account needed
- No API keys needed
- No credit card needed
- Runs on YOUR server

---

## 🆘 Troubleshooting

### "Cannot find module"
→ Run: `npm install @tensorflow/tfjs-node nsfwjs sharp`

### "Model loading failed"
→ Check internet (needed first time only)

### Takes too long?
→ Normal first time (downloads model ~50MB)
→ After that: instant loading

---

## 📞 How It Works

```
Upload → Check Policy ✓ → Scan Text → AI Check Image → Pass/Block
```

**Detection:**
- Porn: 80% confidence → BLOCK
- Sexy: 70% confidence → BLOCK  
- Combined > 60% → BLOCK
- Otherwise → ALLOW

---

## ⚙️ Files Created

```
backend/src/utils/contentModerator.js  ← Main logic
backend/src/controllers/video.controllers.js  ← Updated
backend/src/index.js  ← Loads model on start
frontend/src/pages/Upload.jsx  ← UI warnings
```

---

## 🚀 That's It!

You now have **professional content moderation** without spending a penny!

**No AWS. No Google. No Azure. Just FREE & LOCAL AI.** ✨
