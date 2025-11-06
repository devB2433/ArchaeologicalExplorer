import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useGame } from '../contexts/GameContext'
import { useAuth } from '../contexts/AuthContext'

function HomePage() {
  const { state } = useGame()
  const { state: authState, actions: authActions } = useAuth()
  const [userStats, setUserStats] = useState(null)

  // Load user statistics when authenticated
  useEffect(() => {
    if (authState.isAuthenticated) {
      authActions.getUserStats().then(result => {
        if (result.success) {
          setUserStats(result.stats)
        }
      })
    } else {
      setUserStats(null)
    }
  }, [authState.isAuthenticated])

  if (state.isLoading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
        <span style={{ marginLeft: '10px' }}>Loading Archaeological Explorer...</span>
      </div>
    )
  }

  if (state.error) {
    return (
      <div className="container">
        <div className="card">
          <h2>Error Loading Game</h2>
          <p>There was an error loading the game data: {state.error}</p>
          <button 
            className="button" 
            onClick={() => window.location.reload()}
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  const totalRuins = state.ruins.length
  const collectedDiscoveries = authState.isAuthenticated && userStats ? 
    userStats.discoveryCount : state.discoveryCollection.length
  const totalItems = state.items.length
  const ownedItems = state.playerData.ownedItems.length

  return (
    <div className="container">
      <div className="home-hero">
        <h1 className="home-title">Archaeological Explorer</h1>
        <p className="home-subtitle">
          Embark on archaeological expeditions to discover ancient artifacts and unlock the secrets of the past
        </p>
        <Link to="/exploration" className="home-cta">
          Start Exploring
        </Link>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px', marginTop: '40px' }}>
        <div className="card">
          <h3>Your Progress</h3>
          <div style={{ marginTop: '15px' }}>
            <div style={{ marginBottom: '10px' }}>
              <strong>Discoveries:</strong> {collectedDiscoveries} / {totalRuins}
            </div>
            <div style={{ marginBottom: '10px' }}>
              <strong>Items Owned:</strong> {ownedItems} / {totalItems}
            </div>
            <div style={{ marginBottom: '15px' }}>
              <strong>Sites Unlocked:</strong> {state.playerData.unlockedSites.length}
            </div>
            
            {/* Experience Progress Bar */}
            {authState.user && state.levelSystem && (
              <div style={{ marginTop: '15px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                  <span><strong>Level {authState.user.level}</strong></span>
                  <span>{authState.user.experience} EXP</span>
                </div>
                <div style={{
                  width: '100%',
                  height: '8px',
                  backgroundColor: 'rgba(255, 255, 255, 0.2)',
                  borderRadius: '4px',
                  overflow: 'hidden'
                }}>
                  <div style={{
                    width: `${state.levelSystem.getProgressToNextLevel(authState.user.experience, authState.user.level) * 100}%`,
                    height: '100%',
                    backgroundColor: '#10b981',
                    transition: 'width 0.3s ease'
                  }} />
                </div>
                <div style={{ fontSize: '0.8rem', opacity: '0.8', marginTop: '5px' }}>
                  {state.levelSystem.getExpForNextLevel(authState.user.level) ? 
                    `Next level: ${state.levelSystem.getExpForNextLevel(authState.user.level)} EXP` :
                    'Max level reached!'
                  }
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="card">
          <h3>Quick Actions</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '15px' }}>
            <Link to="/exploration" className="button" style={{ textDecoration: 'none', textAlign: 'center' }}>
              New Exploration
            </Link>
            <Link to="/inventory" className="button" style={{ textDecoration: 'none', textAlign: 'center' }}>
              Manage Items
            </Link>
            <Link to="/gallery" className="button" style={{ textDecoration: 'none', textAlign: 'center' }}>
              View Collection
            </Link>
          </div>
          
          {/* Beginner Tips */}
          {authState.user?.level <= 3 && (
            <div style={{ 
              marginTop: '20px', 
              padding: '15px', 
              backgroundColor: 'rgba(16, 185, 129, 0.1)', 
              borderRadius: '8px',
              border: '1px solid rgba(16, 185, 129, 0.2)'
            }}>
              <h4 style={{ margin: '0 0 10px 0', color: '#10b981' }}>💡 Beginner Tips</h4>
              <ul style={{ margin: '0', paddingLeft: '20px', fontSize: '0.9rem', lineHeight: '1.5' }}>
                <li>Earn experience points with every exploration!</li>
                <li>Hidden discoveries grant bonus experience</li>
                <li>Level up to unlock new tools and sites</li>
                {authState.user?.level === 1 && <li><strong>Tip: Complete 2-3 explorations to reach Level 2!</strong></li>}
              </ul>
            </div>
          )}
        </div>

        <div className="card">
          <h3>Recent Activity</h3>
          <div style={{ marginTop: '15px' }}>
            {authState.isAuthenticated && userStats ? (
              <div>
                <p>Total discoveries: {userStats.discoveryCount}</p>
                {userStats.lastExploration && (
                  <p>Last exploration: {new Date(userStats.lastExploration).toLocaleDateString()}</p>
                )}
              </div>
            ) : state.explorationHistory.length > 0 ? (
              <div>
                <p>Last exploration: {new Date(state.explorationHistory[state.explorationHistory.length - 1].timestamp).toLocaleDateString()}</p>
                <p>Local expeditions: {state.explorationHistory.length}</p>
                <p style={{ fontSize: '0.9rem', opacity: '0.8' }}>Note: Login to save your progress permanently.</p>
              </div>
            ) : (
              <p>No explorations yet. Start your first expedition!</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default HomePage