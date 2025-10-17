import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AuthProvider } from './contexts/AuthContext'
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

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
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
            </Route>
            
            {/* 404 page */}
            <Route path="*" element={<NotFound />} />
          </Routes>
          
          {/* Toast notifications */}
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: '#1f2937',
                color: '#f9fafb',
                border: '1px solid #374151',
              },
              success: {
                iconTheme: {
                  primary: '#10b981',
                  secondary: '#f9fafb',
                },
              },
              error: {
                iconTheme: {
                  primary: '#ef4444',
                  secondary: '#f9fafb',
                },
              },
            }}
          />
        </div>
      </Router>
    </AuthProvider>
  )
}

export default App