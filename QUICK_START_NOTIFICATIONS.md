# 🚀 Quick Start Guide - Notification System

## Step 1: Start the Backend
```bash
cd backend
npm start
```

## Step 2: Start the Frontend  
```bash
cd frontend
npm run dev
```

## Step 3: Test the Notifications

### Test Like Notifications
1. Log in with one account
2. Upload or view a video
3. Log in with a different account (use incognito/another browser)
4. Like the video
5. Go back to the first account
6. Click the notification bell 🔔 - You should see a "liked your video" notification!

### Test Comment Notifications
1. With the second account, comment on the video
2. Switch to the first account
3. Check notifications - New comment notification appears!

### Test Subscription Notifications
1. With the second account, subscribe to the first user's channel
2. Switch to the first account  
3. Check notifications - New subscriber notification!

## Features to Try

✅ **Unread Badge** - Red badge shows number of unread notifications  
✅ **Mark as Read** - Click a notification to mark it as read  
✅ **Mark All Read** - Clear all unread notifications at once  
✅ **Delete** - Remove individual notifications with the X button  
✅ **Auto Refresh** - Unread count updates every 30 seconds automatically  
✅ **Navigation** - Click notifications to go to related content  

## API Testing with Postman/Thunder Client

### Get Notifications
```
GET http://localhost:8000/api/v1/notifications
Headers: Authorization: Bearer YOUR_TOKEN
```

### Get Unread Count
```
GET http://localhost:8000/api/v1/notifications/unread-count
Headers: Authorization: Bearer YOUR_TOKEN
```

### Mark as Read
```
PATCH http://localhost:8000/api/v1/notifications/:notificationId/read
Headers: Authorization: Bearer YOUR_TOKEN
```

## Troubleshooting

**Problem**: Notifications not showing up  
**Solution**: Make sure both users are different (you can't notify yourself)

**Problem**: Unread count stuck  
**Solution**: Refresh the page or wait 30 seconds for auto-update

**Problem**: API errors  
**Solution**: Check if backend is running and MongoDB is connected

## What's Next?

Check [NOTIFICATION_SYSTEM.md](./NOTIFICATION_SYSTEM.md) for:
- Complete API documentation
- Customization options
- Future enhancement ideas
- Code examples

Enjoy your new notification system! 🎉
