import React, { createContext, useContext, useReducer, useEffect } from 'react'
import axios from 'axios'

// API base URL - 自动适应环境
const getApiBaseUrl = () => {
  // 如果是开发环境
  if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    return 'http://localhost:3001/api'
  }
  // 生产环境：使用当前域名的/api路径
  return `${window.location.protocol}//${window.location.host}/api`
}

const API_BASE_URL = getApiBaseUrl()

// Auth context
const AuthContext = createContext()

// Initial auth state
const initialState = {
  user: null,
  token: localStorage.getItem('auth_token'),
  isAuthenticated: false,
  isLoading: true,
  error: null,
  registrationStep: 'register' // 'register', 'verify', 'complete'
}

// Action types
const AUTH_ACTIONS = {
  SET_LOADING: 'SET_LOADING',
  SET_ERROR: 'SET_ERROR',
  LOGIN_SUCCESS: 'LOGIN_SUCCESS',
  LOGOUT: 'LOGOUT',
  SET_REGISTRATION_STEP: 'SET_REGISTRATION_STEP',
  UPDATE_USER: 'UPDATE_USER'
}

// Auth reducer
function authReducer(state, action) {
  switch (action.type) {
    case AUTH_ACTIONS.SET_LOADING:
      return { ...state, isLoading: action.payload }
    
    case AUTH_ACTIONS.SET_ERROR:
      return { ...state, error: action.payload, isLoading: false }
    
    case AUTH_ACTIONS.LOGIN_SUCCESS:
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        isAuthenticated: true,
        isLoading: false,
        error: null
      }
    
    case AUTH_ACTIONS.LOGOUT:
      return {
        ...initialState,
        isLoading: false,
        token: null
      }
    
    case AUTH_ACTIONS.SET_REGISTRATION_STEP:
      return { ...state, registrationStep: action.payload }
    
    case AUTH_ACTIONS.UPDATE_USER:
      return {
        ...state,
        user: { ...state.user, ...action.payload }
      }
    
    default:
      return state
  }
}

// Configure axios interceptors
axios.defaults.baseURL = API_BASE_URL
axios.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Auth Provider Component
export function AuthProvider({ children }) {
  const [state, dispatch] = useReducer(authReducer, initialState)

  // Check authentication status on mount
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('auth_token')
      if (!token) {
        dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: false })
        return
      }

      try {
        const response = await axios.get('/user/profile')
        dispatch({
          type: AUTH_ACTIONS.LOGIN_SUCCESS,
          payload: {
            user: response.data.user,
            token
          }
        })
      } catch (error) {
        localStorage.removeItem('auth_token')
        dispatch({ type: AUTH_ACTIONS.LOGOUT })
      }
    }

    checkAuth()
  }, [])

  // Auth actions
  const actions = {
    // User registration
    register: async (userData) => {
      try {
        dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: true })
        dispatch({ type: AUTH_ACTIONS.SET_ERROR, payload: null })

        const response = await axios.post('/auth/register', userData)
        
        dispatch({ type: AUTH_ACTIONS.SET_REGISTRATION_STEP, payload: 'verify' })
        dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: false })
        
        return { success: true, message: response.data.message }
      } catch (error) {
        const errorMessage = error.response?.data?.error || 'Registration failed'
        dispatch({ type: AUTH_ACTIONS.SET_ERROR, payload: errorMessage })
        return { success: false, error: errorMessage }
      }
    },

    // Email verification
    verifyEmail: async (email, code) => {
      try {
        dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: true })
        dispatch({ type: AUTH_ACTIONS.SET_ERROR, payload: null })

        const response = await axios.post('/auth/verify-email', { email, code })
        
        dispatch({ type: AUTH_ACTIONS.SET_REGISTRATION_STEP, payload: 'complete' })
        dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: false })
        
        return { success: true, message: response.data.message }
      } catch (error) {
        const errorMessage = error.response?.data?.error || 'Verification failed'
        dispatch({ type: AUTH_ACTIONS.SET_ERROR, payload: errorMessage })
        return { success: false, error: errorMessage }
      }
    },

    // User login
    login: async (email, password) => {
      try {
        dispatch({ type: AUTH_ACTIONS.SET_LOADING, payload: true })
        dispatch({ type: AUTH_ACTIONS.SET_ERROR, payload: null })

        const response = await axios.post('/auth/login', { email, password })
        
        const { token, user } = response.data
        localStorage.setItem('auth_token', token)
        
        dispatch({
          type: AUTH_ACTIONS.LOGIN_SUCCESS,
          payload: { user, token }
        })
        
        return { success: true, user }
      } catch (error) {
        const errorMessage = error.response?.data?.error || 'Login failed'
        dispatch({ type: AUTH_ACTIONS.SET_ERROR, payload: errorMessage })
        return { success: false, error: errorMessage }
      }
    },

    // User logout
    logout: () => {
      localStorage.removeItem('auth_token')
      dispatch({ type: AUTH_ACTIONS.LOGOUT })
    },

    // Add discovery and experience
    addDiscovery: async (discoveryId, experienceGained) => {
      try {
        const response = await axios.post('/user/add-discovery', {
          discoveryId,
          experienceGained
        })

        // Update user experience and level
        dispatch({
          type: AUTH_ACTIONS.UPDATE_USER,
          payload: {
            experience: response.data.newExperience,
            level: response.data.newLevel
          }
        })

        return {
          success: true,
          ...response.data
        }
      } catch (error) {
        console.error('Failed to add discovery:', error)
        return { success: false, error: error.response?.data?.error }
      }
    },

    // Get user discoveries
    getUserDiscoveries: async () => {
      try {
        const response = await axios.get('/user/discoveries')
        return { success: true, discoveries: response.data.discoveries }
      } catch (error) {
        console.error('Failed to get discoveries:', error)
        return { success: false, error: error.response?.data?.error }
      }
    },

    // Get user statistics
    getUserStats: async () => {
      try {
        const response = await axios.get('/user/stats')
        return { success: true, stats: response.data }
      } catch (error) {
        console.error('Failed to get user stats:', error)
        return { success: false, error: error.response?.data?.error }
      }
    },

    // Clear errors
    clearError: () => {
      dispatch({ type: AUTH_ACTIONS.SET_ERROR, payload: null })
    },

    // Reset registration process
    resetRegistration: () => {
      dispatch({ type: AUTH_ACTIONS.SET_REGISTRATION_STEP, payload: 'register' })
      dispatch({ type: AUTH_ACTIONS.SET_ERROR, payload: null })
    }
  }

  return (
    <AuthContext.Provider value={{ state, actions }}>
      {children}
    </AuthContext.Provider>
  )
}

// Custom hook to use auth context
export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}