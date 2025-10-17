import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import api from '../utils/api'
import { useAuth } from '../contexts/AuthContext'
import toast from 'react-hot-toast'

const MAX_TITLE = 100
const MAX_DESC = 1000
const MAX_VIDEO_MB = 500 // adjust as needed
const MAX_THUMB_MB = 5

const Upload = () => {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [videoFile, setVideoFile] = useState(null)
  const [thumbnail, setThumbnail] = useState(null)
  const [videoPreview, setVideoPreview] = useState('')
  const [thumbPreview, setThumbPreview] = useState('')
  const [loading, setLoading] = useState(false)
  const [progress, setProgress] = useState(0)
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
        toast.success('Video uploaded successfully')
        navigate(`/video/${data.data._id}`)
      } catch (err) {
        const msg = err.response?.data?.message || 'Upload failed'
        toast.error(msg)
      } finally {
        setLoading(false)
      }
    })
  }

  return (
    <div className="max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold mb-6 text-gray-900 dark:text-gray-100">Upload Video</h1>

      <form onSubmit={onSubmit} className="grid gap-6 md:grid-cols-5">
        {/* Left: files */}
        <div className="md:col-span-3 space-y-6">
          {/* Video picker */}
          <div
            onDragOver={(e) => e.preventDefault()}
            onDrop={onVideoDrop}
            className="rounded-lg border border-dashed border-gray-300 dark:border-gray-700 p-4 sm:p-6 bg-white dark:bg-gray-900"
          >
            <div className="flex items-center justify-between mb-3">
              <div>
                <label className="block text-sm font-medium text-gray-900 dark:text-gray-100">Video file</label>
                <p className="text-xs text-gray-500">MP4, WebM or MOV. Max {MAX_VIDEO_MB}MB</p>
              </div>
              <button
                type="button"
                onClick={() => videoInputRef.current?.click()}
                className="px-3 py-1.5 rounded-md text-sm bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700"
              >
                Choose file
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
              <div className="space-y-3">
                <div className="aspect-video w-full bg-black/60 rounded overflow-hidden">
                  {videoPreview && (
                    <video src={videoPreview} controls className="w-full h-full object-contain" />
                  )}
                </div>
                <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-300">
                  <span className="truncate">{videoFile.name}</span>
                  <span>{formatBytes(videoFile.size)}</span>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center text-center py-10 gap-2">
                <div className="w-12 h-12 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-500">🎬</div>
                <p className="text-sm text-gray-600 dark:text-gray-300">Drag and drop your video here, or click Choose file</p>
              </div>
            )}
          </div>

          {/* Thumbnail picker */}
          <div
            onDragOver={(e) => e.preventDefault()}
            onDrop={onThumbDrop}
            className="rounded-lg border border-dashed border-gray-300 dark:border-gray-700 p-4 sm:p-6 bg-white dark:bg-gray-900"
          >
            <div className="flex items-center justify-between mb-3">
              <div>
                <label className="block text-sm font-medium text-gray-900 dark:text-gray-100">Thumbnail</label>
                <p className="text-xs text-gray-500">JPG or PNG. 16:9 recommended. Max {MAX_THUMB_MB}MB</p>
              </div>
              <button
                type="button"
                onClick={() => thumbInputRef.current?.click()}
                className="px-3 py-1.5 rounded-md text-sm bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700"
              >
                Choose file
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
              <div className="space-y-3">
                <div className="aspect-video w-full bg-gray-100 dark:bg-gray-800 rounded overflow-hidden">
                  {thumbPreview && (
                    <img src={thumbPreview} alt="thumbnail preview" className="w-full h-full object-cover" />
                  )}
                </div>
                <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-300">
                  <span className="truncate">{thumbnail.name}</span>
                  <span>{formatBytes(thumbnail.size)}</span>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center text-center py-10 gap-2">
                <div className="w-12 h-12 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-500">🖼️</div>
                <p className="text-sm text-gray-600 dark:text-gray-300">Drag and drop a thumbnail image here, or click Choose file</p>
              </div>
            )}
          </div>
        </div>

        {/* Right: metadata */}
        <div className="md:col-span-2 space-y-6">
          <div className="rounded-lg border border-gray-200 dark:border-gray-800 p-4 sm:p-6 bg-white dark:bg-gray-900">
            <label className="block text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">Title</label>
            <input
              value={title}
              onChange={handleTitleChange}
              placeholder="Add a title that describes your video"
              className="w-full text-black rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2 outline-none focus:ring-2 focus:ring-red-500"
              required
            />
            <div className="mt-1 text-xs text-gray-500 text-right">{title.length}/{MAX_TITLE}</div>
          </div>

          <div className="rounded-lg border border-gray-200 dark:border-gray-800 p-4 sm:p-6 bg-white dark:bg-gray-900">
            <label className="block text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">Description</label>
            <textarea
              value={description}
              onChange={handleDescChange}
              placeholder="Tell viewers about your video"
              className="w-full text-black rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2 min-h-[140px] outline-none focus:ring-2 focus:ring-red-500"
              required
            />
            <div className="mt-1 text-xs text-gray-500 text-right">{description.length}/{MAX_DESC}</div>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => navigate('/my-videos')}
              className="px-4 py-2 rounded-md border border-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800"
              disabled={loading}
            >
              Cancel
            </button>
            <motion.button
              whileHover={{ scale: loading ? 1 : 1.02 }}
              whileTap={{ scale: loading ? 1 : 0.98 }}
              disabled={loading}
              type="submit"
              className="px-5 py-2.5 bg-red-600 text-white rounded-md disabled:opacity-50"
            >
              {loading ? 'Uploading…' : 'Upload'}
            </motion.button>
          </div>

          {loading && (
            <div className="mt-2">
              <div className="h-2 w-full bg-gray-200 dark:bg-gray-800 rounded">
                <div
                  className="h-2 bg-red-600 rounded transition-all"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <div className="mt-1 text-xs text-gray-500">{progress}%</div>
            </div>
          )}
        </div>
      </form>
    </div>
  )
}

export default Upload
