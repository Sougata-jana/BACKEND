import { useState, useEffect, useRef } from 'react'
import { useParams, Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { api } from '../utils/api'
import { ThumbsUp, ThumbsDown, Share2, Facebook, Twitter, Instagram, Link as LinkIcon, Copy, X, PencilLine, Play, Pause, Volume2, VolumeX, Maximize, Minimize, Bell, BellOff } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import toast from 'react-hot-toast'

const VideoPlayer = () => {
  const { videoId } = useParams()
  const [video, setVideo] = useState(null)
  const [loading, setLoading] = useState(true)
  const [likeBusy, setLikeBusy] = useState(false)
  const [likeCount, setLikeCount] = useState(0)
  const [isLiked, setIsLiked] = useState(false)
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

  useEffect(() => {
    fetchVideo()
  }, [videoId])

  // Check subscription status when video and user are loaded
  useEffect(() => {
    const checkSubscription = async () => {
      if (!video?.owner?._id || !isAuthenticated || !user?._id) {
        setIsSubscribed(false)
        return
      }

      try {
        const response = await api.get(`/subscriptions/status/${video.owner._id}`)
        setIsSubscribed(response.data.data.isSubscribed || false)
      } catch (err) {
        console.error('Failed to check subscription:', err)
        setIsSubscribed(false)
      }
    }

    checkSubscription()
  }, [video?.owner?._id, isAuthenticated, user?._id])

  const fetchVideo = async () => {
    try {
      setLoading(true)
      const response = await api.get(`/videos/${videoId}`)
      const videoData = response.data.data
      setVideo(videoData)
      setLikeCount(videoData.likeCount || 0)
      setIsLiked(videoData.isLiked || false)
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
    }
  }, [videoId])

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

  const onToggleLike = () => {
    requireAuth(async () => {
      if (!video) return
      try {
        setLikeBusy(true)
        const { data } = await api.post(`/likes/toggle/v/${video._id}`)
        setIsLiked(data.data.isLiked)
        setLikeCount(data.data.likeCount || 0)
        toast.success(data.data.isLiked ? 'Liked' : 'Unliked')
      } catch (err) {
        const msg = err.response?.data?.message || 'Failed to toggle like'
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
        const response = await api.post(`/subscriptions/toggle/${video.owner._id}`)
        // Get the actual subscription status from response
        const newStatus = response.data.data?.isSubscribed
        if (newStatus !== undefined) {
          setIsSubscribed(newStatus)
        } else {
          setIsSubscribed((prev) => !prev)
        }
        toast.success(newStatus ? 'Subscribed' : 'Unsubscribed')
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
            <div className="absolute inset-0 flex items-center justify-center bg-black/30 cursor-pointer" onClick={togglePlay}>
              <motion.div
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                className="w-20 h-20 bg-black/70 rounded-full flex items-center justify-center text-white shadow-lg"
              >
                <Play size={40} className="ml-2" />
              </motion.div>
            </div>
          )}

          {isPlaying && (
            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/10 cursor-pointer" onClick={togglePlay}>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className="w-16 h-16 bg-black/70 rounded-full flex items-center justify-center text-white"
              >
                <Pause size={32} />
              </motion.button>
            </div>
          )}

          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-3 opacity-0 group-hover:opacity-100 transition-opacity">
            <div className="flex items-center gap-2 mb-2">
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={(e) => {
                  e.stopPropagation()
                  togglePlay()
                }}
                className="text-white hover:text-red-500 transition-colors"
              >
                {isPlaying ? <Pause size={20} /> : <Play size={20} />}
              </motion.button>

              <div
                className="flex-1 relative h-1.5 bg-white/30 rounded-full cursor-pointer group/seek"
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
                  className="absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-red-600 rounded-full -ml-1.5 opacity-0 group-hover/seek:opacity-100 transition-opacity"
                  style={{ left: `${duration ? (currentTime / duration) * 100 : 0}%` }}
                />
              </div>

              <span className="text-white text-xs min-w-[100px] text-right">{formatTime(currentTime)} / {formatTime(duration)}</span>

              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={(e) => {
                  e.stopPropagation()
                  toggleMute()
                }}
                className="text-white hover:text-red-500 transition-colors"
              >
                {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
              </motion.button>

              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={isMuted ? 0 : volume}
                onChange={handleVolumeChange}
                onClick={(e) => e.stopPropagation()}
                className="w-20 h-1 cursor-pointer"
              />

              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={(e) => {
                  e.stopPropagation()
                  toggleFullscreen()
                }}
                className="text-white hover:text-red-500 transition-colors"
              >
                {isFullscreen ? <Minimize size={20} /> : <Maximize size={20} />}
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
                onClick={() => toast.info('Dislike feature coming soon')}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100 hover:bg-gray-200 dark:hover:bg-gray-700"
              >
                <ThumbsDown size={18} />
              </motion.button>
            </div>
          </div>

          <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400">
            <span>{(video.views || 0).toLocaleString()} views</span>
            <span>•</span>
            <span>{new Date(video.createdAt).toLocaleDateString()}</span>
          </div>

          <div className="flex flex-col sm:flex-row items-start gap-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <Link to={`/channel/${video.owner?.username}`} className="flex-shrink-0">
              <img
                src={video.owner?.avatar}
                alt={video.owner?.fullname}
                className="w-12 h-12 rounded-full object-cover cursor-pointer hover:ring-2 ring-red-500 transition-all"
              />
            </Link>
            <div className="flex-1 min-w-0">
              <Link to={`/channel/${video.owner?.username}`}>
                <h3 className="font-semibold text-gray-900 dark:text-gray-100 hover:text-red-600 dark:hover:text-red-400">
                  {video.owner?.fullname}
                </h3>
              </Link>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                @{video.owner?.username}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-2 break-words">
                {video.description}
              </p>
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto">
              {isAuthenticated ? (
                isOwnChannel ? (
                  <span className="px-4 sm:px-6 py-2 rounded-full text-sm bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 border whitespace-nowrap">
                    Your channel
                  </span>
                ) : (
                  <>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={onToggleSubscribe}
                      disabled={subBusy}
                      className={`flex-1 sm:flex-initial px-4 sm:px-6 py-2 rounded-full font-medium transition-colors whitespace-nowrap ${isSubscribed ? 'bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-100' : 'bg-red-600 text-white hover:bg-red-700'}`}
                    >
                      {subBusy ? 'Loading...' : isSubscribed ? 'Subscribed' : 'Subscribe'}
                    </motion.button>
                    {isSubscribed && (
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => toast.info('Notifications are enabled for this channel')}
                        className="p-2 rounded-full bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                        title="Notifications"
                      >
                        <Bell size={20} className="text-gray-900 dark:text-gray-100" />
                      </motion.button>
                    )}
                  </>
                )
              ) : (
                <Link
                  to="/login"
                  className="w-full sm:w-auto text-center px-4 sm:px-6 py-2 bg-red-600 text-white rounded-full hover:bg-red-700 transition-colors font-medium whitespace-nowrap"
                >
                  Sign in to subscribe
                </Link>
              )}
            </div>
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
      </motion.div>
    </div>
  )
}

export default VideoPlayer
