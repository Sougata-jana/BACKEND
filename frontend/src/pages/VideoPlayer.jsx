import { useState, useEffect, useRef } from 'react'
import { useParams, Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { api } from '../utils/api'
import { ThumbsUp, ThumbsDown, Share2, Facebook, Twitter, Instagram, Link as LinkIcon, Copy, X, PencilLine, Play, Pause, Volume2, VolumeX, Maximize, Minimize, Settings, Gauge, Bookmark } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import toast from 'react-hot-toast'
import BookmarkModal from '../components/BookmarkModal'
import BookmarkList from '../components/BookmarkList'

const VideoPlayer = () => {
  const { videoId } = useParams()
  const [video, setVideo] = useState(null)
  const [loading, setLoading] = useState(true)
  const [likeBusy, setLikeBusy] = useState(false)
  const [likeCount, setLikeCount] = useState(0)
  const [dislikeCount, setDislikeCount] = useState(0)
  const [isLiked, setIsLiked] = useState(false)
  const [isDisliked, setIsDisliked] = useState(false)
  const [editOpen, setEditOpen] = useState(false)
  const [shareOpen, setShareOpen] = useState(false)
  const [editTitle, setEditTitle] = useState('')
  const [editDescription, setEditDescription] = useState('')
  const { user, isAuthenticated, requireAuth } = useAuth()
  const [comments, setComments] = useState([])
  const [cPage, setCPage] = useState(1)
  const [cHasMore, setCHasMore] = useState(true)
  const [cBusy, setCBusy] = useState(false)
  const [newComment, setNewComment] = useState('')
  const [editingCommentId, setEditingCommentId] = useState(null)
  const [editingContent, setEditingContent] = useState('')
  const [isSubscribed, setIsSubscribed] = useState(false)
  const [subBusy, setSubBusy] = useState(false)
  const videoRef = useRef(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [volume, setVolume] = useState(1)
  const [isMuted, setIsMuted] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [playbackRate, setPlaybackRate] = useState(1)
  const [showSpeedMenu, setShowSpeedMenu] = useState(false)
  const [showQualityMenu, setShowQualityMenu] = useState(false)
  const [selectedQuality, setSelectedQuality] = useState('auto')
  
  // Bookmark states
  const [bookmarks, setBookmarks] = useState([])
  const [showBookmarkModal, setShowBookmarkModal] = useState(false)
  const [showBookmarks, setShowBookmarks] = useState(false)

  useEffect(() => {
    fetchVideo()
  }, [videoId])

  const fetchVideo = async () => {
    try {
      setLoading(true)
      const response = await api.get(`/videos/${videoId}`)
      const videoData = response.data.data
      setVideo(videoData)
      setLikeCount(videoData.likeCount || 0)
      setDislikeCount(videoData.dislikeCount || 0)
      setIsLiked(videoData.isLiked || false)
      setIsDisliked(videoData.isDisliked || false)
      if (videoData.owner?._id && user?._id) {
        try {
          const subRes = await api.get(`/user/c/${videoData.owner.username}`)
          setIsSubscribed(subRes.data.data.isSubscribed || false)
        } catch (err) {
          console.warn('Subscription check failed', err)
        }
      }
    } catch (error) {
      console.error('Error fetching video:', error)
      toast.error('Failed to load video')
    } finally {
      setLoading(false)
    }
  }

  const fetchComments = async (page = 1) => {
    if (!videoId) return
    try {
      setCBusy(true)
      const { data } = await api.get(`/comments/${videoId}`, { params: { page, limit: 10 } })
      const resp = data.data
      if (page === 1) {
        setComments(resp.docs || [])
      } else {
        setComments((prev) => [...prev, ...(resp.docs || [])])
      }
      setCPage(resp.page || page)
      setCHasMore((resp.page || page) < (resp.totalPages || 1))
    } catch (err) {
      console.error('Comments fetch failed', err)
      toast.error('Failed to load comments')
    } finally {
      setCBusy(false)
    }
  }

  useEffect(() => {
    if (videoId) {
      fetchComments(1)
      fetchBookmarks()
    }
  }, [videoId])

  // Fetch bookmarks for this video
  const fetchBookmarks = async () => {
    if (!videoId || !isAuthenticated) return
    try {
      const { data } = await api.get(`/bookmarks/video/${videoId}`)
      setBookmarks(data.data || [])
    } catch (err) {
      console.error('Failed to fetch bookmarks:', err)
    }
  }

  // Save a new bookmark
  const handleSaveBookmark = async (bookmarkData) => {
    try {
      const { data } = await api.post(`/bookmarks/video/${videoId}`, bookmarkData)
      setBookmarks(prev => [...prev, data.data].sort((a, b) => a.timestamp - b.timestamp))
      toast.success('Bookmark saved!')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save bookmark')
    }
  }

  // Delete a bookmark
  const handleDeleteBookmark = async (bookmarkId) => {
    try {
      await api.delete(`/bookmarks/${bookmarkId}`)
      setBookmarks(prev => prev.filter(b => b._id !== bookmarkId))
      toast.success('Bookmark deleted')
    } catch (err) {
      toast.error('Failed to delete bookmark')
    }
  }

  // Jump to bookmark timestamp
  const handleJumpToBookmark = (timestamp) => {
    if (videoRef.current) {
      videoRef.current.currentTime = timestamp
      videoRef.current.play()
      setShowBookmarks(false)
    }
  }

  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    const updateTime = () => setCurrentTime(video.currentTime)
    const updateDuration = () => setDuration(video.duration)
    const handlePlay = () => setIsPlaying(true)
    const handlePause = () => setIsPlaying(false)
    const handleEnded = () => setIsPlaying(false)
    const handleFullscreenChange = () => setIsFullscreen(!!document.fullscreenElement)

    video.addEventListener('timeupdate', updateTime)
    video.addEventListener('loadedmetadata', updateDuration)
    video.addEventListener('play', handlePlay)
    video.addEventListener('pause', handlePause)
    video.addEventListener('ended', handleEnded)
    document.addEventListener('fullscreenchange', handleFullscreenChange)

    return () => {
      video.removeEventListener('timeupdate', updateTime)
      video.removeEventListener('loadedmetadata', updateDuration)
      video.removeEventListener('play', handlePlay)
      video.removeEventListener('pause', handlePause)
      video.removeEventListener('ended', handleEnded)
      document.removeEventListener('fullscreenchange', handleFullscreenChange)
    }
  }, [video])

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause()
      } else {
        videoRef.current.play()
      }
    }
  }

  const handleVolumeChange = (e) => {
    const newVolume = parseFloat(e.target.value)
    setVolume(newVolume)
    if (videoRef.current) {
      videoRef.current.volume = newVolume
      setIsMuted(newVolume === 0)
    }
  }

  const toggleMute = () => {
    if (videoRef.current) {
      if (isMuted) {
        videoRef.current.volume = volume || 0.5
        setIsMuted(false)
      } else {
        videoRef.current.volume = 0
        setIsMuted(true)
      }
    }
  }

  const handleSeek = (e) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const percent = (e.clientX - rect.left) / rect.width
    if (videoRef.current) {
      videoRef.current.currentTime = percent * duration
    }
  }

  const toggleFullscreen = () => {
    if (!videoRef.current) return
    if (!isFullscreen) {
      if (videoRef.current.requestFullscreen) {
        videoRef.current.requestFullscreen()
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen()
      }
    }
  }

  const formatTime = (seconds) => {
    if (!seconds || isNaN(seconds)) return '0:00'
    const hrs = Math.floor(seconds / 3600)
    const mins = Math.floor((seconds % 3600) / 60)
    const secs = Math.floor(seconds % 60)
    if (hrs > 0) {
      return `${hrs}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
    }
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const changePlaybackRate = (rate) => {
    if (videoRef.current) {
      videoRef.current.playbackRate = rate
      setPlaybackRate(rate)
      setShowSpeedMenu(false)
    }
  }

  const speedOptions = [0.25, 0.5, 0.75, 1, 1.25, 1.5, 1.75, 2]
  const qualityOptions = ['auto', '1080p', '720p', '480p', '360p', '240p']

  const onToggleLike = () => {
    requireAuth(async () => {
      if (!video) return
      try {
        setLikeBusy(true)
        const { data } = await api.post(`/likes/toggle/v/${video._id}`)
        setIsLiked(data.data.isLiked)
        setIsDisliked(false)
        setLikeCount(data.data.likeCount || 0)
        setDislikeCount(data.data.dislikeCount || 0)
        toast.success(data.data.isLiked ? 'Liked' : 'Unliked')
      } catch (err) {
        const msg = err.response?.data?.message || 'Failed to toggle like'
        toast.error(msg)
      } finally {
        setLikeBusy(false)
      }
    })
  }

  const onToggleDislike = () => {
    requireAuth(async () => {
      if (!video) return
      try {
        setLikeBusy(true)
        const { data } = await api.post(`/likes/toggle/dislike/v/${video._id}`)
        setIsDisliked(data.data.isDisliked)
        setIsLiked(false)
        setLikeCount(data.data.likeCount || 0)
        setDislikeCount(data.data.dislikeCount || 0)
        toast.success(data.data.isDisliked ? 'Disliked' : 'Removed dislike')
      } catch (err) {
        const msg = err.response?.data?.message || 'Failed to toggle dislike'
        toast.error(msg)
      } finally {
        setLikeBusy(false)
      }
    })
  }

  const onToggleSubscribe = async () => {
    if (!video?.owner?._id) return
    requireAuth(async () => {
      try {
        setSubBusy(true)
        await api.post(`/subscriptions/toggle/${video.owner._id}`)
        setIsSubscribed((prev) => !prev)
        toast.success(isSubscribed ? 'Unsubscribed' : 'Subscribed')
      } catch (err) {
        const msg = err.response?.data?.message || 'Subscription failed'
        toast.error(msg)
      } finally {
        setSubBusy(false)
      }
    })
  }

  const onShare = () => {
    setShareOpen(true)
  }

  const shareUrl = typeof window !== 'undefined' ? window.location.href : ''
  const shareTitle = video?.title || 'Check out this video on BuzzTube'

  const shareToFacebook = () => {
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`, '_blank')
  }

  const shareToTwitter = () => {
    window.open(`https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareTitle)}`, '_blank')
  }

  const shareToWhatsApp = () => {
    window.open(`https://wa.me/?text=${encodeURIComponent(shareTitle + ' ' + shareUrl)}`, '_blank')
  }

  const shareToInstagram = () => {
    toast.info('Copy the link and paste it in your Instagram story or post')
    navigator.clipboard.writeText(shareUrl)
  }

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl)
      toast.success('Link copied to clipboard!')
      setShareOpen(false)
    } catch (err) {
      toast.error('Failed to copy link')
    }
  }

  const openEdit = () => {
    if (!video) return
    setEditTitle(video.title || '')
    setEditDescription(video.description || '')
    setEditOpen(true)
  }

  const onSubmitEdit = (e) => {
    e.preventDefault()
    requireAuth(async () => {
      try {
        const payload = { title: editTitle, description: editDescription }
        const { data } = await api.patch(`/videos/${video._id}`, payload)
        setVideo((prev) => ({ ...prev, ...data.data }))
        toast.success('Video updated')
        setEditOpen(false)
      } catch (err) {
        const msg = err.response?.data?.message || 'Update failed'
        toast.error(msg)
      }
    })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-12 h-12 border-4 border-gray-200 dark:border-gray-700 border-t-red-600 rounded-full animate-spin"></div>
      </div>
    )
  }

  if (!video) {
    return (
      <div className="text-center py-16">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">
          Video not found
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          The video you're looking for doesn't exist or has been removed.
        </p>
      </div>
    )
  }

  const isOwnChannel = user?._id && video.owner?._id && user._id === video.owner._id

  return (
    <div className="max-w-7xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="space-y-6"
      >
        <div className="relative aspect-video bg-black rounded-lg overflow-hidden shadow-lg group">
          <video
            ref={videoRef}
            src={video.videoFile}
            poster={video.thumbnail}
            className="w-full h-full cursor-pointer"
            onClick={togglePlay}
            onError={(e) => {
              console.error('Video error:', e)
              toast.error('Failed to load video. Please check the video URL or format.')
            }}
            playsInline
            preload="metadata"
          />

          {!isPlaying && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/40 cursor-pointer" onClick={togglePlay}>
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                className="w-24 h-24 bg-red-600 rounded-full flex items-center justify-center text-white shadow-2xl border-4 border-white/20"
              >
                <Play size={48} className="ml-2 fill-white" />
              </motion.div>
            </div>
          )}

          {isPlaying && (
            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/20 cursor-pointer" onClick={togglePlay}>
              <motion.button
                whileHover={{ scale: 1.15 }}
                whileTap={{ scale: 0.95 }}
                className="w-20 h-20 bg-black/80 rounded-full flex items-center justify-center text-white shadow-2xl border-2 border-white/30"
              >
                <Pause size={36} />
              </motion.button>
            </div>
          )}

          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/95 via-black/80 to-transparent p-4 opacity-0 group-hover:opacity-100 transition-all duration-300">
            <div className="flex items-center gap-3 mb-3">
              <motion.button
                whileHover={{ scale: 1.15 }}
                whileTap={{ scale: 0.9 }}
                onClick={(e) => {
                  e.stopPropagation()
                  togglePlay()
                }}
                className="text-white hover:text-red-400 transition-colors p-2 hover:bg-white/10 rounded-full"
              >
                {isPlaying ? <Pause size={24} /> : <Play size={24} />}
              </motion.button>

              <div
                className="flex-1 relative h-2 bg-white/20 rounded-full cursor-pointer group/seek hover:h-2.5 transition-all"
                onClick={(e) => {
                  e.stopPropagation()
                  handleSeek(e)
                }}
              >
                <div
                  className="absolute top-0 left-0 h-full bg-red-600 rounded-full transition-all"
                  style={{ width: `${duration ? (currentTime / duration) * 100 : 0}%` }}
                />
                <div
                  className="absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-red-600 rounded-full -ml-2 opacity-0 group-hover/seek:opacity-100 transition-opacity shadow-lg border-2 border-white"
                  style={{ left: `${duration ? (currentTime / duration) * 100 : 0}%` }}
                />
              </div>

              <span className="text-white text-sm font-medium min-w-[110px] text-right">{formatTime(currentTime)} / {formatTime(duration)}</span>

              <motion.button
                whileHover={{ scale: 1.15 }}
                whileTap={{ scale: 0.9 }}
                onClick={(e) => {
                  e.stopPropagation()
                  toggleMute()
                }}
                className="text-white hover:text-red-400 transition-colors p-2 hover:bg-white/10 rounded-full"
              >
                {isMuted ? <VolumeX size={24} /> : <Volume2 size={24} />}
              </motion.button>

              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={isMuted ? 0 : volume}
                onChange={handleVolumeChange}
                onClick={(e) => e.stopPropagation()}
                className="w-24 h-2 cursor-pointer accent-red-600"
                style={{
                  background: `linear-gradient(to right, #ef4444 0%, #ef4444 ${(isMuted ? 0 : volume) * 100}%, rgba(255,255,255,0.3) ${(isMuted ? 0 : volume) * 100}%, rgba(255,255,255,0.3) 100%)`
                }}
              />

              <div className="relative">
                <motion.button
                  whileHover={{ scale: 1.15 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={(e) => {
                    e.stopPropagation()
                    setShowSpeedMenu(!showSpeedMenu)
                    setShowQualityMenu(false)
                  }}
                  className="text-white hover:text-red-400 transition-colors flex items-center gap-1.5 px-3 py-2 hover:bg-white/10 rounded-lg"
                >
                  <Gauge size={22} />
                  <span className="text-sm font-medium">{playbackRate}x</span>
                </motion.button>
                {showSpeedMenu && (
                  <div className="absolute bottom-full right-0 mb-2 bg-black/95 rounded-lg py-2 min-w-[140px] z-50 shadow-2xl border border-white/20">
                    <div className="px-3 py-2 border-b border-white/20 mb-1">
                      <p className="text-xs font-semibold text-white/80 uppercase">Playback Speed</p>
                    </div>
                    {speedOptions.map((speed) => (
                      <button
                        key={speed}
                        onClick={(e) => {
                          e.stopPropagation()
                          changePlaybackRate(speed)
                        }}
                        className={`w-full px-4 py-2.5 text-left text-sm hover:bg-white/20 transition-colors flex items-center justify-between ${
                          playbackRate === speed ? 'text-red-400 font-bold bg-white/10' : 'text-white'
                        }`}
                      >
                        <span>{speed}x {speed === 1 && '(Normal)'}</span>
                        {playbackRate === speed && <span className="text-red-400">✓</span>}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div className="relative">
                <motion.button
                  whileHover={{ scale: 1.15 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={(e) => {
                    e.stopPropagation()
                    setShowQualityMenu(!showQualityMenu)
                    setShowSpeedMenu(false)
                  }}
                  className="text-white hover:text-red-400 transition-colors flex items-center gap-1.5 px-3 py-2 hover:bg-white/10 rounded-lg"
                >
                  <Settings size={22} />
                  <span className="text-sm font-medium">{selectedQuality}</span>
                </motion.button>
                {showQualityMenu && (
                  <div className="absolute bottom-full right-0 mb-2 bg-black/95 rounded-lg py-2 min-w-[140px] z-50 shadow-2xl border border-white/20">
                    <div className="px-3 py-2 border-b border-white/20 mb-1">
                      <p className="text-xs font-semibold text-white/80 uppercase">Quality</p>
                    </div>
                    {qualityOptions.map((quality) => (
                      <button
                        key={quality}
                        onClick={(e) => {
                          e.stopPropagation()
                          setSelectedQuality(quality)
                          setShowQualityMenu(false)
                        }}
                        className={`w-full px-4 py-2.5 text-left text-sm hover:bg-white/20 transition-colors flex items-center justify-between ${
                          selectedQuality === quality ? 'text-red-400 font-bold bg-white/10' : 'text-white'
                        }`}
                      >
                        <span>{quality}</span>
                        {selectedQuality === quality && <span className="text-red-400">✓</span>}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <motion.button
                whileHover={{ scale: 1.15 }}
                whileTap={{ scale: 0.9 }}
                onClick={(e) => {
                  e.stopPropagation()
                  toggleFullscreen()
                }}
                className="text-white hover:text-red-400 transition-colors p-2 hover:bg-white/10 rounded-full"
              >
                {isFullscreen ? <Minimize size={24} /> : <Maximize size={24} />}
              </motion.button>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              {video.title}
            </h1>
            <div className="flex items-center gap-2 sm:self-auto self-start flex-wrap">
              {isAuthenticated && isOwnChannel && (
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={openEdit}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 hover:bg-gray-100 dark:hover:bg-gray-800 text-sm"
                >
                  <PencilLine size={18} />
                  Edit
                </motion.button>
              )}
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={onShare}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gray-900 text-white dark:bg-white dark:text-gray-900 hover:opacity-90 text-sm"
              >
                <Share2 size={18} />
                Share
              </motion.button>
              {isAuthenticated && (
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => setShowBookmarkModal(true)}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-blue-500 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 text-sm"
                  title="Bookmark this moment"
                >
                  <Bookmark size={18} />
                  Bookmark
                </motion.button>
              )}
              <motion.button
                whileHover={{ scale: likeBusy ? 1 : 1.03 }}
                whileTap={{ scale: likeBusy ? 1 : 0.97 }}
                disabled={likeBusy}
                onClick={onToggleLike}
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm ${isLiked ? 'bg-red-600 text-white hover:bg-red-700' : 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100 hover:bg-gray-200 dark:hover:bg-gray-700'}`}
              >
                <ThumbsUp size={18} />
                {likeCount.toLocaleString()}
              </motion.button>
              <motion.button
                whileHover={{ scale: likeBusy ? 1 : 1.03 }}
                whileTap={{ scale: likeBusy ? 1 : 0.97 }}
                disabled={likeBusy}
                onClick={onToggleDislike}
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm ${
                  isDisliked
                    ? 'bg-gray-600 text-white hover:bg-gray-700'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100 hover:bg-gray-200 dark:hover:bg-gray-700'
                }`}
              >
                <ThumbsDown size={18} />
                {dislikeCount > 0 && dislikeCount.toLocaleString()}
              </motion.button>
            </div>
          </div>

          <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400">
            <span>{(video.views || 0).toLocaleString()} views</span>
            <span>•</span>
            <span>{new Date(video.createdAt).toLocaleDateString()}</span>
          </div>

          <div className="flex items-start space-x-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <Link to={`/channel/${video.owner?.username}`}>
              <img
                src={video.owner?.avatar}
                alt={video.owner?.fullname}
                className="w-12 h-12 rounded-full object-cover cursor-pointer hover:ring-2 ring-red-500 transition-all"
              />
            </Link>
            <div className="flex-1">
              <Link to={`/channel/${video.owner?.username}`}>
                <h3 className="font-semibold text-gray-900 dark:text-gray-100 hover:text-red-600 dark:hover:text-red-400">
                  {video.owner?.fullname}
                </h3>
              </Link>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                @{video.owner?.username}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                {video.description}
              </p>
            </div>
            {isAuthenticated ? (
              isOwnChannel ? (
                <span className="px-6 py-2 rounded-full text-sm bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 border">
                  Your channel
                </span>
              ) : (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={onToggleSubscribe}
                  disabled={subBusy}
                  className={`px-6 py-2 rounded-full font-medium transition-colors ${isSubscribed ? 'bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-100' : 'bg-red-600 text-white hover:bg-red-700'}`}
                >
                  {subBusy ? 'Loading...' : isSubscribed ? 'Subscribed' : 'Subscribe'}
                </motion.button>
              )
            ) : (
              <Link
                to="/login"
                className="px-6 py-2 bg-red-600 text-white rounded-full hover:bg-red-700 transition-colors font-medium"
              >
                Sign in to subscribe
              </Link>
            )}
          </div>

          <div className="mt-6">
            <h3 className="text-lg font-semibold mb-3 text-gray-900 dark:text-gray-100">
              Comments {comments.length > 0 && `(${comments.length})`}
            </h3>
            <div className="mb-4">
              {isAuthenticated ? (
                <form
                  onSubmit={(e) => {
                    e.preventDefault()
                    if (!newComment.trim()) return
                    requireAuth(async () => {
                      try {
                        const { data } = await api.post(`/comments/${video._id}`, { content: newComment.trim() })
                        setComments((prev) => [data.data, ...prev])
                        setNewComment('')
                        toast.success('Comment added')
                      } catch (err) {
                        const msg = err.response?.data?.message || 'Failed to add comment'
                        toast.error(msg)
                      }
                    })
                  }}
                  className="flex items-start gap-3"
                >
                  <img src={user?.avatar} alt={user?.fullname} className="w-10 h-10 rounded-full object-cover" />
                  <div className="flex-1">
                    <textarea
                      className="w-full rounded-md border text-black border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2 min-h-[70px] outline-none focus:ring-2 focus:ring-red-500"
                      placeholder="Add a public comment..."
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                    />
                    <div className="mt-2 flex items-center justify-end gap-2">
                      <button type="button" onClick={() => setNewComment('')} className="px-4 py-1.5 rounded-md border border-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800">
                        Cancel
                      </button>
                      <button type="submit" className="px-4 py-1.5 rounded-md bg-red-600 text-white hover:bg-red-700">
                        Comment
                      </button>
                    </div>
                  </div>
                </form>
              ) : (
                <div className="text-sm text-gray-600 dark:text-gray-300 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <Link to="/login" className="text-red-600 dark:text-red-400 hover:underline">
                    Sign in
                  </Link>
                  {' '}to comment.
                </div>
              )}
            </div>

            <div className="space-y-4">
              {comments.length === 0 && !cBusy && (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  No comments yet. Be the first to comment!
                </div>
              )}
              {comments.map((c) => (
                <div key={c._id} className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                  <Link to={`/channel/${c.owner?.username}`}>
                    <img
                      src={c.owner?.avatar || '/default-avatar.png'}
                      alt={c.owner?.fullname || 'User'}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                  </Link>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 text-sm mb-1">
                      <Link to={`/channel/${c.owner?.username}`}>
                        <span className="font-medium text-gray-900 dark:text-gray-100 hover:text-red-600 dark:hover:text-red-400">
                          {c.owner?.fullname || 'Unknown User'}
                        </span>
                      </Link>
                      <span className="text-gray-500 dark:text-gray-400">
                        @{c.owner?.username || 'unknown'}
                      </span>
                      <span className="text-gray-400 dark:text-gray-500 text-xs">
                        {new Date(c.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    {editingCommentId === c._id ? (
                      <form
                        onSubmit={(e) => {
                          e.preventDefault()
                          requireAuth(async () => {
                            try {
                              const { data } = await api.patch(`/comments/c/${c._id}`, { content: editingContent })
                              setComments((prev) => prev.map((x) => (x._id === c._id ? { ...x, content: data.data.content } : x)))
                              setEditingCommentId(null)
                              setEditingContent('')
                              toast.success('Comment updated')
                            } catch (err) {
                              const msg = err.response?.data?.message || 'Update failed'
                              toast.error(msg)
                            }
                          })
                        }}
                        className="mt-1"
                      >
                        <textarea
                          className="w-full rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2 min-h-[70px] outline-none focus:ring-2 focus:ring-red-500"
                          value={editingContent}
                          onChange={(e) => setEditingContent(e.target.value)}
                          required
                        />
                        <div className="mt-2 flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              setEditingCommentId(null)
                              setEditingContent('')
                            }}
                            className="px-3 py-1.5 rounded-md border border-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800"
                          >
                            Cancel
                          </button>
                          <button type="submit" className="px-3 py-1.5 rounded-md bg-red-600 text-white hover:bg-red-700">
                            Save
                          </button>
                        </div>
                      </form>
                    ) : (
                      <p className="text-sm text-gray-800 dark:text-gray-200 mt-1">{c.content}</p>
                    )}

                    {isAuthenticated && user?._id === c.owner?._id && editingCommentId !== c._id && (
                      <div className="mt-1 flex items-center gap-2 text-xs text-gray-500">
                        <button
                          onClick={() => {
                            setEditingCommentId(c._id)
                            setEditingContent(c.content)
                          }}
                          className="hover:underline"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() =>
                            requireAuth(async () => {
                              if (!confirm('Delete this comment?')) return
                              try {
                                await api.delete(`/comments/c/${c._id}`)
                                setComments((prev) => prev.filter((x) => x._id !== c._id))
                                toast.success('Comment deleted')
                              } catch (err) {
                                const msg = err.response?.data?.message || 'Delete failed'
                                toast.error(msg)
                              }
                            })
                          }
                          className="hover:underline"
                        >
                          Delete
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {cHasMore && (
              <div className="mt-4">
                <button
                  disabled={cBusy}
                  onClick={() => fetchComments(cPage + 1)}
                  className="px-4 py-2 rounded-md border border-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-50"
                >
                  {cBusy ? 'Loading…' : 'Load more'}
                </button>
              </div>
            )}
          </div>
        </div>

        <AnimatePresence>
          {shareOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-black/50"
                onClick={() => setShareOpen(false)}
              />
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="relative w-full max-w-md mx-4 rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6"
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Share</h3>
                  <button
                    onClick={() => setShareOpen(false)}
                    className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
                  >
                    <X size={20} />
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={shareToFacebook}
                    className="flex flex-col items-center gap-2 p-4 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800"
                  >
                    <Facebook className="w-8 h-8 text-blue-600" />
                    <span className="text-sm font-medium">Facebook</span>
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={shareToTwitter}
                    className="flex flex-col items-center gap-2 p-4 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800"
                  >
                    <Twitter className="w-8 h-8 text-blue-400" />
                    <span className="text-sm font-medium">Twitter</span>
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={shareToWhatsApp}
                    className="flex flex-col items-center gap-2 p-4 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800"
                  >
                    <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-xs font-bold">WA</span>
                    </div>
                    <span className="text-sm font-medium">WhatsApp</span>
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={shareToInstagram}
                    className="flex flex-col items-center gap-2 p-4 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800"
                  >
                    <Instagram className="w-8 h-8 text-pink-600" />
                    <span className="text-sm font-medium">Instagram</span>
                  </motion.button>
                </div>
                <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <div className="flex items-center gap-2 p-3 rounded-lg bg-gray-50 dark:bg-gray-800">
                    <LinkIcon className="w-5 h-5 text-gray-500" />
                    <input
                      type="text"
                      readOnly
                      value={shareUrl}
                      className="flex-1 bg-transparent text-sm text-gray-700 dark:text-gray-300 outline-none"
                    />
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={copyLink}
                      className="p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700"
                    >
                      <Copy className="w-4 h-4" />
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {editOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="absolute inset-0 bg-black/50" onClick={() => setEditOpen(false)} />
            <div className="relative w-full max-w-lg mx-4 rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-5">
              <h3 className="text-lg font-semibold mb-4">Edit video</h3>
              <form onSubmit={onSubmitEdit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Title</label>
                  <input
                    className="w-full rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2 outline-none focus:ring-2 focus:ring-red-500"
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Description</label>
                  <textarea
                    className="w-full rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2 min-h-[120px] outline-none focus:ring-2 focus:ring-red-500"
                    value={editDescription}
                    onChange={(e) => setEditDescription(e.target.value)}
                    required
                  />
                </div>
                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setEditOpen(false)}
                    className="px-4 py-2 rounded-md border border-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800"
                  >
                    Cancel
                  </button>
                  <button type="submit" className="px-5 py-2 rounded-md bg-red-600 text-white hover:bg-red-700">
                    Save
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Bookmark Modal */}
        <BookmarkModal
          isOpen={showBookmarkModal}
          onClose={() => setShowBookmarkModal(false)}
          onSave={handleSaveBookmark}
          currentTime={currentTime}
          videoTitle={video?.title}
        />

        {/* Bookmarks Sidebar */}
        {showBookmarks && isAuthenticated && (
          <div className="fixed right-0 top-0 h-full w-80 bg-white dark:bg-gray-900 shadow-2xl z-40 overflow-y-auto">
            <div className="sticky top-0 bg-white dark:bg-gray-900 border-b dark:border-gray-700 p-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Bookmark className="w-5 h-5 text-blue-500" />
                <h3 className="font-semibold text-gray-900 dark:text-white">
                  Bookmarks ({bookmarks.length})
                </h3>
              </div>
              <button
                onClick={() => setShowBookmarks(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4">
              <BookmarkList
                bookmarks={bookmarks}
                onJumpTo={handleJumpToBookmark}
                onDelete={handleDeleteBookmark}
              />
            </div>
          </div>
        )}

        {/* Toggle Bookmarks Button (Fixed) */}
        {isAuthenticated && bookmarks.length > 0 && !showBookmarks && (
          <motion.button
            initial={{ x: 100 }}
            animate={{ x: 0 }}
            onClick={() => setShowBookmarks(true)}
            className="fixed right-4 bottom-24 bg-blue-600 text-white p-3 rounded-full shadow-lg hover:bg-blue-700 z-30"
            title={`View ${bookmarks.length} bookmarks`}
          >
            <Bookmark className="w-5 h-5" />
            {bookmarks.length > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {bookmarks.length}
              </span>
            )}
          </motion.button>
        )}
      </motion.div>
    </div>
  )
}

export default VideoPlayer
