import React from 'react'
import { useAuth } from '../contexts/AuthContext'

function ProtectedRoute({ children }) {
  const { state } = useAuth()

  if (state.isLoading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
        <span style={{ marginLeft: '10px' }}>Checking authentication...</span>
      </div>
    )
  }

  if (!state.isAuthenticated) {
    return (
      <div className="container">
        <div className="card">
          <h2>Access Denied</h2>
          <p>Please log in to access this page.</p>
        </div>
      </div>
    )
  }

  return children
}

export default ProtectedRoute