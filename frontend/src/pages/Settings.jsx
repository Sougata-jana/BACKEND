import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useAuth } from '../contexts/AuthContext'
import { api } from '../utils/api'
import { User, Mail, Lock, Image as ImageIcon, Save, X, Trash2, AlertTriangle } from 'lucide-react'
import toast from 'react-hot-toast'

const Settings = () => {
  const { user, updateUser, requireAuth } = useAuth()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    fullname: '',
    username: '',
    email: '',
    oldPassword: '',
    newPassword: '',
    confirmPassword: ''
  })
  const [avatarPreview, setAvatarPreview] = useState('')
  const [coverPreview, setCoverPreview] = useState('')
  const [avatarFile, setAvatarFile] = useState(null)
  const [coverFile, setCoverFile] = useState(null)
  const [deleteAccountOpen, setDeleteAccountOpen] = useState(false)

  useEffect(() => {
    if (user) {
      setFormData({
        fullname: user.fullname || '',
        username: user.username || '',
        email: user.email || '',
        oldPassword: '',
        newPassword: '',
        confirmPassword: ''
      })
      setAvatarPreview(user.avatar || '')
      setCoverPreview(user.coverImage || '')
    }
  }, [user])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleAvatarChange = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file')
      return
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image must be less than 5MB')
      return
    }
    setAvatarFile(file)
    setAvatarPreview(URL.createObjectURL(file))
  }

  const handleCoverChange = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file')
      return
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image must be less than 5MB')
      return
    }
    setCoverFile(file)
    setCoverPreview(URL.createObjectURL(file))
  }

  const handleUpdateProfile = async (e) => {
    e.preventDefault()
    requireAuth(async () => {
      try {
        setLoading(true)
        const payload = {
          fullname: formData.fullname,
          username: formData.username,
          email: formData.email
        }
        const { data } = await api.patch('/user/update-account', payload)
        updateUser(data.data)
        toast.success('Profile updated successfully')
      } catch (err) {
        const msg = err.response?.data?.message || 'Failed to update profile'
        toast.error(msg)
      } finally {
        setLoading(false)
      }
    })
  }

  const handleUpdateAvatar = async () => {
    if (!avatarFile) return
    requireAuth(async () => {
      try {
        setLoading(true)
        const formData = new FormData()
        formData.append('avatar', avatarFile)
        const { data } = await api.patch('/user/update-avatar', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        })
        updateUser(data.data)
        setAvatarFile(null)
        toast.success('Avatar updated successfully')
      } catch (err) {
        const msg = err.response?.data?.message || 'Failed to update avatar'
        toast.error(msg)
      } finally {
        setLoading(false)
      }
    })
  }

  const handleUpdateCover = async () => {
    if (!coverFile) return
    requireAuth(async () => {
      try {
        setLoading(true)
        const formData = new FormData()
        formData.append('coverImage', coverFile)
        const { data } = await api.patch('/user/update-coverimage', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        })
        updateUser(data.data)
        setCoverFile(null)
        toast.success('Cover image updated successfully')
      } catch (err) {
        const msg = err.response?.data?.message || 'Failed to update cover image'
        toast.error(msg)
      } finally {
        setLoading(false)
      }
    })
  }

  const handleChangePassword = async (e) => {
    e.preventDefault()
    if (formData.newPassword !== formData.confirmPassword) {
      toast.error('Passwords do not match')
      return
    }
    if (formData.newPassword.length < 6) {
      toast.error('Password must be at least 6 characters')
      return
    }
    requireAuth(async () => {
      try {
        setLoading(true)
        await api.post('/user/change-password', {
          oldPassword: formData.oldPassword,
          newPassword: formData.newPassword
        })
        setFormData(prev => ({ ...prev, oldPassword: '', newPassword: '', confirmPassword: '' }))
        toast.success('Password changed successfully')
      } catch (err) {
        const msg = err.response?.data?.message || 'Failed to change password'
        toast.error(msg)
      } finally {
        setLoading(false)
      }
    })
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-12 h-12 border-4 border-gray-200 dark:border-gray-700 border-t-red-600 rounded-full animate-spin"></div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="space-y-6"
      >
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">Settings</h1>
          <p className="text-gray-600 dark:text-gray-400">Manage your account settings and preferences</p>
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-6">
          <div className="flex items-center gap-3 mb-6">
            <ImageIcon className="w-5 h-5 text-red-600" />
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Profile Images</h2>
          </div>

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Avatar
              </label>
              <div className="flex items-center gap-4">
                <div className="relative">
                  <img
                    src={avatarPreview}
                    alt="Avatar"
                    className="w-24 h-24 rounded-full object-cover border-2 border-gray-200 dark:border-gray-700"
                  />
                  {avatarFile && (
                    <button
                      onClick={() => {
                        setAvatarFile(null)
                        setAvatarPreview(user.avatar)
                      }}
                      className="absolute -top-2 -right-2 w-6 h-6 bg-red-600 text-white rounded-full flex items-center justify-center"
                    >
                      <X size={14} />
                    </button>
                  )}
                </div>
                <div className="flex-1">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarChange}
                    className="file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-red-50 file:text-red-700 hover:file:bg-red-100 dark:file:bg-gray-800 dark:file:text-gray-100"
                  />
                  {avatarFile && (
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={handleUpdateAvatar}
                      disabled={loading}
                      className="mt-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
                    >
                      <Save size={16} className="inline mr-2" />
                      Save Avatar
                    </motion.button>
                  )}
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Cover Image
              </label>
              <div className="flex items-center gap-4">
                <div className="relative w-48 h-24 rounded-lg overflow-hidden border-2 border-gray-200 dark:border-gray-700">
                  {coverPreview && (
                    <img src={coverPreview} alt="Cover" className="w-full h-full object-cover" />
                  )}
                  {coverFile && (
                    <button
                      onClick={() => {
                        setCoverFile(null)
                        setCoverPreview(user.coverImage || '')
                      }}
                      className="absolute top-2 right-2 w-6 h-6 bg-red-600 text-white rounded-full flex items-center justify-center"
                    >
                      <X size={14} />
                    </button>
                  )}
                </div>
                <div className="flex-1">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleCoverChange}
                    className="file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-gray-50 file:text-gray-700 hover:file:bg-gray-100 dark:file:bg-gray-800 dark:file:text-gray-100"
                  />
                  {coverFile && (
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={handleUpdateCover}
                      disabled={loading}
                      className="mt-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
                    >
                      <Save size={16} className="inline mr-2" />
                      Save Cover
                    </motion.button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-6">
          <div className="flex items-center gap-3 mb-6">
            <User className="w-5 h-5 text-red-600" />
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Account Information</h2>
          </div>

          <form onSubmit={handleUpdateProfile} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Full Name
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  name="fullname"
                  value={formData.fullname}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-red-500"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Username
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-red-500"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-red-500"
                  required
                />
              </div>
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={loading}
              className="w-full px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <Save size={18} />
              Update Profile
            </motion.button>
          </form>
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-6">
          <div className="flex items-center gap-3 mb-6">
            <Lock className="w-5 h-5 text-red-600" />
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Change Password</h2>
          </div>

          <form onSubmit={handleChangePassword} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Current Password
              </label>
              <input
                type="password"
                name="oldPassword"
                value={formData.oldPassword}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-red-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                New Password
              </label>
              <input
                type="password"
                name="newPassword"
                value={formData.newPassword}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-red-500"
                required
                minLength={6}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Confirm New Password
              </label>
              <input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-red-500"
                required
                minLength={6}
              />
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={loading}
              className="w-full px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <Lock size={18} />
              Change Password
            </motion.button>
          </form>

        {/* Danger Zone */}
        <div className="bg-red-50 dark:bg-red-900/20 rounded-lg border-2 border-red-200 dark:border-red-800 p-6">
          <div className="flex items-center gap-3 mb-6">
            <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400" />
            <h2 className="text-xl font-semibold text-red-900 dark:text-red-100">Danger Zone</h2>
          </div>

          <div className="space-y-4">
            <div className="flex items-start justify-between p-4 bg-white dark:bg-gray-900 rounded-lg border border-red-200 dark:border-red-800">
              <div className="flex-1">
                <h3 className="font-medium text-gray-900 dark:text-gray-100 mb-1">
                  Delete Account
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Permanently delete your account and all associated data. This action cannot be undone.
                </p>
              </div>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setDeleteAccountOpen(true)}
                className="ml-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2 text-sm whitespace-nowrap"
              >
                <Trash2 size={16} />
                Delete
              </motion.button>
            </div>
          </div>
        </div>

        {/* Delete Account Confirmation Modal */}
        {deleteAccountOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/50" onClick={() => setDeleteAccountOpen(false)} />
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="relative w-full max-w-md bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-6"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
                  <AlertTriangle className="w-6 h-6 text-red-600 dark:text-red-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Delete Account</h3>
              </div>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Are you absolutely sure you want to delete your account? This will:
              </p>
              <ul className="list-disc list-inside space-y-2 mb-6 text-sm text-gray-600 dark:text-gray-400">
                <li>Permanently delete all your videos</li>
                <li>Remove all your comments and likes</li>
                <li>Delete your playlists and watch history</li>
                <li>Remove your channel and profile</li>
              </ul>
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-6">
                <p className="text-sm text-red-800 dark:text-red-200 font-medium">
                  ⚠️ This action is permanent and cannot be undone!
                </p>
              </div>
              <div className="flex gap-3">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setDeleteAccountOpen(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                >
                  Cancel
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    toast.error('Account deletion is not implemented yet. Please contact support.')
                    setDeleteAccountOpen(false)
                  }}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  Yes, Delete My Account
                </motion.button>
              </div>
            </motion.div>
          </div>
        )}
        </div>
      </motion.div>
    </div>
  )
}

export default Settings

