import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
const app = express();

// Configure CORS with support for comma-separated origins
const allowedOrigins = (process.env.ORIGIN_CORS || '')
  .split(',')
  .map(o => o.trim())
  .filter(Boolean)

app.use(cors({
  origin: function (origin, callback) {
    // allow non-browser clients (e.g., curl, Postman) where origin may be undefined
    if (!origin) return callback(null, true)
    if (allowedOrigins.length === 0 || allowedOrigins.includes(origin)) {
      return callback(null, true)
    }
    return callback(new Error('Not allowed by CORS'))
  },
  credentials: true,
}))

app.use(express.json({limit: '20kb'}))
app.use(express.urlencoded({extended:true, limit: "20kb"}))
app.use(express.static("public"))
app.use(cookieParser())


// Import routes
import userRoutes from './routes/user.routes.js';
import videoRoutes from './routes/video.routes.js';
import commentRoutes from './routes/comment.routes.js';
import likeRoutes from './routes/like.routes.js';
import playlistRoutes from './routes/playlist.routes.js';
import subscriptionRoutes from './routes/subscription.routes.js';
import tweetRoutes from './routes/tweet.routes.js';
import dashboardRoutes from './routes/dashboard.routes.js';
import notificationRoutes from './routes/notification.routes.js';
import bookmarkRoutes from './routes/bookmark.routes.js';
import adminRoutes from './routes/admin.routes.js';
import { healthCheck } from './controllers/healthCheck.controllers.js';

// routes declaration
app.get("/health", healthCheck)

app.use("/api/v1/users", userRoutes)
app.use("/api/v1/videos", videoRoutes)
app.use("/api/v1/comments", commentRoutes)
app.use("/api/v1/likes", likeRoutes)
app.use("/api/v1/playlists", playlistRoutes)
app.use("/api/v1/subscriptions", subscriptionRoutes)
app.use("/api/v1/tweets", tweetRoutes)
app.use("/api/v1/dashboard", dashboardRoutes)
app.use("/api/v1/notifications", notificationRoutes)
app.use("/api/v1/bookmarks", bookmarkRoutes)
app.use("/api/v1/admin", adminRoutes)

  // http://localhost:3000/api/v1/user/register



export default app