# 🚀 FREE Content Moderation Setup (No AWS/AI Service Required)

## ✅ What This Does
- Detects adult/inappropriate content in thumbnails
- Checks text for inappropriate keywords
- Works 100% locally on your server
- **NO API keys needed**
- **NO external services**
- **COMPLETELY FREE**

---

## 📦 Step 1: Install Required Packages

Open terminal in your backend folder and run:

```bash
cd backend
npm install @tensorflow/tfjs-node nsfwjs sharp
```

**What these do:**
- `@tensorflow/tfjs-node` - TensorFlow for Node.js (AI engine)
- `nsfwjs` - NSFW detection model (free & open-source)
- `sharp` - Image processing library

---

## ⚙️ Step 2: Files Already Created

I've created these files for you:

1. ✅ `backend/src/utils/contentModerator.js` - Main moderation logic
2. ✅ `backend/src/controllers/video.controllers.js` - Updated with moderation check
3. ✅ `frontend/src/pages/Upload.jsx` - UI with warnings and policy checkbox

---

## 🔧 Step 3: Initialize Model on Server Start

Update your `backend/src/index.js` or `app.js`:

```javascript
import { loadModel } from './utils/contentModerator.js';

// ... your existing code ...

// Load NSFW model when server starts
const startServer = async () => {
  try {
    // Load content moderation model
    console.log('🔄 Loading content moderation model...');
    await loadModel();
    console.log('✅ Content moderation ready!');
    
    // Start your server
    app.listen(process.env.PORT || 8000, () => {
      console.log(`⚙️  Server is running at port : ${process.env.PORT || 8000}`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
```

---

## 🧪 Step 4: Test the System

### Test 1: Text Filtering
Try uploading a video with title or description containing:
- "porn", "sex", "xxx", "adult", "18+"

**Expected Result:** ❌ Upload blocked with error message

### Test 2: Image Detection
Try uploading a video with an inappropriate thumbnail.

**Expected Result:** ❌ Upload blocked (if AI detects inappropriate content)

### Test 3: Clean Content
Upload a normal video with appropriate title/description.

**Expected Result:** ✅ Upload successful

---

## ⚙️ Adjusting Sensitivity

Edit `contentModerator.js` to adjust:

### Image Detection Threshold:
```javascript
const threshold = 0.6; // Change this value
// Lower = more strict (0.4 = very strict)
// Higher = less strict (0.8 = very lenient)
```

### Add More Keywords:
```javascript
const inappropriateKeywords = [
  'porn', 'sex', 'xxx', 'adult', '18+', 'nsfw',
  // Add your own keywords here
  'your-keyword-here'
];
```

---

## 🛠️ Troubleshooting

### Error: "Cannot find module '@tensorflow/tfjs-node'"
**Solution:** Run `npm install @tensorflow/tfjs-node`

### Error: "Model loading failed"
**Solution:** 
1. Check internet connection (needed first time to download model)
2. Model downloads to `~/.nsfwjs/` automatically
3. After first download, works offline

### Error: "sharp not found"
**Solution:** Run `npm install sharp`

### Model loads slowly?
**Normal!** First load takes 10-30 seconds to download model (~50MB).
After that, it loads from cache instantly.

---

## 📊 How It Works

```
User uploads video
    ↓
Frontend: Check policy checkbox ✓
    ↓
Backend receives files
    ↓
Check 1: Scan title for bad words
Check 2: Scan description for bad words
Check 3: AI analyzes thumbnail image
    ↓
All checks passed? → Upload to Cloudinary ✅
Any check failed? → Block & delete files ❌
    ↓
Return result to user
```

---

## 🎯 Detection Categories

The AI model detects 5 categories:

1. **Porn** - Explicit sexual content
2. **Hentai** - Animated sexual content
3. **Sexy** - Suggestive/revealing content
4. **Neutral** - Safe content
5. **Drawing** - Illustrations/artwork

**Inappropriate = Porn + Hentai + Sexy > 60%**

---

## 💡 Pro Tips

1. **Combine with Manual Review:**
   - AI isn't 100% accurate
   - Set `isPublished: false` for manual approval
   - Create admin panel to review flagged videos

2. **Log Suspicious Uploads:**
   ```javascript
   if (moderationResult.score > 0.3 && moderationResult.score < 0.6) {
     console.warn('⚠️ Borderline content detected:', {
       user: req.user.username,
       title,
       score: moderationResult.score
     });
   }
   ```

3. **User Appeals:**
   - Create appeal system for false positives
   - Review manually flagged content

---

## 🔒 Privacy & Security

✅ **Everything runs on YOUR server**
✅ **No data sent to third parties**
✅ **No tracking or external API calls**
✅ **Open-source and auditable**

---

## 📈 Performance

- **First load:** 10-30 seconds (downloads model)
- **After that:** < 1 second per image
- **Memory usage:** ~100-200MB for model
- **CPU usage:** Moderate during detection

---

## ✅ Final Checklist

- [ ] Install packages: `npm install @tensorflow/tfjs-node nsfwjs sharp`
- [ ] Backend files created (contentModerator.js, updated controllers)
- [ ] Frontend updated (Upload.jsx with warnings)
- [ ] Server loads model on startup
- [ ] Test with inappropriate content (should block)
- [ ] Test with clean content (should allow)
- [ ] Adjust threshold if needed

---

## 🆘 Need Help?

If something doesn't work:

1. Check terminal for error messages
2. Make sure all packages installed: `npm list`
3. Check Node.js version: `node --version` (needs 14+)
4. Restart backend server after changes

---

## 🎉 You're Done!

Your system now has **FREE, local content moderation** with:
- ✅ AI-powered image detection
- ✅ Text keyword filtering
- ✅ User policy agreement
- ✅ Clear error messages

No AWS, no Google Cloud, no Azure needed! 🚀
