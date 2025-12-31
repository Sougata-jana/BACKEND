# Admin Panel Backend API Documentation

## Overview
This admin panel provides comprehensive management capabilities for your video platform including video management, user analytics, and channel oversight.

## Features Implemented

### 1. **Access All Videos**
   - View all videos with pagination and search
   - Filter and sort options
   - Complete video details with owner information
   - Like counts for each video

### 2. **Delete Videos**
   - Delete any video from the platform
   - Automatic cleanup of associated data (likes, comments)
   - Cloudinary asset deletion (video files and thumbnails)

### 3. **Video Analytics**
   - Best performing videos based on:
     - Views
     - Likes
     - Engagement score (combined metrics)
   - Overall platform statistics
   - Total videos, views, and likes

### 4. **Channel Management**
   - View all channels/users
   - User statistics (subscribers, videos, total views)
   - Search and filter capabilities
   - Pagination support

## API Endpoints

### Base URL
```
/api/v1/admin
```

All admin routes require:
- Valid JWT token (authentication)
- Admin privileges (isAdmin: true)

---

### 1. Dashboard Statistics
**GET** `/api/v1/admin/dashboard/stats`

Get overall platform statistics.

**Response:**
```json
{
  "statusCode": 200,
  "data": {
    "users": {
      "total": 150,
      "admins": 3,
      "recentWeek": 12
    },
    "videos": {
      "total": 450,
      "published": 420,
      "unpublished": 30,
      "recentWeek": 25
    },
    "engagement": {
      "totalViews": 125000,
      "totalLikes": 8500,
      "totalSubscriptions": 3200
    }
  },
  "message": "Dashboard statistics fetched successfully",
  "success": true
}
```

---

### 2. Get All Videos (Admin)
**GET** `/api/v1/admin/videos`

Fetch all videos with advanced filtering and pagination.

**Query Parameters:**
- `page` (default: 1)
- `limit` (default: 10)
- `sortBy` (default: "createdAt") - Options: createdAt, views, title
- `sortType` (default: "desc") - Options: desc, asc
- `search` - Search by title or description

**Example:**
```
GET /api/v1/admin/videos?page=1&limit=20&sortBy=views&sortType=desc&search=tutorial
```

**Response:**
```json
{
  "statusCode": 200,
  "data": {
    "docs": [
      {
        "_id": "video_id",
        "title": "Video Title",
        "description": "Video Description",
        "videoFile": "cloudinary_url",
        "thumbnail": "cloudinary_url",
        "views": 1000,
        "duration": 600,
        "isPublished": true,
        "owner": {
          "_id": "user_id",
          "username": "johndoe",
          "fullname": "John Doe",
          "avatar": "avatar_url",
          "email": "john@example.com"
        },
        "likesCount": 50,
        "createdAt": "2025-01-01T00:00:00.000Z"
      }
    ],
    "totalDocs": 450,
    "limit": 20,
    "page": 1,
    "totalPages": 23
  },
  "message": "Videos fetched successfully",
  "success": true
}
```

---

### 3. Delete Video
**DELETE** `/api/v1/admin/videos/:videoId`

Delete a video and all associated data.

**Parameters:**
- `videoId` - MongoDB ObjectId of the video

**Example:**
```
DELETE /api/v1/admin/videos/507f1f77bcf86cd799439011
```

**Response:**
```json
{
  "statusCode": 200,
  "data": {},
  "message": "Video deleted successfully",
  "success": true
}
```

---

### 4. Video Analytics
**GET** `/api/v1/admin/analytics/videos`

Get best performing videos and overall statistics.

**Query Parameters:**
- `limit` (default: 10) - Number of top videos to return
- `sortBy` (default: "views") - Options: views, likes, engagement

**Example:**
```
GET /api/v1/admin/analytics/videos?limit=10&sortBy=engagement
```

**Response:**
```json
{
  "statusCode": 200,
  "data": {
    "bestVideos": [
      {
        "_id": "video_id",
        "title": "Most Popular Video",
        "views": 50000,
        "likesCount": 2500,
        "engagementScore": 62500,
        "owner": {
          "username": "creator",
          "fullname": "Creator Name",
          "avatar": "avatar_url"
        }
      }
    ],
    "statistics": {
      "totalVideos": 450,
      "totalViews": 125000,
      "avgViews": 277.78,
      "publishedVideos": 420,
      "totalLikes": 8500
    }
  },
  "message": "Video analytics fetched successfully",
  "success": true
}
```

---

### 5. Get All Channels
**GET** `/api/v1/admin/channels`

Fetch all users/channels with their statistics.

**Query Parameters:**
- `page` (default: 1)
- `limit` (default: 10)
- `sortBy` (default: "subscribers") - Options: subscribers, videos, views, createdAt
- `search` - Search by username, fullname, or email

**Example:**
```
GET /api/v1/admin/channels?page=1&limit=20&sortBy=subscribers&search=john
```

**Response:**
```json
{
  "statusCode": 200,
  "data": {
    "channels": [
      {
        "_id": "user_id",
        "username": "johndoe",
        "email": "john@example.com",
        "fullname": "John Doe",
        "avatar": "avatar_url",
        "coverImage": "cover_url",
        "subscribersCount": 1500,
        "videosCount": 45,
        "totalViews": 125000,
        "isAdmin": false,
        "createdAt": "2025-01-01T00:00:00.000Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 150,
      "totalPages": 8
    }
  },
  "message": "Channels fetched successfully",
  "success": true
}
```

---

### 6. Toggle User Admin Status
**PATCH** `/api/v1/admin/users/:userId/toggle-admin`

Toggle admin privileges for a user.

**Parameters:**
- `userId` - MongoDB ObjectId of the user

**Example:**
```
PATCH /api/v1/admin/users/507f1f77bcf86cd799439011/toggle-admin
```

**Response:**
```json
{
  "statusCode": 200,
  "data": {
    "_id": "user_id",
    "username": "johndoe",
    "email": "john@example.com",
    "fullname": "John Doe",
    "isAdmin": true
  },
  "message": "User admin status updated to true",
  "success": true
}
```

---

### 7. Delete User Account
**DELETE** `/api/v1/admin/users/:userId`

Delete a user account and all associated data.

**Parameters:**
- `userId` - MongoDB ObjectId of the user

**Example:**
```
DELETE /api/v1/admin/users/507f1f77bcf86cd799439011
```

**Response:**
```json
{
  "statusCode": 200,
  "data": {},
  "message": "User account deleted successfully",
  "success": true
}
```

---

## Authentication

All admin endpoints require two levels of authentication:

1. **JWT Authentication** - Valid access token in cookies or Authorization header
2. **Admin Verification** - User must have `isAdmin: true` in their account

### Headers Required:
```
Authorization: Bearer <access_token>
```

OR

Cookie: `accessToken=<access_token>`

---

## Error Responses

### 401 Unauthorized
```json
{
  "statusCode": 401,
  "message": "Unauthorized request",
  "success": false
}
```

### 403 Forbidden
```json
{
  "statusCode": 403,
  "message": "Access denied. Admin privileges required.",
  "success": false
}
```

### 404 Not Found
```json
{
  "statusCode": 404,
  "message": "Video not found",
  "success": false
}
```

### 400 Bad Request
```json
{
  "statusCode": 400,
  "message": "Invalid video ID",
  "success": false
}
```

---

## Setup Instructions

### 1. Update User Model
The user model has been updated to include an `isAdmin` field:
```javascript
isAdmin: {
  type: Boolean,
  default: false
}
```

### 2. Create First Admin User
To create your first admin user, you need to manually update a user in the database:

**Using MongoDB Shell:**
```javascript
db.users.updateOne(
  { email: "your-admin-email@example.com" },
  { $set: { isAdmin: true } }
)
```

**OR using MongoDB Compass:**
1. Open your users collection
2. Find your user
3. Edit the document
4. Add field: `isAdmin: true`
5. Save

### 3. Environment Variables
Make sure you have these environment variables set in your `.env` file:
```env
ACCESS_TOKEN_SECRET=your_access_token_secret
REFRESH_TOKEN_SECRET=your_refresh_token_secret
CLOUDINARY_CLOUD_NAME=your_cloudinary_name
CLOUDINARY_API_KEY=your_cloudinary_key
CLOUDINARY_API_KEY_SECRET=your_cloudinary_secret
```

---

## Frontend Integration

### Example: Fetch All Videos
```javascript
const getAllVideos = async (page = 1, limit = 10, search = '') => {
  try {
    const response = await fetch(
      `http://localhost:3000/api/v1/admin/videos?page=${page}&limit=${limit}&search=${search}`,
      {
        method: 'GET',
        credentials: 'include', // For cookies
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      }
    );
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching videos:', error);
  }
};
```

### Example: Delete Video
```javascript
const deleteVideo = async (videoId) => {
  try {
    const response = await fetch(
      `http://localhost:3000/api/v1/admin/videos/${videoId}`,
      {
        method: 'DELETE',
        credentials: 'include',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      }
    );
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error deleting video:', error);
  }
};
```

### Example: Get Analytics
```javascript
const getAnalytics = async (limit = 10, sortBy = 'views') => {
  try {
    const response = await fetch(
      `http://localhost:3000/api/v1/admin/analytics/videos?limit=${limit}&sortBy=${sortBy}`,
      {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      }
    );
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching analytics:', error);
  }
};
```

### Example: Get All Channels
```javascript
const getAllChannels = async (page = 1, limit = 10, sortBy = 'subscribers') => {
  try {
    const response = await fetch(
      `http://localhost:3000/api/v1/admin/channels?page=${page}&limit=${limit}&sortBy=${sortBy}`,
      {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      }
    );
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching channels:', error);
  }
};
```

---

## Files Created/Modified

### Created Files:
1. `backend/src/controllers/admin.controllers.js` - Admin controller with all functions
2. `backend/src/routes/admin.routes.js` - Admin routes configuration
3. `backend/src/middlewares/admin.middlewares.js` - Admin verification middleware

### Modified Files:
1. `backend/src/models/user.model.js` - Added `isAdmin` field
2. `backend/src/app.js` - Added admin routes
3. `backend/src/utils/cloudinary.js` - Added `deleteFromCloudinary` function

---

## Security Notes

1. **Admin Access Control**: All routes are protected by both JWT authentication and admin verification
2. **Data Cleanup**: When deleting videos or users, all associated data is properly cleaned up
3. **Cloudinary Management**: Media files are deleted from Cloudinary when videos are removed
4. **Input Validation**: All IDs are validated using mongoose.isValidObjectId()

---

## Testing the API

You can test the API using:
- Postman
- Thunder Client (VS Code extension)
- cURL commands
- Your frontend application

### Example cURL Command:
```bash
# Get all videos
curl -X GET "http://localhost:3000/api/v1/admin/videos?page=1&limit=10" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json"

# Delete a video
curl -X DELETE "http://localhost:3000/api/v1/admin/videos/VIDEO_ID" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json"

# Get analytics
curl -X GET "http://localhost:3000/api/v1/admin/analytics/videos?limit=10&sortBy=views" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json"

# Get all channels
curl -X GET "http://localhost:3000/api/v1/admin/channels?page=1&limit=20" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json"
```

---

## Next Steps

1. **Create your first admin user** using the setup instructions above
2. **Test the API endpoints** using Postman or your frontend
3. **Integrate with your frontend** admin panel
4. **Customize** the analytics and dashboard as needed

---

## Support

If you encounter any issues:
1. Check that your user has `isAdmin: true`
2. Verify your JWT token is valid
3. Ensure all environment variables are set correctly
4. Check MongoDB connection

---

**Admin Panel Backend - Ready to Use! 🚀**
