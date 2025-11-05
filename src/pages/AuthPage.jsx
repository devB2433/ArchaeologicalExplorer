import React, { useState } from 'react'
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
        const result = await actions.register({
          email: formData.email,
          password: formData.password,
          username: formData.username
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

        <div className="auth-footer">
          <button 
            className="link-button"
            onClick={switchMode}
            disabled={state.isLoading}
          >
            {isLogin 
              ? "Don't have an account? Register here"
              : "Already have an account? Login here"
            }
          </button>
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
          <p>Please enter the 6-digit code below:</p>
          <div className="dev-mode-notice">
            <p><strong>开发模式提示：</strong></p>
            <p>📧 如果没有配置邮箱服务，验证码会显示在服务器控制台中</p>
            <p>🔍 请查看运行 <code>node server/index.js</code> 的终端窗口</p>
            <button 
              type="button" 
              className="debug-button"
              onClick={() => {
                // 使用动态API地址
                const apiBaseUrl = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' 
                  ? 'http://localhost:3001/api'
                  : `${window.location.protocol}//${window.location.host}/api`
                
                // Open browser console to show debug info
                fetch(`${apiBaseUrl}/auth/debug-codes/${formData.email}`)
                  .then(res => res.json())
                  .then(data => {
                    console.log('验证码调试信息:', data)
                    alert('验证码信息已输出到浏览器控制台（F12查看）')
                  })
                  .catch(err => console.error('调试失败:', err))
              }}
            >
              🔍 调试验证码
            </button>
          </div>
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
        <label htmlFor="username">Username</label>
        <input
          type="text"
          id="username"
          name="username"
          value={formData.username}
          onChange={onChange}
          required
          disabled={isLoading}
          placeholder="Choose a username"
        />
      </div>

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