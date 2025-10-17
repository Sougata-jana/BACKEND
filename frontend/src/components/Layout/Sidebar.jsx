import { Link, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuth } from '../../contexts/AuthContext'
import {
  Home,
  TrendingUp,
  Flame,
  Library,
  History,
  Clock,
  ThumbsUp,
  Video,
  Settings,
  LogOut,
  User,
  Play,
  Search,
  X
} from 'lucide-react'

const Sidebar = ({ onClose }) => {
  const location = useLocation()
  const { user, logout } = useAuth()

  const mainNavItems = [
    { icon: Home, label: 'Home', path: '/' },
    { icon: TrendingUp, label: 'Trending', path: '/trending' },
    { icon: Flame, label: 'Subscriptions', path: '/subscriptions' },
  ]

  const libraryItems = [
    { icon: Library, label: 'Library', path: '/library' },
    { icon: History, label: 'History', path: '/history' },
    { icon: Video, label: 'Your videos', path: '/my-videos' },
    { icon: Clock, label: 'Watch later', path: '/watch-later' },
    { icon: ThumbsUp, label: 'Liked videos', path: '/liked' },
  ]

  const isActive = (path) => location.pathname === path

  const handleLogout = async () => {
    await logout()
    onClose()
  }

  return (
    <div className="flex flex-col h-full">
      {/* Close button for mobile */}
      <div className="flex items-center justify-between p-4 lg:hidden">
        <h1 className="text-xl font-bold text-gradient">YouTube Clone</h1>
        <button
          onClick={onClose}
          className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
        >
          <X size={20} />
        </button>
      </div>

      {/* Main navigation */}
      <nav className="flex-1 px-4 py-2 space-y-1">
        {/* Main nav items */}
        <div className="space-y-1">
          {mainNavItems.map((item) => {
            const Icon = item.icon
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={onClose}
                className={`flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200 group ${
                  isActive(item.path)
                    ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-gray-100'
                }`}
              >
                <motion.div
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Icon 
                    size={20} 
                    className={`mr-3 ${
                      isActive(item.path) 
                        ? 'text-red-600 dark:text-red-400' 
                        : 'text-gray-500 dark:text-gray-400 group-hover:text-gray-700 dark:group-hover:text-gray-200'
                    }`} 
                  />
                </motion.div>
                {item.label}
              </Link>
            )
          })}
        </div>

        {/* Divider */}
        <div className="my-4 border-t border-gray-200 dark:border-gray-700" />

        {/* Library section */}
        <div className="space-y-1">
          <h3 className="px-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
            Library
          </h3>
          {libraryItems.map((item) => {
            const Icon = item.icon
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={onClose}
                className={`flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200 group ${
                  isActive(item.path)
                    ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-gray-100'
                }`}
              >
                <motion.div
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Icon 
                    size={20} 
                    className={`mr-3 ${
                      isActive(item.path) 
                        ? 'text-red-600 dark:text-red-400' 
                        : 'text-gray-500 dark:text-gray-400 group-hover:text-gray-700 dark:group-hover:text-gray-200'
                    }`} 
                  />
                </motion.div>
                {item.label}
              </Link>
            )
          })}
        </div>

        {/* Divider */}
        <div className="my-4 border-t border-gray-200 dark:border-gray-700" />

        {/* User section */}
        {user && (
          <div className="space-y-1">
            <h3 className="px-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Account
            </h3>
            <Link
              to="/channel/me"
              onClick={onClose}
              className="flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200 group text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-gray-100"
            >
              <motion.div
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
              >
                <User 
                  size={20} 
                  className="mr-3 text-gray-500 dark:text-gray-400 group-hover:text-gray-700 dark:group-hover:text-gray-200" 
                />
              </motion.div>
              Your channel
            </Link>
            <Link
              to="/settings"
              onClick={onClose}
              className="flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200 group text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-gray-100"
            >
              <motion.div
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
              >
                <Settings 
                  size={20} 
                  className="mr-3 text-gray-500 dark:text-gray-400 group-hover:text-gray-700 dark:group-hover:text-gray-200" 
                />
              </motion.div>
              Settings
            </Link>
            <button
              onClick={handleLogout}
              className="flex items-center w-full px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200 group text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-gray-100"
            >
              <motion.div
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
              >
                <LogOut 
                  size={20} 
                  className="mr-3 text-gray-500 dark:text-gray-400 group-hover:text-gray-700 dark:group-hover:text-gray-200" 
                />
              </motion.div>
              Sign out
            </button>
          </div>
        )}
      </nav>

      {/* User info at bottom */}
      {user && (
        <div className="p-4 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-3">
            <img
              src={user.avatar}
              alt={user.fullname}
              className="w-8 h-8 rounded-full object-cover"
            />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                {user.fullname}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                @{user.username}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Sidebar
