import { useState, useEffect, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '../../contexts/AuthContext'
import NotificationBell from '../NotificationBell'
import VoiceSearchModal from '../VoiceSearchModal'
import toast from 'react-hot-toast'
import {
  Menu,
  Search,
  Mic,
  Bell,
  User,
  Upload,
  Settings,
  LogOut,
  Sun,
  Moon,
  Video,
  BarChart3,
  History,
  ChevronDown,
  ArrowLeft
} from 'lucide-react'

const Header = ({ onMenuClick }) => {
  const [searchQuery, setSearchQuery] = useState('')
  const [showUserMenu, setShowUserMenu] = useState(false)
  const [showCreateMenu, setShowCreateMenu] = useState(false)
  const [showMobileSearch, setShowMobileSearch] = useState(false)
  const [isDarkMode, setIsDarkMode] = useState(false)
  const [isListening, setIsListening] = useState(false)
  const [showVoiceModal, setShowVoiceModal] = useState(false)
  const [voiceTranscript, setVoiceTranscript] = useState('')
  const { user, isAuthenticated, logout } = useAuth()
  const navigate = useNavigate()
  const userMenuRef = useRef(null)
  const createMenuRef = useRef(null)
  const mobileSearchRef = useRef(null)
  const recognitionRef = useRef(null)

  // Initialize voice recognition
  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
      recognitionRef.current = new SpeechRecognition()
      recognitionRef.current.continuous = false
      recognitionRef.current.interimResults = false
      recognitionRef.current.lang = 'en-US'

      recognitionRef.current.onresult = (event) => {
        const transcript = event.results[0][0].transcript
        setVoiceTranscript(transcript)
        setSearchQuery(transcript)
        setIsListening(false)
        
        // Show transcript for a moment
        setTimeout(() => {
          toast.success(`Searching for: "${transcript}"`)
          setShowVoiceModal(false)
          setVoiceTranscript('')
          navigate(`/search?q=${encodeURIComponent(transcript.trim())}`)
        }, 1500)
      }

      recognitionRef.current.onerror = (event) => {
        console.error('Speech recognition error:', event.error)
        setIsListening(false)
        setShowVoiceModal(false)
        setVoiceTranscript('')
        
        if (event.error === 'not-allowed') {
          toast.error('Microphone access denied. Please allow microphone permissions.')
        } else if (event.error === 'no-speech') {
          toast.error('No speech detected. Please try again.')
        } else {
          toast.error('Voice search failed. Please try again.')
        }
      }

      recognitionRef.current.onend = () => {
        setIsListening(false)
        // Don't close modal immediately, wait for navigation
      }
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop()
      }
    }
  }, [navigate])

  // Close menus when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setShowUserMenu(false)
      }
      if (createMenuRef.current && !createMenuRef.current.contains(event.target)) {
        setShowCreateMenu(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleSearch = (e) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`)
      setShowMobileSearch(false)
      setSearchQuery('')
    }
  }

  const handleVoiceSearch = () => {
    if (!('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
      toast.error('Voice search is not supported in your browser. Please use Chrome, Edge, or Safari.')
      return
    }

    // Open modal and start listening
    setShowVoiceModal(true)
    setVoiceTranscript('')
    
    // Small delay to show modal animation before starting recognition
    setTimeout(() => {
      try {
        recognitionRef.current?.start()
        setIsListening(true)
      } catch (error) {
        console.error('Error starting voice recognition:', error)
        toast.error('Failed to start voice search')
        setShowVoiceModal(false)
      }
    }, 300)
  }

  const handleCloseVoiceModal = () => {
    if (isListening) {
      recognitionRef.current?.stop()
      setIsListening(false)
    }
    setShowVoiceModal(false)
    setVoiceTranscript('')
  }

  const handleLogout = async () => {
    await logout()
    setShowUserMenu(false)
    navigate('/')
  }

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode)
    // Toggle dark mode class on document
    document.documentElement.classList.toggle('dark')
  }

  return (
    <>
      {/* Voice Search Modal */}
      <VoiceSearchModal
        isOpen={showVoiceModal}
        isListening={isListening}
        transcript={voiceTranscript}
        onClose={handleCloseVoiceModal}
      />

      {/* Mobile Search Overlay */}
      <AnimatePresence>
        {showMobileSearch && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-white dark:bg-gray-900 md:hidden"
          >
            <div className="flex items-center px-2 py-3 border-b border-gray-200 dark:border-gray-700">
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowMobileSearch(false)}
                className="p-2 mr-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                <ArrowLeft size={20} className="text-gray-700 dark:text-gray-300" />
              </motion.button>
              <form onSubmit={handleSearch} className="flex-1 flex">
                <input
                  ref={mobileSearchRef}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search videos..."
                  autoFocus
                  className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-l-full bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-red-500 focus:border-transparent transition-colors"
                />
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  type="submit"
                  className="px-4 py-2 bg-red-600 border border-l-0 border-red-600 hover:bg-red-700 transition-colors"
                >
                  <Search size={20} className="text-white" />
                </motion.button>
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  type="button"
                  onClick={handleVoiceSearch}
                  className={`px-4 py-2 border border-l-0 transition-all duration-200 rounded-r-full ${
                    isListening 
                      ? 'bg-red-600 hover:bg-red-700 animate-pulse border-red-600' 
                      : 'bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 border-gray-300 dark:border-gray-600'
                  }`}
                  title={isListening ? 'Listening...' : 'Voice search'}
                >
                  <Mic size={20} className={isListening ? 'text-white' : 'text-gray-600 dark:text-gray-400'} />
                </motion.button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <header className="sticky top-0 z-40 glass backdrop-blur-xl border-b border-gray-200/50 dark:border-gray-800/50 shadow-sm w-full">
        <div className="flex items-center justify-between px-2 sm:px-4 py-2 sm:py-3 w-full">
          <div className="flex items-center space-x-2 sm:space-x-4">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onMenuClick}
              className="p-2 sm:p-2.5 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-200 lg:hidden"
            >
              <Menu size={20} className="text-gray-700 dark:text-gray-300" />
            </motion.button>

            <Link to="/" className="flex items-center space-x-2 sm:space-x-3">
              <motion.div
                whileHover={{ rotate: 360, scale: 1.1 }}
                transition={{ duration: 0.6, type: "spring" }}
                className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-red-600 via-pink-600 to-purple-600 rounded-xl sm:rounded-2xl flex items-center justify-center shadow-lg"
              >
                <span className="text-white font-black text-sm sm:text-lg">BZ</span>
              </motion.div>
              <span className="text-xl sm:text-2xl font-black text-gradient hidden md:block">
                BuzzTube
              </span>
            </Link>
          </div>

          {/* Center section - Search (hidden on mobile) */}
          <div className="hidden md:flex flex-1 max-w-2xl mx-4">
            <form onSubmit={handleSearch} className="relative w-full">
              <div className="flex">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search"
                  className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-l-full bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-red-500 focus:border-transparent transition-colors"
                />
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  className="px-6 py-2 bg-gray-100 dark:bg-gray-700 border border-l-0 border-gray-300 dark:border-gray-600 rounded-r-full hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                >
                  <Search size={20} className="text-gray-600 dark:text-gray-400" />
                </motion.button>
              </div>
            </form>
          </div>

          {/* Right section */}
          <div className="flex items-center space-x-1 sm:space-x-2">
            {/* Search icon for mobile */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowMobileSearch(true)}
              className="md:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              <Search size={20} className="text-gray-600 dark:text-gray-400" />
            </motion.button>

            {/* Dark mode toggle */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={toggleDarkMode}
              className="hidden sm:block p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              {isDarkMode ? (
                <Sun size={20} className="text-gray-600 dark:text-gray-400" />
              ) : (
                <Moon size={20} className="text-gray-600 dark:text-gray-400" />
              )}
            </motion.button>

            {/* Voice search - hidden on mobile */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleVoiceSearch}
              className={`hidden sm:block p-2 rounded-lg transition-all duration-200 ${
                isListening 
                  ? 'bg-red-600 hover:bg-red-700 animate-pulse' 
                  : 'hover:bg-gray-100 dark:hover:bg-gray-800'
              }`}
              title={isListening ? 'Listening... Click to stop' : 'Click to search by voice'}
            >
              <Mic 
                size={20} 
                className={isListening ? 'text-white' : 'text-gray-600 dark:text-gray-400'} 
              />
            </motion.button>

            {/* Notifications */}
            {isAuthenticated && <NotificationBell />}

            {/* Create menu */}
            {isAuthenticated && (
              <div className="relative" ref={createMenuRef}>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowCreateMenu(!showCreateMenu)}
                  className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors flex items-center gap-1"
                >
                  <Upload size={20} className="text-gray-600 dark:text-gray-400" />
                </motion.button>

                <AnimatePresence>
                  {showCreateMenu && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="fixed md:absolute left-2 right-2 md:left-auto md:right-0 top-[60px] md:top-auto md:mt-2 w-auto md:w-56 bg-white dark:bg-gray-800 rounded-lg shadow-2xl border border-gray-200 dark:border-gray-700 py-2 z-[60]"
                    >
                      <Link
                        to="/upload"
                        className="flex items-center px-4 py-3 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                        onClick={() => setShowCreateMenu(false)}
                      >
                        <Upload size={18} className="mr-3" />
                        Upload video
                      </Link>
                      <Link
                        to="/my-videos"
                        className="flex items-center px-4 py-3 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                        onClick={() => setShowCreateMenu(false)}
                      >
                        <Video size={18} className="mr-3" />
                        My videos
                      </Link>
                      <Link
                        to="/dashboard"
                        className="flex items-center px-4 py-3 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                        onClick={() => setShowCreateMenu(false)}
                      >
                        <BarChart3 size={18} className="mr-3" />
                        Analytics
                      </Link>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}

            {/* User menu */}
            {isAuthenticated ? (
              <div className="relative" ref={userMenuRef}>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center space-x-1 sm:space-x-2 p-0.5 sm:p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                >
                  <img
                    src={user?.avatar}
                    alt={user?.fullname}
                    className="w-7 h-7 sm:w-8 sm:h-8 rounded-full object-cover border-2 border-gray-200 dark:border-gray-700"
                  />
                  <ChevronDown size={16} className="text-gray-600 dark:text-gray-400 hidden sm:block" />
                </motion.button>

                {/* User dropdown menu */}
                <AnimatePresence>
                  {showUserMenu && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="fixed md:absolute left-2 right-2 md:left-auto md:right-0 top-[60px] md:top-auto md:mt-2 w-auto md:w-64 bg-white dark:bg-gray-800 rounded-lg shadow-2xl border border-gray-200 dark:border-gray-700 py-2 z-[60]"
                    >
                      <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
                        <div className="flex items-center space-x-3">
                          <img
                            src={user?.avatar}
                            alt={user?.fullname}
                            className="w-10 h-10 rounded-full object-cover"
                          />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 truncate">
                              {user?.fullname}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                              @{user?.username}
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className="py-1">
                        <Link
                          to="/channel/me"
                          className="flex items-center px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                          onClick={() => setShowUserMenu(false)}
                        >
                          <User size={18} className="mr-3" />
                          Your channel
                        </Link>
                        <Link
                          to="/dashboard"
                          className="flex items-center px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                          onClick={() => setShowUserMenu(false)}
                        >
                          <BarChart3 size={18} className="mr-3" />
                          Dashboard
                        </Link>
                        <Link
                          to="/history"
                          className="flex items-center px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                          onClick={() => setShowUserMenu(false)}
                        >
                          <History size={18} className="mr-3" />
                          Watch history
                        </Link>
                      </div>
                      <div className="border-t border-gray-200 dark:border-gray-700 py-1">
                        <Link
                          to="/settings"
                          className="flex items-center px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                          onClick={() => setShowUserMenu(false)}
                        >
                          <Settings size={18} className="mr-3" />
                          Settings
                        </Link>
                        <button
                          onClick={handleLogout}
                          className="flex items-center w-full px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                        >
                          <LogOut size={18} className="mr-3" />
                          Sign out
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <div className="flex items-center space-x-1 sm:space-x-2">
                <Link
                  to="/login"
                  className="hidden sm:block px-3 sm:px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
                >
                  Sign in
                </Link>
                <Link
                  to="/register"
                  className="px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-medium bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  Sign up
                </Link>
              </div>
            )}
          </div>
        </div>
      </header>
    </>
  )
}

export default Header
