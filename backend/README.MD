# YouTube Clone Backend API

A comprehensive backend API for a YouTube-like video platform built with Node.js, Express, and MongoDB.

## Features

- **User Management**: Registration, login, profile management, avatar/cover image uploads
- **Video Management**: Upload, publish, update, delete videos with thumbnails
- **Comments System**: Add, update, delete comments on videos
- **Like/Dislike System**: Like videos, comments, and tweets
- **Playlist Management**: Create, manage playlists, add/remove videos
- **Subscription System**: Subscribe/unsubscribe to channels
- **Tweet System**: Create, update, delete tweets
- **File Upload**: Cloudinary integration for video and image uploads
- **Authentication**: JWT-based authentication with refresh tokens
- **Pagination**: MongoDB aggregation with pagination support

## Tech Stack

- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM for MongoDB
- **Cloudinary** - File storage and CDN
- **JWT** - Authentication
- **Multer** - File upload handling
- **bcrypt** - Password hashing

## Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file in the root directory with the following variables:
   ```env
   # Database
   MONGODB_URL=mongodb://localhost:27017
   
   # Server
   PORT=8000
   NODE_ENV=development
   
   # CORS
   ORIGIN_CORS=http://localhost:3000
   
   # JWT
   ACCESS_TOKEN_SECRET=your_access_token_secret_here
   ACCESS_TOKEN_SECRET_EXPIRES=15m
   REFRESH_TOKEN_SECRET=your_refresh_token_secret_here
   REFRESH_TOKEN_SECRET_EXPIRES=7d
   
   # Cloudinary
   CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
   CLOUDINARY_API_KEY=your_cloudinary_api_key
   CLOUDINARY_API_KEY_SECRET=your_cloudinary_api_secret
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

## API Endpoints

### Health Check
- `GET /health` - Check API health status

### User Routes (`/api/v1/user`)
- `POST /register` - Register a new user
- `POST /login` - Login user
- `POST /logout` - Logout user
- `POST /refresh-token` - Refresh access token
- `POST /change-password` - Change user password
- `GET /current-user` - Get current user profile
- `PATCH /update-account` - Update account details
- `PATCH /update-avatar` - Update user avatar
- `PATCH /update-coverimage` - Update cover image
- `GET /c/:username` - Get user channel profile
- `GET /watch-history` - Get user watch history

### Video Routes (`/api/v1/videos`)
- `GET /` - Get all published videos (with pagination and filtering)
- `POST /` - Upload and publish a new video
- `GET /:videoId` - Get video by ID
- `PATCH /:videoId` - Update video details
- `DELETE /:videoId` - Delete video
- `PATCH /toggle/publish/:videoId` - Toggle video publish status

### Comment Routes (`/api/v1/comments`)
- `GET /:videoId` - Get all comments for a video
- `POST /:videoId` - Add comment to video
- `PATCH /c/:commentId` - Update comment
- `DELETE /c/:commentId` - Delete comment

### Like Routes (`/api/v1/likes`)
- `POST /toggle/v/:videoId` - Toggle like on video
- `POST /toggle/c/:commentId` - Toggle like on comment
- `POST /toggle/t/:tweetId` - Toggle like on tweet
- `GET /videos` - Get user's liked videos

### Playlist Routes (`/api/v1/playlists`)
- `POST /` - Create new playlist
- `GET /user/:userId` - Get user's playlists
- `GET /:playlistId` - Get playlist by ID
- `PATCH /:playlistId` - Update playlist
- `DELETE /:playlistId` - Delete playlist
- `POST /add/:playlistId/:videoId` - Add video to playlist
- `DELETE /remove/:playlistId/:videoId` - Remove video from playlist

### Subscription Routes (`/api/v1/subscriptions`)
- `POST /toggle/:channelId` - Toggle subscription to channel
- `GET /subscribers/:channelId` - Get channel subscribers
- `GET /subscribed/:subscriberId` - Get user's subscribed channels

### Tweet Routes (`/api/v1/tweets`)
- `GET /` - Get all tweets
- `POST /` - Create new tweet
- `GET /user/:userId` - Get user's tweets
- `PATCH /:tweetId` - Update tweet
- `DELETE /:tweetId` - Delete tweet

## Authentication

The API uses JWT-based authentication. Include the access token in the Authorization header:

```
Authorization: Bearer <access_token>
```

Or use HTTP-only cookies for automatic authentication.

## File Upload

- Videos and images are uploaded to Cloudinary
- Supported formats: MP4, AVI, MOV for videos; JPG, PNG for images
- Files are temporarily stored locally before upload to Cloudinary

## Database Models

- **User**: User accounts with profile information
- **Video**: Video metadata and file references
- **Comment**: Comments on videos
- **Like**: Likes on videos, comments, and tweets
- **Playlist**: Video playlists
- **Subscription**: User subscriptions to channels
- **Tweet**: Social media-style posts

## Error Handling

The API uses consistent error responses:

```json
{
  "statusCode": 400,
  "data": null,
  "message": "Error message",
  "success": false
}
```

## Success Responses

```json
{
  "statusCode": 200,
  "data": {...},
  "message": "Success message",
  "success": true
}
```

## Development

- Uses ES6 modules
- Includes comprehensive error handling
- Implements pagination for large datasets
- Supports file uploads with Cloudinary integration
- JWT authentication with refresh token mechanism

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the ISC License.