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

// Welcome route - serve HTML for browser, JSON for API clients
app.get("/", (req, res) => {
  // Check if request is from a browser
  const acceptsHtml = req.accepts('html');
  
  if (acceptsHtml) {
    // Send HTML page for browsers
    res.status(200).send(`
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>BuzzTube API Server</title>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            color: #fff;
            padding: 20px;
          }
          .container {
            background: rgba(255, 255, 255, 0.1);
            backdrop-filter: blur(10px);
            border-radius: 20px;
            padding: 40px;
            max-width: 800px;
            width: 100%;
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
            border: 1px solid rgba(255, 255, 255, 0.2);
          }
          h1 {
            font-size: 3rem;
            margin-bottom: 10px;
            text-align: center;
          }
          .status {
            text-align: center;
            margin-bottom: 30px;
            font-size: 1.2rem;
            opacity: 0.9;
          }
          .status-badge {
            display: inline-block;
            background: #22c55e;
            padding: 8px 20px;
            border-radius: 20px;
            font-weight: 600;
            margin-top: 10px;
          }
          .endpoints {
            background: rgba(0, 0, 0, 0.2);
            border-radius: 12px;
            padding: 25px;
            margin-top: 30px;
          }
          .endpoints h2 {
            margin-bottom: 15px;
            font-size: 1.5rem;
          }
          .endpoint-list {
            display: grid;
            gap: 10px;
          }
          .endpoint-item {
            background: rgba(255, 255, 255, 0.1);
            padding: 12px 18px;
            border-radius: 8px;
            font-family: 'Courier New', monospace;
            transition: all 0.3s ease;
            cursor: pointer;
          }
          .endpoint-item:hover {
            background: rgba(255, 255, 255, 0.2);
            transform: translateX(5px);
          }
          .footer {
            text-align: center;
            margin-top: 30px;
            opacity: 0.8;
            font-size: 0.9rem;
          }
          .emoji { font-size: 2rem; margin-right: 10px; }
        </style>
      </head>
      <body>
        <div class="container">
          <h1><span class="emoji">🎬</span>BuzzTube API</h1>
          <div class="status">
            <p>Backend Server is Running</p>
            <span class="status-badge">✓ ONLINE</span>
          </div>
          
          <div class="endpoints">
            <h2>📍 Available Endpoints</h2>
            <div class="endpoint-list">
              <div class="endpoint-item" onclick="window.location.href='/health'">
                <strong>GET</strong> /health - Health Check
              </div>
              <div class="endpoint-item">
                <strong>API</strong> /api/v1/users - User Management
              </div>
              <div class="endpoint-item">
                <strong>API</strong> /api/v1/videos - Video Operations
              </div>
              <div class="endpoint-item">
                <strong>API</strong> /api/v1/comments - Comments
              </div>
              <div class="endpoint-item">
                <strong>API</strong> /api/v1/likes - Likes
              </div>
              <div class="endpoint-item">
                <strong>API</strong> /api/v1/playlists - Playlists
              </div>
              <div class="endpoint-item">
                <strong>API</strong> /api/v1/subscriptions - Subscriptions
              </div>
              <div class="endpoint-item">
                <strong>API</strong> /api/v1/tweets - Tweets
              </div>
              <div class="endpoint-item">
                <strong>API</strong> /api/v1/dashboard - Dashboard
              </div>
              <div class="endpoint-item">
                <strong>API</strong> /api/v1/notifications - Notifications
              </div>
              <div class="endpoint-item">
                <strong>API</strong> /api/v1/bookmarks - Bookmarks
              </div>
              <div class="endpoint-item">
                <strong>API</strong> /api/v1/admin - Admin Panel
              </div>
            </div>
          </div>
          
          <div class="footer">
            <p>⚡ Powered by Express.js | Version 1.0.0</p>
            <p>Server Time: ${new Date().toLocaleString()}</p>
          </div>
        </div>
      </body>
      </html>
    `);
  } else {
    // Send JSON for API clients
    res.status(200).json({
      success: true,
      message: "🎬 Backend API Server is running!",
      version: "1.0.0",
      endpoints: {
        health: "/health",
        api: "/api/v1",
        documentation: {
          users: "/api/v1/users",
          videos: "/api/v1/videos",
          comments: "/api/v1/comments",
          likes: "/api/v1/likes",
          playlists: "/api/v1/playlists",
          subscriptions: "/api/v1/subscriptions",
          tweets: "/api/v1/tweets",
          dashboard: "/api/v1/dashboard",
          notifications: "/api/v1/notifications",
          bookmarks: "/api/v1/bookmarks",
          admin: "/api/v1/admin"
        }
      },
      timestamp: new Date().toISOString()
    });
  }
});

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

// 404 handler for undefined routes (must be after all other routes)
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Cannot ${req.method} ${req.originalUrl}`,
    error: "Route not found",
    availableRoutes: {
      root: "/",
      health: "/health",
      api: "/api/v1"
    }
  });
});

  // http://localhost:3000/api/v1/user/register



export default app