import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { api } from '../utils/api'
import { ThumbsUp, ThumbsDown, Share as ShareIcon, PencilLine } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import toast from 'react-hot-toast'

const VideoPlayer = () => {
  const { videoId } = useParams()
  const [video, setVideo] = useState(null)
  const [loading, setLoading] = useState(true)
  const [likeBusy, setLikeBusy] = useState(false)
  const [liked, setLiked] = useState(false)
  const [editOpen, setEditOpen] = useState(false)
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

  useEffect(() => {
    fetchVideo()
  }, [videoId])

  const fetchVideo = async () => {
    try {
      setLoading(true)
      const response = await api.get(`/videos/${videoId}`)
      setVideo(response.data.data)
    } catch (error) {
      console.error('Error fetching video:', error)
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
      if (page === 1) setComments(resp.docs || [])
      else setComments((prev) => [...prev, ...(resp.docs || [])])
      setCPage(resp.page || page)
      setCHasMore((resp.page || page) < (resp.totalPages || 1))
    } catch (err) {
      console.error('Comments fetch failed', err)
    } finally {
      setCBusy(false)
    }
  }

  useEffect(() => {
    fetchComments(1)
  }, [videoId])

  const onToggleLike = () => {
    requireAuth(async () => {
      if (!video) return
      try {
        setLikeBusy(true)
        await api.post(`/likes/toggle/v/${video._id}`)
        setLiked((v) => !v)
      } catch (err) {
        const msg = err.response?.data?.message || 'Failed to toggle like'
        toast.error(msg)
      } finally {
        setLikeBusy(false)
      }
    })
  }

  const onDislike = () => {
    // Backend doesn't support dislikes; if liked, this will just unlike
    if (liked) return onToggleLike()
    toast.error('Dislike is not supported by the server')
  }

  const onShare = async () => {
    const url = window.location.href
    try {
      if (navigator.share) {
        await navigator.share({ title: video?.title || 'Video', text: 'Check out this video', url })
      } else {
        await navigator.clipboard.writeText(url)
        toast.success('Link copied to clipboard')
      }
    } catch (_) {
      await navigator.clipboard.writeText(url)
      toast.success('Link copied to clipboard')
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

  return (
    <div className="max-w-7xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="space-y-6"
      >
        {/* Video Player */}
        <div className="aspect-video bg-black rounded-lg overflow-hidden">
          <video
            src={video.videoFile}
            controls
            className="w-full h-full"
            poster={video.thumbnail}
          >
            Your browser does not support the video tag.
          </video>
        </div>

        {/* Video Info */}
        <div className="space-y-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              {video.title}
            </h1>
            <div className="flex items-center gap-2 sm:self-auto self-start">
              {isAuthenticated && user?._id === video.owner?._id && (
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
                <ShareIcon size={18} />
                Share
              </motion.button>
              <motion.button
                whileHover={{ scale: likeBusy ? 1 : 1.03 }}
                whileTap={{ scale: likeBusy ? 1 : 0.97 }}
                disabled={likeBusy}
                onClick={onToggleLike}
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm ${liked ? 'bg-red-600 text-white hover:bg-red-700' : 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100 hover:bg-gray-200 dark:hover:bg-gray-700'}`}
              >
                <ThumbsUp size={18} />
                {liked ? 'Liked' : 'Like'}
              </motion.button>
              <motion.button
                whileHover={{ scale: likeBusy ? 1 : 1.03 }}
                whileTap={{ scale: likeBusy ? 1 : 0.97 }}
                disabled={likeBusy}
                onClick={onDislike}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100 hover:bg-gray-200 dark:hover:bg-gray-700"
              >
                <ThumbsDown size={18} />
                Dislike
              </motion.button>
            </div>
          </div>

          {/* Video Stats */}
          <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400">
            <span>{(video.views || 0).toLocaleString()} views</span>
            <span>•</span>
            <span>{new Date(video.createdAt).toLocaleDateString()}</span>
          </div>

          {/* Channel Info */}
          <div className="flex items-start space-x-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <img
              src={video.owner?.avatar}
              alt={video.owner?.fullname}
              className="w-12 h-12 rounded-full object-cover"
            />
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                {video.owner?.fullname}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                @{video.owner?.username}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                {video.description}
              </p>
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-6 py-2 bg-red-600 text-white rounded-full hover:bg-red-700 transition-colors font-medium"
            >
              Subscribe
            </motion.button>
          </div>
          {/* Comments */}
          <div className="mt-6">
            <h3 className="text-lg font-semibold mb-3 text-gray-900 dark:text-gray-100">Comments</h3>
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
                      } catch (err) {
                        const msg = err.response?.data?.message || 'Failed to add comment'
                        toast.error(msg)
                      }
                    })
                  }}
                  className="flex items-start gap-3"
                >
                  <img src={user?.avatar} alt="me" className="w-10 h-10 rounded-full object-cover" />
                  <div className="flex-1">
                    <textarea
                      className="w-full rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2 min-h-[70px] outline-none focus:ring-2 focus:ring-red-500"
                      placeholder="Add a public comment..."
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                    />
                    <div className="mt-2 flex items-center justify-end gap-2">
                      <button type="button" onClick={() => setNewComment('')} className="px-4 py-1.5 rounded-md border border-gray-300 dark:border-gray-700">Cancel</button>
                      <button type="submit" className="px-4 py-1.5 rounded-md bg-red-600 text-white">Comment</button>
                    </div>
                  </div>
                </form>
              ) : (
                <div className="text-sm text-gray-600 dark:text-gray-300">Sign in to comment.</div>
              )}
            </div>

            <div className="space-y-4">
              {comments.map((c) => (
                <div key={c._id} className="flex items-start gap-3">
                  <img src={c.owner?.avatar} alt={c.owner?.fullname} className="w-10 h-10 rounded-full object-cover" />
                  <div className="flex-1">
                    <div className="flex items-center gap-2 text-sm">
                      <span className="font-medium text-gray-900 dark:text-gray-100">{c.owner?.fullname}</span>
                      <span className="text-gray-500">@{c.owner?.username}</span>
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
                          <button type="button" onClick={() => { setEditingCommentId(null); setEditingContent('') }} className="px-3 py-1.5 rounded-md border border-gray-300 dark:border-gray-700">Cancel</button>
                          <button type="submit" className="px-3 py-1.5 rounded-md bg-red-600 text-white">Save</button>
                        </div>
                      </form>
                    ) : (
                      <p className="text-sm text-gray-800 dark:text-gray-200 mt-1">{c.content}</p>
                    )}

                    {isAuthenticated && user?._id === c.owner?._id && editingCommentId !== c._id && (
                      <div className="mt-1 flex items-center gap-2 text-xs text-gray-500">
                        <button
                          onClick={() => { setEditingCommentId(c._id); setEditingContent(c.content) }}
                          className="hover:underline"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => requireAuth(async () => {
                            try {
                              await api.delete(`/comments/c/${c._id}`)
                              setComments((prev) => prev.filter((x) => x._id !== c._id))
                            } catch (err) {
                              const msg = err.response?.data?.message || 'Delete failed'
                              toast.error(msg)
                            }
                          })}
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
                  className="px-4 py-2 rounded-md border border-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800"
                >
                  {cBusy ? 'Loading…' : 'Load more'}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Edit modal */}
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
                  <button type="button" onClick={() => setEditOpen(false)} className="px-4 py-2 rounded-md border border-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800">Cancel</button>
                  <button type="submit" className="px-5 py-2 rounded-md bg-red-600 text-white hover:bg-red-700">Save</button>
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
