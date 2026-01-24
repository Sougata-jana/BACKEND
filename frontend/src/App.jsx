import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AuthProvider } from './contexts/AuthContext'
import { NotificationProvider } from './contexts/NotificationContext'
import Layout from './components/Layout/Layout'
import Home from './pages/Home'
import VideoPlayer from './pages/VideoPlayer'
import Channel from './pages/Channel'
import Search from './pages/Search'
import Library from './pages/Library'
import History from './pages/History'
import LikedVideos from './pages/LikedVideos'
import Playlist from './pages/Playlist'
import Login from './pages/Login'
import Register from './pages/Register'
import NotFound from './pages/NotFound'
import Upload from './pages/Upload'
import MyVideos from './pages/MyVideos'
import Trending from './pages/Trending'
import WatchLater from './pages/WatchLater'
import Dashboard from './pages/Dashboard'
import Settings from './pages/Settings'
import Subscriptions from './pages/Subscriptions'
import Bookmarks from './pages/Bookmarks'

function App() {
  return (
    <AuthProvider>
      <NotificationProvider>
        <Router>
          <div className="min-h-screen bg-gray-50 dark:bg-gray-900 overflow-x-hidden w-full">
            <Routes>
            {/* Public routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            
            {/* Protected routes with layout */}
            <Route path="/" element={<Layout />}>
              <Route index element={<Home />} />
              <Route path="video/:videoId" element={<VideoPlayer />} />
              <Route path="upload" element={<Upload />} />
              <Route path="my-videos" element={<MyVideos />} />
              <Route path="channel/:channelId" element={<Channel />} />
              <Route path="search" element={<Search />} />
              <Route path="library" element={<Library />} />
              <Route path="history" element={<History />} />
              <Route path="liked" element={<LikedVideos />} />
              <Route path="playlist/:playlistId" element={<Playlist />} />
              <Route path="trending" element={<Trending />} />
              <Route path="watch-later" element={<WatchLater />} />
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="settings" element={<Settings />} />
              <Route path="subscriptions" element={<Subscriptions />} />
              <Route path="bookmarks" element={<Bookmarks />} />
            </Route>
            
            {/* 404 page */}
            <Route path="*" element={<NotFound />} />
          </Routes>
          
          {/* Toast notifications */}
          <Toaster
            position="top-right"
            reverseOrder={false}
            gutter={8}
            containerClassName=""
            containerStyle={{}}
            toastOptions={{
              // Default options
              duration: 4000,
              style: {
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: '#ffffff',
                padding: '16px 20px',
                borderRadius: '12px',
                fontSize: '14px',
                fontWeight: '500',
                boxShadow: '0 10px 25px rgba(0, 0, 0, 0.2), 0 6px 12px rgba(0, 0, 0, 0.15)',
                border: 'none',
                maxWidth: '400px',
                backdropFilter: 'blur(10px)',
              },
              // Success toast
              success: {
                duration: 3500,
                style: {
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  color: '#ffffff',
                },
                iconTheme: {
                  primary: '#10b981',
                  secondary: '#ffffff',
                },
              },
              // Error toast
              error: {
                duration: 4500,
                style: {
                  background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                  color: '#ffffff',
                },
                iconTheme: {
                  primary: '#ef4444',
                  secondary: '#ffffff',
                },
              },
              // Loading toast
              loading: {
                style: {
                  background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
                  color: '#ffffff',
                },
                iconTheme: {
                  primary: '#3b82f6',
                  secondary: '#ffffff',
                },
              },
              // Custom toast
              custom: {
                style: {
                  background: 'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)',
                  color: '#1f2937',
                },
              },
            }}
          />
        </div>
      </Router>
      </NotificationProvider>
    </AuthProvider>
  )
}

export default App