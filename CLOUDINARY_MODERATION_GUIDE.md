# 🔍 How to Find Cloudinary Moderation Settings

## Can't Find "Moderation" in Security?

Try these locations:

### Option 1: Add-ons Section (Most Common)
1. Go to: https://cloudinary.com/console
2. Click **"Add-ons"** in the left sidebar
3. Search for **"AWS Rekognition"** or **"Moderation"**
4. Click **"Install"** or **"Enable"**
5. Follow the setup wizard

### Option 2: Settings → Add-ons
1. Go to: https://cloudinary.com/console/settings
2. Look for **"Add-ons"** tab at the top
3. Find **"AWS Rekognition Video Moderation"**
4. Enable it

### Option 3: Media Library → Settings
1. Go to your Media Library
2. Click the **gear icon** (Settings)
3. Look for **"Moderation"** or **"Content Analysis"**

### Option 4: Direct Link
Try this direct link:
**https://cloudinary.com/console/addons**

Look for: **"AWS Rekognition Auto Moderation"**

---

## ⚠️ If You Still Can't Find It...

### Check Your Cloudinary Plan

AWS Rekognition moderation might not be available on **FREE plans**.

**To check your plan:**
1. Go to: https://cloudinary.com/console/settings/account
2. Look at your **"Plan"** or **"Subscription"**

**Available on:**
- ✅ **Plus Plan** and above (paid plans)
- ✅ **Advanced Plan**
- ✅ **Enterprise Plan**
- ❌ **Free Plan** (might not include AWS Rekognition)

---

## 🆓 Alternative: Works Without Enabling!

**Good news:** The AI moderation might work automatically even if you don't see the setting!

Cloudinary's `moderation: 'aws_rek'` parameter might be available by default on your plan.

### Test Without Enabling:

1. **Just restart your backend:**
```bash
cd backend
npm run dev
```

2. **Try uploading a video**

3. **Check the terminal logs:**
   - If you see: `🔍 AI Moderation Check: ...`
   - Then it's **WORKING!** ✅

4. **Look for this in logs:**
```
🔍 AI Moderation Check: { 
  response: { 
    moderation_labels: [...] 
  } 
}
```

If you see `moderation_labels`, the AI is analyzing your content!

---

## 💡 Alternative Solution: Manual Moderation Parameter

If AWS Rekognition isn't available, we can use Cloudinary's built-in moderation:

### Update cloudinary.js:

Change line 23 from:
```javascript
moderation: 'aws_rek', // Enable AI content moderation
```

To:
```javascript
moderation: 'manual', // Enable manual moderation queue
```

This will:
- Upload files to a "pending" queue
- You manually approve/reject in Cloudinary dashboard
- Not automatic, but better than nothing

---

## 🎯 Best Approach: Test First!

**Before worrying about settings:**

1. **Restart backend** (make sure new code is loaded)
2. **Upload a test video**
3. **Check terminal logs carefully**

Look for:
```
🚀 Starting upload to Cloudinary with AI moderation...
✅ File uploaded to Cloudinary!
🔍 AI Moderation Check: ...
```

**If you see "AI Moderation Check":**
- The feature IS working! ✅
- You don't need to enable anything

**If you DON'T see "AI Moderation Check":**
- The feature isn't available on your plan
- Use alternative solutions below

---

## 📞 Contact Cloudinary Support

If you need AWS Rekognition but can't find it:

1. Go to: https://support.cloudinary.com
2. Ask: "How do I enable AWS Rekognition moderation on my account?"
3. They'll tell you:
   - If it's available on your plan
   - How to enable it
   - Cost (if any)

---

## 🔄 Fallback: Use Existing Text Moderation

Your platform already has **text-based moderation** that works well:

**What it blocks (currently active):**
- 70+ banned keywords
- Pattern matching (e.g., "hot girl video")
- Filename analysis
- Manual review flagging

**This is already working** and catches most inappropriate content!

The AI was an **enhancement**, not a replacement.

---

## 🚀 Next Steps

### Option A: Test Current Setup
```bash
cd backend
npm run dev
# Upload a video and check logs
```

### Option B: Contact Cloudinary
- Ask about AWS Rekognition availability
- Check if included in your plan

### Option C: Use Manual Moderation
- Change to `moderation: 'manual'` in cloudinary.js
- Manually review uploads in Cloudinary dashboard

### Option D: Keep Text-Only Moderation
- Your current system is already quite effective
- AI is nice-to-have, not essential

---

## ✅ What You Have Now (Even Without AI)

Your platform currently blocks:
- ✅ 70+ explicit keywords
- ✅ L33t speak variations (s3x, p0rn, etc.)
- ✅ Pattern matching for suspicious phrases
- ✅ Filename analysis
- ✅ Manual review for suspicious uploads
- ✅ Clear error messages for users

**This is already pretty good!** The AI would make it even better, but you're not unprotected.

---

## 🎯 Decision Time

1. **Try uploading now** - AI might already work
2. **If it doesn't work** - Your text moderation is still active
3. **If you need AI badly** - Contact Cloudinary or upgrade plan
4. **If text moderation is enough** - You're all set!

---

**Want me to help you test if it's working?** Just try uploading a video and share what you see in the terminal logs!
