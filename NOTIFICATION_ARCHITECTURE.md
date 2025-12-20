# 📊 Notification System Architecture

## System Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                      USER ACTIONS                                │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                  TRIGGER EVENTS                                  │
│  • User likes a video                                            │
│  • User comments on a video                                      │
│  • User subscribes to a channel                                  │
│  • User uploads a video (for subscribers)                        │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│               BACKEND CONTROLLERS                                │
│  like.controllers.js    → createNotification()                   │
│  comment.controllers.js → createNotification()                   │
│  subscription.controllers.js → createNotification()              │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│          NOTIFICATION CONTROLLER                                 │
│  notification.controllers.js                                     │
│  • Validates recipient ≠ sender                                  │
│  • Creates notification document                                 │
│  • Saves to MongoDB                                              │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    MONGODB DATABASE                              │
│  Notification Collection:                                        │
│  {                                                               │
│    recipient: ObjectId,                                          │
│    sender: ObjectId,                                             │
│    type: String,                                                 │
│    content: String,                                              │
│    isRead: Boolean,                                              │
│    actionUrl: String,                                            │
│    video/comment/tweet: ObjectId,                                │
│    timestamps                                                    │
│  }                                                               │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                  API ENDPOINTS                                   │
│  GET    /api/v1/notifications                                    │
│  GET    /api/v1/notifications/unread-count                       │
│  PATCH  /api/v1/notifications/:id/read                           │
│  PATCH  /api/v1/notifications/mark-all-read                      │
│  DELETE /api/v1/notifications/:id                                │
│  DELETE /api/v1/notifications/clear-all                          │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│              FRONTEND - NOTIFICATION CONTEXT                     │
│  NotificationContext.jsx                                         │
│  • Manages notification state                                    │
│  • Fetches notifications                                         │
│  • Polls for updates every 30s                                   │
│  • Provides helper functions                                     │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                UI COMPONENT                                      │
│  NotificationBell.jsx                                            │
│  • Displays bell icon with badge                                │
│  • Shows unread count                                            │
│  • Dropdown with notification list                              │
│  • Interactive: mark read, delete                                │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                         USER                                     │
│  • Sees notification badge                                       │
│  • Clicks to view notifications                                  │
│  • Navigates to related content                                  │
│  • Manages notifications (read/delete)                           │
└─────────────────────────────────────────────────────────────────┘
```

## Data Flow Example: Video Like Notification

```
1. User B clicks "Like" on User A's video
   ↓
2. Frontend sends: POST /api/v1/likes/toggle/video/:videoId
   ↓
3. Backend (like.controllers.js):
   - Creates Like document
   - Calls createNotification({
       recipient: User A,
       sender: User B,
       type: 'like',
       content: 'User B liked your video',
       video: videoId
     })
   ↓
4. Notification saved in MongoDB
   ↓
5. User A's frontend (auto-polling every 30s):
   - Fetches GET /api/v1/notifications/unread-count
   - Updates badge: 1 unread
   ↓
6. User A clicks notification bell
   - Fetches GET /api/v1/notifications
   - Displays: "User B liked your video" ❤️
   ↓
7. User A clicks on notification
   - Marks as read: PATCH /api/v1/notifications/:id/read
   - Navigates to video
   - Badge count decreases
```

## Component Integration

```
App.jsx
├── AuthProvider
│   └── NotificationProvider  ← Wraps entire app
│       └── Router
│           └── Layout
│               └── Header
│                   └── NotificationBell ← Visible in header
```

## Database Schema

```sql
Notifications Collection:
┌──────────────┬──────────────┬────────────────────────┐
│ Field        │ Type         │ Description            │
├──────────────┼──────────────┼────────────────────────┤
│ _id          │ ObjectId     │ Primary key            │
│ recipient    │ ObjectId     │ User receiving notif   │
│ sender       │ ObjectId     │ User who triggered     │
│ type         │ String       │ like/comment/subscribe │
│ content      │ String       │ Notification message   │
│ isRead       │ Boolean      │ Read status            │
│ actionUrl    │ String       │ Navigation link        │
│ video        │ ObjectId     │ Related video (opt)    │
│ comment      │ ObjectId     │ Related comment (opt)  │
│ tweet        │ ObjectId     │ Related tweet (opt)    │
│ createdAt    │ Date         │ Timestamp              │
│ updatedAt    │ Date         │ Last modified          │
└──────────────┴──────────────┴────────────────────────┘

Indexes:
- { recipient: 1, isRead: 1, createdAt: -1 } ← Fast queries
- { recipient: 1 } ← User notifications
- { isRead: 1 } ← Unread filter
```

## API Response Examples

### Get Notifications Response
```json
{
  "statusCode": 200,
  "data": {
    "notifications": [
      {
        "_id": "abc123",
        "recipient": "user1",
        "sender": {
          "username": "john_doe",
          "avatar": "https://...",
          "fullname": "John Doe"
        },
        "type": "like",
        "content": "john_doe liked your video: Amazing Tutorial",
        "isRead": false,
        "actionUrl": "/video/xyz789",
        "createdAt": "2025-12-20T10:30:00Z"
      }
    ],
    "totalPages": 1,
    "currentPage": 1,
    "totalNotifications": 5
  },
  "message": "Notifications fetched successfully"
}
```

### Unread Count Response
```json
{
  "statusCode": 200,
  "data": {
    "unreadCount": 3
  },
  "message": "Unread count fetched successfully"
}
```

## Performance Considerations

1. **Indexed Queries**: Fast lookup using compound index
2. **Pagination**: Limits data transfer (20 per page)
3. **Polling Interval**: 30s balance between freshness and load
4. **Selective Population**: Only populates necessary sender fields
5. **Client-side Caching**: NotificationContext maintains local state

## Future Optimization Ideas

1. **WebSocket/SSE**: Real-time push instead of polling
2. **Redis Cache**: Cache unread counts for faster access
3. **Batch Processing**: Group similar notifications
4. **Archive Old**: Move read notifications to archive after 30 days
5. **Push Notifications**: Browser push API integration
6. **Email Digest**: Weekly summary emails

---

This architecture provides a scalable, maintainable notification system! 🚀
