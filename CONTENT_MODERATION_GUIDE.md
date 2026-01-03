# 🛡️ Content Moderation Implementation Guide

## Overview
This guide explains how to implement AI-based content moderation to block 18+ adult/sexual content during video upload.

---

## ✅ What Was Added (Frontend)

1. **Content Policy Warning Banner** - Shows rules before upload
2. **Policy Acceptance Checkbox** - Users must agree to terms
3. **Error Handling** - Special messages for blocked content

---

## 🔧 Backend Implementation Options

### Option 1: AWS Rekognition (Recommended) 💎

**Features:**
- Detects inappropriate content in videos and images
- Provides confidence scores
- Fast processing
- Pay-per-use pricing

**Installation:**
```bash
npm install aws-sdk
```

**Implementation in video.controllers.js:**

```javascript
const AWS = require('aws-sdk');

// Configure AWS
AWS.config.update({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION || 'us-east-1'
});

const rekognition = new AWS.Rekognition();

// Function to check if image/video frame contains inappropriate content
async function moderateImage(imageBuffer) {
  try {
    const params = {
      Image: {
        Bytes: imageBuffer
      },
      MinConfidence: 60 // Adjust threshold (0-100)
    };

    const result = await rekognition.detectModerationLabels(params).promise();
    
    // Check for adult content
    const inappropriateLabels = result.ModerationLabels.filter(label => {
      const parentName = label.ParentName || label.Name;
      return ['Explicit Nudity', 'Suggestive', 'Violence', 'Visually Disturbing']
        .includes(parentName);
    });

    return {
      isInappropriate: inappropriateLabels.length > 0,
      labels: inappropriateLabels
    };
  } catch (error) {
    console.error('AWS Rekognition error:', error);
    throw error;
  }
}

// Add to your video upload controller
const uploadVideo = asyncHandler(async (req, res) => {
  const { title, description } = req.body;
  const videoFile = req.files?.videoFile?.[0];
  const thumbnail = req.files?.thumbnail?.[0];

  if (!videoFile || !thumbnail) {
    throw new ApiError(400, 'Video and thumbnail are required');
  }

  // ⚠️ STEP 1: Check thumbnail for inappropriate content
  const thumbnailBuffer = fs.readFileSync(thumbnail.path);
  const moderationResult = await moderateImage(thumbnailBuffer);

  if (moderationResult.isInappropriate) {
    // Delete uploaded files
    fs.unlinkSync(videoFile.path);
    fs.unlinkSync(thumbnail.path);
    
    throw new ApiError(403, 
      '🚫 Upload blocked: Content detected as inappropriate or adult material. ' +
      'Detected: ' + moderationResult.labels.map(l => l.Name).join(', ')
    );
  }

  // ⚠️ STEP 2: (Optional) Extract video frame and check
  // Use ffmpeg to extract first frame, then check with moderateImage()

  // Continue with normal upload...
  const video = await Video.create({
    title,
    description,
    videoFile: videoFile.path,
    thumbnail: thumbnail.path,
    owner: req.user._id,
    isPublished: true // Or set to false for manual review
  });

  res.status(201).json(new ApiResponse(201, video, 'Video uploaded successfully'));
});
```

---

### Option 2: Google Cloud Video Intelligence API

**Installation:**
```bash
npm install @google-cloud/video-intelligence
```

**Implementation:**
```javascript
const videoIntelligence = require('@google-cloud/video-intelligence');

const client = new videoIntelligence.VideoIntelligenceServiceClient({
  keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS
});

async function moderateVideo(videoUri) {
  const request = {
    inputUri: videoUri,
    features: ['EXPLICIT_CONTENT_DETECTION']
  };

  const [operation] = await client.annotateVideo(request);
  const [results] = await operation.promise();

  const explicitAnnotation = results.annotationResults[0].explicitAnnotation;
  
  // Check for inappropriate frames
  const inappropriateFrames = explicitAnnotation.frames.filter(frame => {
    return frame.pornographyLikelihood === 'VERY_LIKELY' || 
           frame.pornographyLikelihood === 'LIKELY';
  });

  return {
    isInappropriate: inappropriateFrames.length > 0,
    frames: inappropriateFrames
  };
}
```

---

### Option 3: Microsoft Azure Content Moderator

**Installation:**
```bash
npm install @azure/cognitiveservices-contentmoderator
```

**Implementation:**
```javascript
const { ContentModeratorClient } = require('@azure/cognitiveservices-contentmoderator');

const client = new ContentModeratorClient(
  process.env.AZURE_CONTENT_MODERATOR_ENDPOINT,
  { apiKey: process.env.AZURE_CONTENT_MODERATOR_KEY }
);

async function moderateWithAzure(imageBuffer) {
  const result = await client.imageModeration.evaluateFileInput(imageBuffer);
  
  return {
    isInappropriate: result.isImageAdultClassified || result.isImageRacyClassified,
    adultScore: result.adultClassificationScore,
    racyScore: result.racyClassificationScore
  };
}
```

---

### Option 4: Manual Review System (No AI Cost)

**Implementation:**
```javascript
const uploadVideo = asyncHandler(async (req, res) => {
  // ... upload logic ...

  // Set video to "pending review" status
  const video = await Video.create({
    title,
    description,
    videoFile: videoFile.path,
    thumbnail: thumbnail.path,
    owner: req.user._id,
    isPublished: false, // ⚠️ Not published until admin approves
    moderationStatus: 'pending' // pending, approved, rejected
  });

  res.status(201).json(
    new ApiResponse(201, video, 'Video uploaded. Pending admin review.')
  );
});

// Admin approval endpoint
const approveVideo = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  
  const video = await Video.findByIdAndUpdate(
    videoId,
    { 
      isPublished: true,
      moderationStatus: 'approved'
    },
    { new: true }
  );

  res.json(new ApiResponse(200, video, 'Video approved'));
});
```

---

## 🎯 Recommended Approach (Hybrid)

**Best Practice: Combine AI + Manual Review**

```javascript
const uploadVideo = asyncHandler(async (req, res) => {
  // Step 1: AI check thumbnail
  const moderationResult = await moderateImage(thumbnailBuffer);
  
  if (moderationResult.isInappropriate) {
    // Immediate block
    throw new ApiError(403, 'Content blocked: Inappropriate content detected');
  }

  // Step 2: Upload with pending status for manual verification
  const video = await Video.create({
    // ... fields ...
    isPublished: false, // Requires admin approval
    aiModerationPassed: true,
    moderationStatus: 'pending_review'
  });

  // Step 3: (Optional) Notify admin for review
  // await sendAdminNotification(video);

  res.status(201).json(
    new ApiResponse(201, video, 'Video uploaded. Under review for publication.')
  );
});
```

---

## 💰 Cost Comparison

| Service | Free Tier | Paid Pricing |
|---------|-----------|--------------|
| **AWS Rekognition** | 5,000 images/month (12 months) | $1-1.50 per 1,000 images |
| **Google Video Intelligence** | None | $0.10 per minute of video |
| **Azure Content Moderator** | 5,000 transactions/month free | $1 per 1,000 transactions |
| **Manual Review** | FREE | Time-consuming |

---

## 🔒 Environment Variables Needed

Add to your `.env` file:

```env
# AWS Rekognition
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key
AWS_REGION=us-east-1

# Google Cloud
GOOGLE_APPLICATION_CREDENTIALS=/path/to/credentials.json

# Azure
AZURE_CONTENT_MODERATOR_ENDPOINT=https://your-resource.cognitiveservices.azure.com/
AZURE_CONTENT_MODERATOR_KEY=your_api_key
```

---

## 📝 Testing

**Test with sample content:**
```javascript
// Add test endpoint (REMOVE IN PRODUCTION)
router.post('/test-moderation', upload.single('image'), async (req, res) => {
  try {
    const imageBuffer = fs.readFileSync(req.file.path);
    const result = await moderateImage(imageBuffer);
    
    fs.unlinkSync(req.file.path); // Clean up
    
    res.json({
      isInappropriate: result.isInappropriate,
      labels: result.labels
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
```

---

## 🚀 Quick Start (AWS Rekognition)

1. **Sign up for AWS**: https://aws.amazon.com/
2. **Create IAM user** with Rekognition permissions
3. **Install SDK**: `npm install aws-sdk`
4. **Add credentials** to `.env`
5. **Implement code** from Option 1 above
6. **Test** with sample images

---

## ⚡ Current Status

✅ **Frontend** - Fully implemented with policy warnings and checkbox
⏳ **Backend** - Needs implementation (choose one option above)

---

## 📞 Need Help?

- AWS Rekognition Docs: https://docs.aws.amazon.com/rekognition/
- Google Video Intelligence: https://cloud.google.com/video-intelligence/docs
- Azure Content Moderator: https://docs.microsoft.com/azure/cognitive-services/content-moderator/

---

**Remember:** Content moderation is not 100% accurate. Always combine AI with:
- User reporting system
- Regular audits
- Clear community guidelines
- Appeal process for false positives
