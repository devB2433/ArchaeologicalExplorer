import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useGame } from '../contexts/GameContext'
import { useAuth } from '../contexts/AuthContext'

function Navigation() {
  const { state } = useGame()
  const { state: authState, actions: authActions } = useAuth()
  const location = useLocation()
  const uiTexts = state.uiTexts.navigation || {}

  const navItems = [
    { path: '/', label: uiTexts.home || 'Home' },
    { path: '/exploration', label: uiTexts.exploration || 'Exploration' },
    { path: '/inventory', label: uiTexts.inventory || 'Inventory' },
    { path: '/gallery', label: uiTexts.gallery || 'Gallery' }
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