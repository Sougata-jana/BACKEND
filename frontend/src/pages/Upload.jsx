import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import api from '../utils/api'
import { useAuth } from '../contexts/AuthContext'
import toast from 'react-hot-toast'

const MAX_TITLE = 100
const MAX_DESC = 1000
const MAX_VIDEO_MB = 500 // adjust as needed
const MAX_THUMB_MB = 10

const Upload = () => {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [videoFile, setVideoFile] = useState(null)
  const [thumbnail, setThumbnail] = useState(null)
  const [videoPreview, setVideoPreview] = useState('')
  const [thumbPreview, setThumbPreview] = useState('')
  const [loading, setLoading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [acceptedPolicy, setAcceptedPolicy] = useState(false)
  const navigate = useNavigate()
  const { requireAuth } = useAuth()

  const videoInputRef = useRef(null)
  const thumbInputRef = useRef(null)

  useEffect(() => {
    return () => {
      if (videoPreview) URL.revokeObjectURL(videoPreview)
      if (thumbPreview) URL.revokeObjectURL(thumbPreview)
    }
  }, [videoPreview, thumbPreview])

  const formatBytes = (bytes) => {
    if (!bytes && bytes !== 0) return ''
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    if (bytes === 0) return '0 Byte'
    const i = Math.floor(Math.log(bytes) / Math.log(1024))
    return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${sizes[i]}`
  }

  const handleTitleChange = (e) => {
    const v = e.target.value
    setTitle(v.slice(0, MAX_TITLE))
  }

  const handleDescChange = (e) => {
    const v = e.target.value
    setDescription(v.slice(0, MAX_DESC))
  }

  const pickVideo = (file) => {
    if (!file) return
    if (!file.type.startsWith('video/')) {
      toast.error('Please select a valid video file')
      return
    }
    const max = MAX_VIDEO_MB * 1024 * 1024
    if (file.size > max) {
      toast.error(`Video must be <= ${MAX_VIDEO_MB}MB`)
      return
    }
    if (videoPreview) URL.revokeObjectURL(videoPreview)
    setVideoFile(file)
    setVideoPreview(URL.createObjectURL(file))
  }

  const pickThumb = (file) => {
    if (!file) return
    if (!file.type.startsWith('image/')) {
      toast.error('Please select a valid image file')
      return
    }
    const max = MAX_THUMB_MB * 1024 * 1024
    if (file.size > max) {
      toast.error(`Thumbnail must be <= ${MAX_THUMB_MB}MB`)
      return
    }
    if (thumbPreview) URL.revokeObjectURL(thumbPreview)
    setThumbnail(file)
    setThumbPreview(URL.createObjectURL(file))
  }

  const onVideoDrop = (e) => {
    e.preventDefault()
    const file = e.dataTransfer?.files?.[0]
    pickVideo(file)
  }
  const onThumbDrop = (e) => {
    e.preventDefault()
    const file = e.dataTransfer?.files?.[0]
    pickThumb(file)
  }

  const onSubmit = (e) => {
    e.preventDefault()
    requireAuth(async () => {
      if (!title.trim()) return toast.error('Title is required')
      if (!description.trim()) return toast.error('Description is required')
      if (!videoFile) return toast.error('Please select a video file')
      if (!thumbnail) return toast.error('Please select a thumbnail')
      if (!acceptedPolicy) return toast.error('Please accept the content policy to continue')

      try {
        setLoading(true)
        setProgress(0)
        const form = new FormData()
        form.append('title', title.trim())
        form.append('description', description.trim())
        form.append('videoFile', videoFile)
        form.append('thumbnail', thumbnail)

        const { data } = await api.post('/videos', form, {
          headers: { 'Content-Type': 'multipart/form-data' },
          onUploadProgress: (evt) => {
            if (!evt.total) return
            const pct = Math.round((evt.loaded / evt.total) * 100)
            setProgress(pct)
          }
        })
        toast.success('Video uploaded successfully! Our system will review it shortly.')
        navigate(`/video/${data.data._id}`)
      } catch (err) {
        const msg = err.response?.data?.message || 'Upload failed'
        
        // Check if content moderation failed
        if (msg.includes('inappropriate') || msg.includes('adult') || msg.includes('18+')) {
          toast.error('🚫 Upload blocked: This video contains inappropriate content', { duration: 5000 })
        } else {
          toast.error(msg)
        }
      } finally {
        setLoading(false)
      }
    })
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-red-500 to-pink-500 bg-clip-text text-transparent">
          Upload Video
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">Share your content with the world</p>
      </motion.div>

      <form onSubmit={onSubmit} className="grid gap-6 lg:grid-cols-5">
        {/* Content Policy Warning Banner */}
        <div className="lg:col-span-5">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-4 rounded-xl border-2 border-amber-500 dark:border-amber-600 bg-amber-50 dark:bg-amber-900/20"
          >
            <div className="flex items-start gap-3">
              <span className="text-2xl">⚠️</span>
              <div className="flex-1">
                <h3 className="font-bold text-amber-900 dark:text-amber-200 mb-2">Content Policy Notice</h3>
                <p className="text-sm text-amber-800 dark:text-amber-300 mb-3">
                  <strong>18+ Adult Content is STRICTLY PROHIBITED.</strong> Our AI system automatically detects inappropriate content including:
                </p>
                <ul className="text-sm text-amber-800 dark:text-amber-300 space-y-1 mb-3 ml-4 list-disc">
                  <li>Sexual or explicit content</li>
                  <li>Nudity or sexually suggestive material</li>
                  <li>Violence or graphic content</li>
                  <li>Hate speech or harassment</li>
                </ul>
                <p className="text-sm text-amber-800 dark:text-amber-300 font-semibold">
                  ⛔ Videos violating these policies will be automatically blocked and your account may be suspended.
                </p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Left: files */}
        <div className="lg:col-span-3 space-y-6">
          {/* Video picker */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            onDragOver={(e) => e.preventDefault()}
            onDrop={onVideoDrop}
            className="group relative rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-700 p-6 bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm hover:border-red-400 dark:hover:border-red-500 transition-all duration-300"
          >
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 gap-3">
              <div>
                <label className="block text-base font-semibold text-gray-900 dark:text-gray-100 mb-1">
                  🎬 Video File
                </label>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  MP4, WebM or MOV • Max {MAX_VIDEO_MB}MB
                </p>
              </div>
              <button
                type="button"
                onClick={() => videoInputRef.current?.click()}
                className="px-4 py-2 rounded-lg text-sm font-medium bg-gradient-to-r from-red-500 to-pink-500 text-white hover:shadow-lg hover:scale-105 transition-all duration-200"
              >
                Choose File
              </button>
              <input
                ref={videoInputRef}
                type="file"
                accept="video/*"
                className="hidden"
                onChange={(e) => pickVideo(e.target.files?.[0] || null)}
              />
            </div>

            {videoFile ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="space-y-3"
              >
                <div className="aspect-video w-full bg-black/80 rounded-lg overflow-hidden shadow-xl">
                  {videoPreview && (
                    <video src={videoPreview} controls className="w-full h-full object-contain" />
                  )}
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300 truncate flex-1">
                    {videoFile.name}
                  </span>
                  <span className="text-sm font-semibold text-red-600 dark:text-red-400 ml-3">
                    {formatBytes(videoFile.size)}
                  </span>
                </div>
              </motion.div>
            ) : (
              <div className="flex flex-col items-center justify-center text-center py-12 gap-3">
                <motion.div
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="w-16 h-16 rounded-full bg-gradient-to-br from-red-500 to-pink-500 flex items-center justify-center text-3xl shadow-lg"
                >
                  🎬
                </motion.div>
                <div>
                  <p className="text-base font-medium text-gray-700 dark:text-gray-300">
                    Drag and drop your video here
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    or click "Choose File" to browse
                  </p>
                </div>
              </div>
            )}
          </motion.div>

          {/* Thumbnail picker */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            onDragOver={(e) => e.preventDefault()}
            onDrop={onThumbDrop}
            className="group relative rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-700 p-6 bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm hover:border-red-400 dark:hover:border-red-500 transition-all duration-300"
          >
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 gap-3">
              <div>
                <label className="block text-base font-semibold text-gray-900 dark:text-gray-100 mb-1">
                  🖼️ Thumbnail
                </label>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  JPG or PNG • 16:9 recommended • Max {MAX_THUMB_MB}MB
                </p>
              </div>
              <button
                type="button"
                onClick={() => thumbInputRef.current?.click()}
                className="px-4 py-2 rounded-lg text-sm font-medium bg-gradient-to-r from-red-500 to-pink-500 text-white hover:shadow-lg hover:scale-105 transition-all duration-200"
              >
                Choose File
              </button>
              <input
                ref={thumbInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => pickThumb(e.target.files?.[0] || null)}
              />
            </div>

            {thumbnail ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="space-y-3"
              >
                <div className="aspect-video w-full bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden shadow-xl">
                  {thumbPreview && (
                    <img src={thumbPreview} alt="thumbnail preview" className="w-full h-full object-cover" />
                  )}
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300 truncate flex-1">
                    {thumbnail.name}
                  </span>
                  <span className="text-sm font-semibold text-red-600 dark:text-red-400 ml-3">
                    {formatBytes(thumbnail.size)}
                  </span>
                </div>
              </motion.div>
            ) : (
              <div className="flex flex-col items-center justify-center text-center py-12 gap-3">
                <motion.div
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
                  className="w-16 h-16 rounded-full bg-gradient-to-br from-red-500 to-pink-500 flex items-center justify-center text-3xl shadow-lg"
                >
                  🖼️
                </motion.div>
                <div>
                  <p className="text-base font-medium text-gray-700 dark:text-gray-300">
                    Drag and drop your thumbnail here
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    or click "Choose File" to browse
                  </p>
                </div>
              </div>
            )}
          </motion.div>
        </div>

        {/* Right: metadata */}
        <div className="lg:col-span-2 space-y-6">
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="rounded-xl border border-gray-200 dark:border-gray-800 p-5 bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm shadow-lg"
          >
            <label className="block text-sm font-semibold text-gray-900 dark:text-gray-100 mb-3">
              📝 Title
            </label>
            <input
              value={title}
              onChange={handleTitleChange}
              placeholder="Add a catchy title for your video..."
              className="w-full text-gray-900 dark:text-gray-100 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-4 py-3 outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
              required
            />
            <div className="mt-2 text-xs font-medium text-gray-500 dark:text-gray-400 text-right">
              {title.length}/{MAX_TITLE}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="rounded-xl border border-gray-200 dark:border-gray-800 p-5 bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm shadow-lg"
          >
            <label className="block text-sm font-semibold text-gray-900 dark:text-gray-100 mb-3">
              📄 Description
            </label>
            <textarea
              value={description}
              onChange={handleDescChange}
              placeholder="Tell viewers about your video..."
              className="w-full text-gray-900 dark:text-gray-100 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-4 py-3 min-h-[160px] outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all resize-none"
              required
            />
            <div className="mt-2 text-xs font-medium text-gray-500 dark:text-gray-400 text-right">
              {description.length}/{MAX_DESC}
            </div>
          </motion.div>

          {/* Content Policy Checkbox */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.25 }}
            className="rounded-xl border border-gray-200 dark:border-gray-800 p-5 bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm shadow-lg"
          >
            <label className="flex items-start gap-3 cursor-pointer group">
              <input
                type="checkbox"
                checked={acceptedPolicy}
                onChange={(e) => setAcceptedPolicy(e.target.checked)}
                className="mt-1 w-5 h-5 rounded border-gray-300 text-red-600 focus:ring-2 focus:ring-red-500 cursor-pointer"
                required
              />
              <div className="flex-1">
                <span className="text-sm font-medium text-gray-900 dark:text-gray-100 group-hover:text-red-500 transition-colors">
                  I confirm this video complies with content policies
                </span>
                <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                  By checking this, I certify that my video does not contain any adult, sexual, violent, or inappropriate content. I understand that violations may result in account suspension.
                </p>
              </div>
            </label>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex items-center gap-3"
          >
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="button"
              onClick={() => navigate('/my-videos')}
              className="flex-1 px-5 py-3 rounded-lg border-2 border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition-all"
              disabled={loading}
            >
              Cancel
            </motion.button>
            <motion.button
              whileHover={{ scale: loading ? 1 : 1.05 }}
              whileTap={{ scale: loading ? 1 : 0.95 }}
              disabled={loading}
              type="submit"
              className="flex-1 px-6 py-3 bg-gradient-to-r from-red-500 to-pink-500 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {loading ? '⏳ Uploading...' : '🚀 Upload Video'}
            </motion.button>
          </motion.div>

          {loading && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="p-4 rounded-xl bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm border border-gray-200 dark:border-gray-800"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Uploading...
                </span>
                <span className="text-sm font-bold text-red-600 dark:text-red-400">
                  {progress}%
                </span>
              </div>
              <div className="h-3 w-full bg-gray-200 dark:bg-gray-800 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  className="h-full bg-gradient-to-r from-red-500 to-pink-500 rounded-full shadow-lg"
                  transition={{ duration: 0.3 }}
                />
              </div>
            </motion.div>
          )}
        </div>
      </form>
    </div>
  )
}

export default Upload
