import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useGame } from '../contexts/GameContext'
import { useAuth } from '../contexts/AuthContext'

function Navigation() {
  const { state } = useGame()
  const { state: authState, actions: authActions } = useAuth()
  const location = useLocation()

  const navItems = [
    { path: '/', label: 'Home' },
    { path: '/exploration', label: 'Exploration' },
    { path: '/inventory', label: 'Inventory' },
    { path: '/gallery', label: 'Gallery' }
  ]

  return (
    <nav className="nav">
      <div className="nav-container">
        <div className="nav-title">
          Archaeological Explorer
        </div>
        
        <ul className="nav-links">
          {navItems.map(item => (
            <li key={item.path}>
              <Link 
                to={item.path} 
                className={`nav-link ${location.pathname === item.path ? 'active' : ''}`}
              >
                {item.label}
              </Link>
            </li>
          ))}
        </ul>

        {authState.isAuthenticated && authState.user && (
          <div className="user-info">
            {authState.user.isDemo && (
              <div style={{
                marginRight: '15px',
                padding: '6px 12px',
                backgroundColor: 'rgba(245, 158, 11, 0.2)',
                border: '1px solid rgba(245, 158, 11, 0.5)',
                borderRadius: '6px',
                fontSize: '0.85rem',
                color: '#f59e0b',
                fontWeight: 'bold'
              }}>
                🎮 DEMO MODE
              </div>
            )}
            <div className="user-level">
              <span className="level-badge">Lv.{authState.user.level}</span>
              <span className="username">{authState.user.username}</span>
            </div>
            <div className="user-exp">
              <div className="exp-text">
                {authState.user.experience} EXP
              </div>
              {state.levelSystem && (
                <div className="exp-bar">
                  <div 
                    className="exp-progress" 
                    style={{ 
                      width: `${state.levelSystem.getProgressToNextLevel(
                        authState.user.experience, 
                        authState.user.level
                      ) * 100}%` 
                    }}
                  />
                </div>
              )}
            </div>
            <button 
              className="logout-btn"
              onClick={authActions.logout}
              title="Logout"
            >
              🚪
            </button>
          </div>
        )}
      </div>
    </nav>
  )
}

export default Navigation