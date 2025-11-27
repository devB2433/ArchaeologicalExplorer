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
    demoVisits: 0,
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
          console.log('✅ Stats loaded - Users:', data.totalUsers, 'Demo Visits:', data.demoVisits, 'Explorations:', data.totalExplorations)
          setStats({
            totalUsers: data.totalUsers || 0,
            demoVisits: data.demoVisits || 0,
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

  const handleDemoMode = async () => {
    // Track demo visit
    try {
      const apiBaseUrl = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' 
        ? 'http://localhost:3001/api'
        : `${window.location.protocol}//${window.location.host}/api`
      
      await fetch(`${apiBaseUrl}/stats/track-demo`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      })
      console.log('🎮 Demo visit tracked')
    } catch (error) {
      console.error('❌ Failed to track demo visit:', error)
    }
    
    // Enter demo mode without authentication
    actions.enterDemoMode()
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
      {/* Top Stats Bar - Compact scrolling ticker */}
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.3)',
        backdropFilter: 'blur(10px)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
        padding: '16px 20px',
        zIndex: 1000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '40px',
        fontSize: '1rem',
        flexWrap: 'wrap',
        color: 'white'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ fontSize: '1.4rem' }}>👥</span>
          <span style={{ fontWeight: '700', fontSize: '1.1rem', color: 'white' }}>
            {stats.loading ? '...' : stats.totalUsers.toLocaleString()}
          </span>
          <span style={{ fontSize: '0.9rem', color: 'rgba(255, 255, 255, 0.9)' }}>Registered</span>
        </div>
        <div style={{ width: '1px', height: '22px', backgroundColor: 'rgba(255, 255, 255, 0.3)' }} />
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ fontSize: '1.4rem' }}>🎮</span>
          <span style={{ fontWeight: '700', fontSize: '1.1rem', color: 'white' }}>
            {stats.loading ? '...' : stats.demoVisits.toLocaleString()}
          </span>
          <span style={{ fontSize: '0.9rem', color: 'rgba(255, 255, 255, 0.9)' }}>Demo Visits</span>
        </div>
        <div style={{ width: '1px', height: '22px', backgroundColor: 'rgba(255, 255, 255, 0.3)' }} />
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ fontSize: '1.4rem' }}>🔍</span>
          <span style={{ fontWeight: '700', fontSize: '1.1rem', color: 'white' }}>
            {stats.loading ? '...' : stats.totalExplorations.toLocaleString()}
          </span>
          <span style={{ fontSize: '0.9rem', color: 'rgba(255, 255, 255, 0.9)' }}>Total Discoveries</span>
        </div>
      </div>

      {/* Two Column Layout - Demo Card + Auth Card */}
      <div style={{
        marginTop: '80px',
        display: 'flex',
        gap: '30px',
        width: '100%',
        maxWidth: '1000px',
        alignItems: 'stretch',
        flexWrap: 'wrap',
        justifyContent: 'center'
      }}>
        {/* Left: Demo Mode Card */}
        <div className="auth-card" style={{ 
          maxWidth: '450px',
          flex: '1 1 400px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          padding: '50px 40px'
        }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '4rem', marginBottom: '20px' }}>🎮</div>
            <h2 style={{ 
              color: 'white', 
              fontSize: '1.8rem', 
              marginBottom: '15px',
              fontWeight: 'bold'
            }}>
              Try Demo Mode
            </h2>
            <p style={{ 
              color: 'rgba(255, 255, 255, 0.8)', 
              fontSize: '1rem', 
              marginBottom: '30px',
              lineHeight: '1.6'
            }}>
              Explore ancient civilizations without signing up. Experience the full game immediately!
            </p>
            
            <button
              type="button"
              onClick={handleDemoMode}
              className="button"
              style={{
                width: '100%',
                backgroundColor: 'rgba(147, 112, 219, 0.35)',
                border: '2px solid rgba(147, 112, 219, 0.7)',
                color: '#f0e6ff',
                padding: '18px',
                fontSize: '1.15rem',
                fontWeight: 'bold',
                transition: 'all 0.3s ease',
                borderRadius: '12px'
              }}
              onMouseEnter={(e) => {
                e.target.style.backgroundColor = 'rgba(147, 112, 219, 0.5)'
                e.target.style.borderColor = 'rgba(147, 112, 219, 1)'
                e.target.style.transform = 'translateY(-2px)'
                e.target.style.boxShadow = '0 8px 20px rgba(147, 112, 219, 0.3)'
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = 'rgba(147, 112, 219, 0.35)'
                e.target.style.borderColor = 'rgba(147, 112, 219, 0.7)'
                e.target.style.transform = 'translateY(0)'
                e.target.style.boxShadow = 'none'
              }}
            >
              Start Exploring Now
            </button>
            
            <p style={{ 
              margin: '15px 0 0 0', 
              fontSize: '0.8rem', 
              opacity: 0.6,
              fontStyle: 'italic',
              color: 'rgba(255, 255, 255, 0.7)'
            }}>
              ⚠️ Demo progress won't be saved
            </p>
          </div>
        </div>

        {/* Right: Login/Register Card */}
        <div className="auth-card" style={{ 
          maxWidth: '450px',
          flex: '1 1 400px'
        }}>
          <div className="auth-header">
            <h1 style={{ fontSize: '1.8rem', marginBottom: '8px' }}>Archaeological Explorer</h1>
            <p style={{ fontSize: '0.95rem', opacity: 0.85 }}>Sign in to save your discoveries</p>
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
            style={{
              padding: '14px',
              fontSize: '1.05rem'
            }}
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