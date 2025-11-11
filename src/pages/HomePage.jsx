import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useGame } from '../contexts/GameContext'
import { useAuth } from '../contexts/AuthContext'
import TutorialGuide from '../components/TutorialGuide'

// World Map Component with ruins markers
function WorldMap({ ruins, discoveredRuinIds }) {
  const [hoveredRuin, setHoveredRuin] = useState(null);
  const navigate = useNavigate();

  // Coordinates for each country/site on the world map (percentage-based positioning)
  const siteCoordinates = {
    site_egypt: { x: 54.5, y: 35.4 },   // Northeast Africa
    site_china: { x: 80.7, y: 32.2 },   // East Asia
    site_greece: { x: 55, y: 23.4 }     // Southern Europe
  };

  // Handle marker click - navigate to gallery with hash
  const handleMarkerClick = (siteId) => {
    navigate(`/gallery#${siteId}`);
  };

  return (
    <div style={{
      position: 'relative',
      width: '100%',
      height: '500px',
      backgroundColor: '#b8d8e8',
      borderRadius: '15px',
      overflow: 'hidden',
      border: '1px solid rgba(139, 111, 71, 0.3)'
    }}>
      {/* World Map Background Image */}
      <img 
        src="/assets/images/green-global-maps-vector.jpg"
        alt="World Map"
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          position: 'absolute',
          top: 0,
          left: 0,
          pointerEvents: 'none'
        }}
        onError={(e) => {
          e.target.style.display = 'none';
        }}
      />

      {/* Ruins Markers - Group by site */}
      {Object.keys(siteCoordinates).map(siteId => {
        const siteRuins = ruins.filter(r => r.siteId === siteId);
        if (siteRuins.length === 0) return null;

        const coord = siteCoordinates[siteId];
        const discoveredCount = siteRuins.filter(r => discoveredRuinIds.includes(r.ruinId)).length;
        const totalCount = siteRuins.length;
        const allDiscovered = discoveredCount === totalCount;
        const isHovered = hoveredRuin === siteId;

        return (
          <div
            key={siteId}
            onClick={() => handleMarkerClick(siteId)}
            onMouseEnter={() => setHoveredRuin(siteId)}
            onMouseLeave={() => setHoveredRuin(null)}
            style={{
              position: 'absolute',
              left: `${coord.x}%`,
              top: `${coord.y}%`,
              transform: 'translate(-50%, -50%)',
              cursor: 'pointer',
              zIndex: isHovered ? 10 : 1
            }}
          >
            {/* Marker Pin */}
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: '50% 50% 50% 0',
              backgroundColor: allDiscovered ? '#10b981' : '#9ca3af',
              border: `3px solid ${allDiscovered ? '#059669' : '#6b7280'}`,
              transform: 'rotate(-45deg)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: isHovered ? '0 6px 16px rgba(0,0,0,0.4)' : '0 3px 8px rgba(0,0,0,0.3)',
              transition: 'all 0.2s',
              animation: isHovered ? 'bounce 0.5s ease infinite' : 'none'
            }}>
              <span style={{
                transform: 'rotate(45deg)',
                fontSize: '14px',
                color: 'white',
                fontWeight: 'bold'
              }}>
                {discoveredCount}/{totalCount}
              </span>
            </div>

            {/* Tooltip */}
            {isHovered && (
              <div style={{
                position: 'absolute',
                bottom: '100%',
                left: '50%',
                transform: 'translateX(-50%)',
                marginBottom: '12px',
                padding: '10px 14px',
                backgroundColor: 'rgba(62, 39, 35, 0.95)',
                color: '#f5f5dc',
                borderRadius: '8px',
                fontSize: '0.85rem',
                whiteSpace: 'nowrap',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
                zIndex: 100,
                pointerEvents: 'none'
              }}>
                <div style={{ fontWeight: 'bold' }}>
                  {siteId === 'site_egypt' ? '🇪🇬 Egypt' : 
                   siteId === 'site_china' ? '🇨🇳 China' : 
                   siteId === 'site_greece' ? '🇬🇷 Greece' : siteId}
                </div>
                <div style={{ fontSize: '0.75rem', opacity: 0.8 }}>
                  {discoveredCount} / {totalCount} ruins discovered
                </div>
                {/* Arrow */}
                <div style={{
                  position: 'absolute',
                  top: '100%',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  width: 0,
                  height: 0,
                  borderLeft: '6px solid transparent',
                  borderRight: '6px solid transparent',
                  borderTop: '6px solid rgba(62, 39, 35, 0.95)'
                }} />
              </div>
            )}
          </div>
        );
      })}

      {/* Map Legend */}
      <div style={{
        position: 'absolute',
        bottom: '15px',
        right: '15px',
        display: 'flex',
        gap: '15px',
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        padding: '10px 15px',
        borderRadius: '8px',
        fontSize: '0.8rem',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <div style={{
            width: '12px',
            height: '12px',
            borderRadius: '50%',
            backgroundColor: '#10b981'
          }} />
          <span>Discovered</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <div style={{
            width: '12px',
            height: '12px',
            borderRadius: '50%',
            backgroundColor: '#9ca3af'
          }} />
          <span>Undiscovered</span>
        </div>
      </div>

      {/* CSS Animation for bounce effect */}
      <style>{`
        @keyframes bounce {
          0%, 100% { transform: rotate(-45deg) translateY(0); }
          50% { transform: rotate(-45deg) translateY(-4px); }
        }
      `}</style>
    </div>
  );
}

function HomePage() {
  const { state } = useGame()
  const { state: authState, actions: authActions } = useAuth()
  const [userStats, setUserStats] = useState(null)
  const [showTutorial, setShowTutorial] = useState(false)

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
  }, [authState.isAuthenticated, state.discoveryCollection.length]) // Re-fetch when discoveries change

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

  // Get discovered ruin IDs - use latest data from GameContext
  const discoveredRuinIds = state.discoveryCollection.map(d => d.discoveryId);

  // Handler to restart tutorial
  const handleRestartTutorial = () => {
    localStorage.removeItem('hasSeenTutorial')
    setShowTutorial(true)
  }

  return (
    <div className="container">
      {/* Tutorial Guide for new players or manually triggered */}
      {(authState.user?.level === 1 || showTutorial) && (
        <TutorialGuide 
          forceShow={showTutorial} 
          onComplete={() => setShowTutorial(false)} 
        />
      )}

      {/* Tutorial Restart Button - Only for Level 1-2 */}
      {authState.user && authState.user.level <= 2 && (
        <div className="card" style={{ 
          marginTop: '20px',
          marginBottom: '10px',
          padding: '15px 20px',
          backgroundColor: 'rgba(139, 111, 71, 0.15)',
          border: '1px solid rgba(139, 111, 71, 0.3)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '15px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ fontSize: '1.5rem' }}>🎓</span>
            <div>
              <div style={{ fontWeight: 'bold', fontSize: '0.95rem' }}>New to Archaeological Explorer?</div>
              <div style={{ fontSize: '0.8rem', opacity: 0.7, marginTop: '2px' }}>Learn the basics with our interactive tutorial</div>
            </div>
          </div>
          <button
            onClick={handleRestartTutorial}
            className="button"
            style={{
              backgroundColor: '#8b6f47',
              border: 'none',
              color: '#f5f5dc',
              fontSize: '0.85rem',
              padding: '8px 16px',
              whiteSpace: 'nowrap'
            }}
          >
            Start Guide
          </button>
        </div>
      )}

      {/* World Map Section */}
      <div className="card world-map-card" style={{ marginTop: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h2 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '10px' }}>
            🌍 World Map
            <span style={{ fontSize: '0.9rem', fontWeight: 'normal', opacity: 0.7 }}>
              ({collectedDiscoveries} / {totalRuins} discovered)
            </span>
          </h2>
          <Link to="/exploration" className="button" style={{ textDecoration: 'none' }}>
            Start Exploring
          </Link>
        </div>
        <WorldMap ruins={state.ruins} discoveredRuinIds={discoveredRuinIds} />
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