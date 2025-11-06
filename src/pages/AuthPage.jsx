import React, { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import './AuthPage.css'

function AuthPage() {
  const { state, actions } = useAuth()
  const [isLogin, setIsLogin] = useState(true)
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    username: '',
    verificationCode: ''
  })
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalExplorations: 0,
    loading: true
  })

  // Fetch statistics on component mount
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const apiBaseUrl = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' 
          ? 'http://localhost:3001/api'
          : `${window.location.protocol}//${window.location.host}/api`
        
        console.log('📊 Fetching stats from:', `${apiBaseUrl}/stats/public`)
        const response = await fetch(`${apiBaseUrl}/stats/public`)
        const data = await response.json()
        
        console.log('📊 Stats response:', data)
        
        if (data.success) {
          console.log('✅ Stats loaded - Users:', data.totalUsers, 'Explorations:', data.totalExplorations)
          setStats({
            totalUsers: data.totalUsers || 0,
            totalExplorations: data.totalExplorations || 0,
            loading: false
          })
        } else {
          console.error('❌ Stats fetch failed:', data)
          setStats(prev => ({ ...prev, loading: false }))
        }
      } catch (error) {
        console.error('❌ Failed to fetch statistics:', error)
        setStats(prev => ({ ...prev, loading: false }))
      }
    }
    
    fetchStats()
  }, [])

  const handleInputChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (isLogin) {
      const result = await actions.login(formData.email, formData.password)
      if (result.success) {
        console.log('Login successful')
      }
    } else {
      if (state.registrationStep === 'register') {
        // Use email as username automatically
        const result = await actions.register({
          email: formData.email,
          password: formData.password,
          username: formData.email  // Set username to email
        })
        if (result.success) {
          console.log('Registration initiated, check email for verification')
        }
      } else if (state.registrationStep === 'verify') {
        const result = await actions.verifyEmail(formData.email, formData.verificationCode)
        if (result.success) {
          console.log('Email verified successfully')
        }
      }
    }
  }

  const switchMode = () => {
    setIsLogin(!isLogin)
    actions.clearError()
    actions.resetRegistration()
    setFormData({
      email: '',
      password: '',
      username: '',
      verificationCode: ''
    })
  }

  if (state.registrationStep === 'complete') {
    return (
      <div className="auth-container">
        <div className="auth-card success-card">
          <div className="success-icon">✅</div>
          <h2>Registration Complete!</h2>
          <p>Your email has been verified successfully. You can now log in to your account.</p>
          <button 
            className="button button-primary"
            onClick={() => {
              setIsLogin(true)
              actions.resetRegistration()
            }}
          >
            Go to Login
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="auth-container">
      {/* Statistics Card - Left */}
      <div className="stats-card">
        <h3 style={{ margin: '0 0 15px 0', fontSize: '2rem', color: 'white', textAlign: 'center', fontWeight: 'bold' }}>Community Stats</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
          <div className="stat-item">
            <div className="stat-icon">👥</div>
            <div className="stat-value">
              {stats.loading ? '...' : stats.totalUsers.toLocaleString()}
            </div>
            <div className="stat-label">Explorers</div>
          </div>
          <div className="stat-item">
            <div className="stat-icon">🔍</div>
            <div className="stat-value">
              {stats.loading ? '...' : stats.totalExplorations.toLocaleString()}
            </div>
            <div className="stat-label">Explorations</div>
          </div>
        </div>
      </div>

      {/* Auth Card - Right */}
      <div className="auth-card">
        <div className="auth-header">
          <h1>Archaeological Explorer</h1>
          <p>Discover the mysteries of ancient civilizations</p>
        </div>

        <div className="auth-tabs">
          <button 
            className={`tab-button ${isLogin ? 'active' : ''}`}
            onClick={() => setIsLogin(true)}
          >
            Login
          </button>
          <button 
            className={`tab-button ${!isLogin ? 'active' : ''}`}
            onClick={() => setIsLogin(false)}
          >
            Register
          </button>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          {state.error && (
            <div className="error-message">
              {state.error}
            </div>
          )}

          {isLogin ? (
            <LoginForm 
              formData={formData}
              onChange={handleInputChange}
              isLoading={state.isLoading}
            />
          ) : (
            <RegisterForm 
              formData={formData}
              onChange={handleInputChange}
              isLoading={state.isLoading}
              registrationStep={state.registrationStep}
            />
          )}

          <button 
            type="submit" 
            className="button button-primary button-full"
            disabled={state.isLoading}
          >
            {state.isLoading ? (
              <>
                <span className="spinner"></span>
                Processing...
              </>
            ) : (
              getSubmitButtonText(isLogin, state.registrationStep)
            )}
          </button>
        </form>
      </div>
    </div>
  )
}

function LoginForm({ formData, onChange, isLoading }) {
  return (
    <>
      <div className="form-group">
        <label htmlFor="email">Email Address</label>
        <input
          type="email"
          id="email"
          name="email"
          value={formData.email}
          onChange={onChange}
          required
          disabled={isLoading}
          placeholder="Enter your email"
        />
      </div>

      <div className="form-group">
        <label htmlFor="password">Password</label>
        <input
          type="password"
          id="password"
          name="password"
          value={formData.password}
          onChange={onChange}
          required
          disabled={isLoading}
          placeholder="Enter your password"
        />
      </div>
    </>
  )
}

function RegisterForm({ formData, onChange, isLoading, registrationStep }) {
  if (registrationStep === 'verify') {
    return (
      <>
        <div className="verification-info">
          <h3>Email Verification</h3>
          <p>We've sent a verification code to <strong>{formData.email}</strong></p>
          <p>Please check your email and enter the 6-digit code below:</p>
        </div>

        <div className="form-group">
          <label htmlFor="verificationCode">Verification Code</label>
          <input
            type="text"
            id="verificationCode"
            name="verificationCode"
            value={formData.verificationCode}
            onChange={onChange}
            required
            disabled={isLoading}
            placeholder="Enter 6-digit code"
            maxLength="6"
            pattern="[0-9]{6}"
          />
        </div>
      </>
    )
  }

  return (
    <>
      <div className="form-group">
        <label htmlFor="email">Email Address</label>
        <input
          type="email"
          id="email"
          name="email"
          value={formData.email}
          onChange={onChange}
          required
          disabled={isLoading}
          placeholder="Enter your email"
        />
      </div>

      <div className="form-group">
        <label htmlFor="password">Password</label>
        <input
          type="password"
          id="password"
          name="password"
          value={formData.password}
          onChange={onChange}
          required
          disabled={isLoading}
          placeholder="Create a password"
          minLength="6"
        />
      </div>
    </>
  )
}

function getSubmitButtonText(isLogin, registrationStep) {
  if (isLogin) return 'Login'
  if (registrationStep === 'verify') return 'Verify Email'
  return 'Register'
}

export default AuthPage