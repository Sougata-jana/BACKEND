import { createContext, useContext, useState, useEffect } from 'react'
import { api } from '../utils/api'
import toast from 'react-hot-toast'

const AuthContext = createContext({})

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  // Check if user is authenticated on app load
  useEffect(() => {
    checkAuthStatus()
  }, [])

  const checkAuthStatus = async () => {
    try {
      const token = localStorage.getItem('accessToken')
      if (!token) {
        setLoading(false)
        return
      }

      // Set the token in axios defaults
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`
      
      const response = await api.get('/users/current-user')
      setUser(response.data.data)
      setIsAuthenticated(true)
    } catch (error) {
      console.error('Auth check failed:', error)
      // Clear invalid token
      localStorage.removeItem('accessToken')
      localStorage.removeItem('refreshToken')
      delete api.defaults.headers.common['Authorization']
    } finally {
      setLoading(false)
    }
  }

  const login = async (credentials) => {
    try {
      setLoading(true)
      const response = await api.post('/users/login', credentials)
      
      const { user: userData, accessToken, refreshToken } = response.data.data
      
      // Store tokens
      localStorage.setItem('accessToken', accessToken)
      localStorage.setItem('refreshToken', refreshToken)
      
      // Set axios default header
      api.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`
      
      setUser(userData)
      setIsAuthenticated(true)
      
      toast.success('Welcome back!')
      return { success: true, user: userData }
    } catch (error) {
      const message = error.response?.data?.message || 'Login failed'
      toast.error(message)
      return { success: false, error: message }
    } finally {
      setLoading(false)
    }
  }

  const register = async (payload) => {
    // Accept either a plain object or a prebuilt FormData
    try {
      setLoading(true)
      let body
      let headers = {}

      if (payload instanceof FormData) {
        body = payload
        headers['Content-Type'] = 'multipart/form-data'
      } else {
        // Build FormData from object, expecting possible File objects at avatar and coverImage
        body = new FormData()
        Object.entries(payload || {}).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            body.append(key, value)
          }
        })
        headers['Content-Type'] = 'multipart/form-data'
      }

      const response = await api.post('/users/register', body, { headers })

      toast.success('Account created successfully!')
      return { success: true, data: response.data.data }
    } catch (error) {
      const message = error.response?.data?.message || 'Registration failed'
      toast.error(message)
      return { success: false, error: message }
    } finally {
      setLoading(false)
    }
  }

  const requireAuth = (onAuthed) => {
    if (!isAuthenticated) {
      toast.error('Please sign in to continue')
      window.location.href = '/login'
      return
    }
    onAuthed?.()
  }

  const logout = async () => {
    try {
      await api.post('/user/logout')
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      // Clear local state and storage
      localStorage.removeItem('accessToken')
      localStorage.removeItem('refreshToken')
      delete api.defaults.headers.common['Authorization']
      setUser(null)
      setIsAuthenticated(false)
      toast.success('Logged out successfully')
    }
  }

  const updateUser = (updatedUser) => {
    setUser(updatedUser)
  }

  const refreshToken = async () => {
    try {
      const refreshTokenValue = localStorage.getItem('refreshToken')
      if (!refreshTokenValue) {
        throw new Error('No refresh token')
      }

      const response = await api.post('/user/refresh-token', {
        refreshToken: refreshTokenValue
      })

      const { accessToken, refreshToken: newRefreshToken } = response.data.data
      
      localStorage.setItem('accessToken', accessToken)
      localStorage.setItem('refreshToken', newRefreshToken)
      api.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`
      
      return true
    } catch (error) {
      console.error('Token refresh failed:', error)
      logout()
      return false
    }
  }

  const value = {
    user,
    setUser,
    loading,
    isAuthenticated,
    setIsAuthenticated,
    login,
    register,
    logout,
    updateUser,
    requireAuth,
    refreshToken,
    checkAuthStatus
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}
