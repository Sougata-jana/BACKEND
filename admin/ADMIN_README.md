# Admin Panel Frontend

A beautiful, modern admin panel built with React, Tailwind CSS, and premium icons.

## 🚀 Features

- **Dashboard**: Overview of all platform statistics with interactive charts
- **Video Management**: View, search, filter, and delete videos
- **Analytics**: Detailed video performance metrics and rankings
- **Channel Management**: Manage users, toggle admin status, and view statistics
- **Premium UI**: Beautiful gradients, smooth animations, and responsive design
- **Real-time Data**: Live statistics and instant updates

## 📦 Technologies

- **React 19** - UI Framework
- **React Router DOM** - Routing
- **Tailwind CSS 4** - Styling
- **Lucide React** - Premium icons
- **Recharts** - Analytics charts
- **Axios** - HTTP client

## 🏃‍♂️ Running the Application

```bash
# Development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

The app will run on `http://localhost:5173`

## 🔐 Login

1. Navigate to `/login`
2. Enter admin credentials
3. User must have `isAdmin: true` in the database

## 🎯 API Endpoints Used

```
GET  /api/v1/admin/dashboard/stats
GET  /api/v1/admin/videos
DELETE /api/v1/admin/videos/:videoId
GET  /api/v1/admin/analytics/videos
GET  /api/v1/admin/channels
PATCH /api/v1/admin/users/:userId/toggle-admin
DELETE /api/v1/admin/users/:userId
POST /api/v1/user/login
POST /api/v1/user/logout
```

## 🔧 Environment Variables

`.env` file is already created:

```env
VITE_API_URL=http://localhost:3000/api/v1
```

## 🚦 Status

✅ All features implemented
✅ Responsive design complete
✅ Error handling in place
✅ Authentication working
✅ API integration done

**Built with ❤️ using React + Vite + Tailwind CSS**
