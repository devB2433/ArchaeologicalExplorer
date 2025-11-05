import React, { useState, useEffect } from 'react'
import { useGame } from '../contexts/GameContext'
import { useAuth } from '../contexts/AuthContext'
import { GameEngine } from '../utils/gameEngine'

function ExplorationPage() {
  const { state, actions } = useGame()
  const { actions: authActions } = useAuth()
  const [selectedItems, setSelectedItems] = useState([])
  const [isExploring, setIsExploring] = useState(false)
  const [explorationResult, setExplorationResult] = useState(null)
  const [gameEngine, setGameEngine] = useState(null)
  const [preview, setPreview] = useState(null)
  const [levelUpInfo, setLevelUpInfo] = useState(null)

  // Initialize game engine when data is loaded
  useEffect(() => {
    if (!state.isLoading && state.items.length > 0) {
      const engine = new GameEngine(state)
      setGameEngine(engine)
      
      // Validate game data
      const validation = engine.validateGameData()
      if (!validation.isValid) {
        console.warn('Game data validation errors:', validation.errors)
      }
    }
  }, [state.isLoading, state.items, state.routes, state.discoveries])

  // Update preview when selected items change
  useEffect(() => {
    if (gameEngine && selectedItems.length > 0) {
      const previewData = gameEngine.getExplorationPreview(selectedItems)
      setPreview(previewData)
      actions.setCurrentRoute(previewData.matchedRoute)
    } else {
      setPreview(null)
      actions.setCurrentRoute(null)
    }
  }, [selectedItems, gameEngine])

  const uiTexts = state.uiTexts.exploration || {}

  if (state.isLoading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
        <span style={{ marginLeft: '10px' }}>Loading exploration...</span>
      </div>
    )
  }

  const ownedItems = state.items.filter(item => actions.isItemOwned(item.itemId))

  const handleItemToggle = (itemId) => {
    setSelectedItems(prev => 
      prev.includes(itemId) 
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    )
  }

  const handleStartExploration = async () => {
    if (!gameEngine || selectedItems.length === 0) return

    setIsExploring(true)
    setExplorationResult(null)

    // Simulate exploration time (2 seconds)
    setTimeout(async () => {
      const result = await gameEngine.executeExploration(selectedItems)
      
      if (result.success) {
        // Add discovery to local collection
        const discoveryInfo = actions.addDiscovery(result.discovery.discoveryId)
        
        // Add experience to user account
        if (discoveryInfo?.experienceGained) {
          const expResult = await authActions.addDiscovery(
            result.discovery.discoveryId, 
            discoveryInfo.experienceGained
          )
          
          if (expResult.success && expResult.levelUp) {
            const levelSystem = actions.getLevelSystem()
            if (levelSystem) {
              const levelUpRewards = levelSystem.getLevelUpRewards(expResult.newLevel)
              console.log('Setting level up info:', levelUpRewards)
              setLevelUpInfo(levelUpRewards)
            }
          }
        }
        
        // Add exploration record
        actions.addExplorationRecord(
          result.route.routeId,
          selectedItems,
          result.discovery.discoveryId
        )
      }
      
      setExplorationResult(result)
      setIsExploring(false)
    }, 2000)
  }

  const resetExploration = () => {
    setExplorationResult(null)
    setLevelUpInfo(null)
    setSelectedItems([])
    setPreview(null)
  }

  return (
    <div className="container">
      <h1>{uiTexts.exploration || 'Exploration'}</h1>

      {!explorationResult && (
        <>
          <div className="card">
            <h2>{uiTexts.selectItems || 'Select Items'}</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '10px', marginTop: '20px' }}>
              {ownedItems.map(item => (
                <ItemSelector
                  key={item.itemId}
                  item={item}
                  isSelected={selectedItems.includes(item.itemId)}
                  onToggle={() => handleItemToggle(item.itemId)}
                />
              ))}
            </div>
          </div>

          {preview && (
            <div className="card">
              <h2>{uiTexts.explorationPreview || 'Exploration Preview'}</h2>
              <ExplorationPreview preview={preview} uiTexts={uiTexts} />
            </div>
          )}

          <div className="card">
            <button
              className="button"
              onClick={handleStartExploration}
              disabled={selectedItems.length === 0 || !preview?.canExplore || isExploring}
              style={{ width: '100%', padding: '15px', fontSize: '1.1rem' }}
            >
              {isExploring ? (
                <>
                  <span className="spinner" style={{ width: '20px', height: '20px', marginRight: '10px' }}></span>
                  Exploring...
                </>
              ) : (
                uiTexts.startExploration || 'Start Exploration'
              )}
            </button>
            
            {selectedItems.length === 0 && (
              <p style={{ textAlign: 'center', marginTop: '10px', color: '#f59e0b' }}>
                {uiTexts.selectAtLeastOne || 'Please select at least one item to begin exploration'}
              </p>
            )}
            
            {selectedItems.length > 0 && !preview?.canExplore && (
              <p style={{ textAlign: 'center', marginTop: '10px', color: '#ef4444' }}>
                {uiTexts.noRouteFound || 'No suitable exploration route found with current equipment'}
              </p>
            )}
          </div>
        </>
      )}

      {explorationResult && (
        <ExplorationResult 
          result={explorationResult} 
          onReset={resetExploration}
          uiTexts={uiTexts}
          actions={actions}
          levelUpInfo={levelUpInfo}
          onCloseLevelUp={() => setLevelUpInfo(null)}
        />
      )}

      {/* Level Up Modal */}
      {levelUpInfo && (
        <LevelUpModal 
          levelInfo={levelUpInfo} 
          onClose={() => {
            console.log('Main component: Closing level up modal')
            setLevelUpInfo(null)
          }} 
        />
      )}
    </div>
  )
}

function ItemSelector({ item, isSelected, onToggle }) {
  return (
    <div 
      className="card" 
      onClick={onToggle}
      title={`${item.itemName}\nWeight: ${item.explorationWeight}`}
      style={{ 
        padding: '15px',
        cursor: 'pointer',
        border: isSelected ? '2px solid #10b981' : '1px solid rgba(255, 255, 255, 0.2)',
        backgroundColor: isSelected ? 'rgba(16, 185, 129, 0.1)' : undefined,
        transition: 'all 0.2s',
        position: 'relative'
      }}
    >
      {/* 左上角选择标记 */}
      <div style={{ 
        position: 'absolute',
        top: '10px',
        left: '10px',
        width: '28px', 
        height: '28px', 
        borderRadius: '50%',
        border: '2px solid #10b981',
        backgroundColor: isSelected ? '#10b981' : 'transparent',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 10
      }}>
        {isSelected && <span style={{ color: 'white', fontSize: '16px' }}>✓</span>}
      </div>

      {/* 超大圆形图标 - 白色背景 */}
      <div style={{ 
        width: '160px', 
        height: '160px',
        borderRadius: '50%',
        overflow: 'hidden',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        margin: '0 auto',
        backgroundColor: 'white'
      }}>
        <img 
          src={item.itemIcon || '/assets/images/items/placeholder.svg'} 
          alt={item.itemName}
          style={{ 
            width: '100%', 
            height: '100%',
            objectFit: 'cover',
            filter: isSelected ? 'drop-shadow(0 0 10px rgba(16, 185, 129, 0.5))' : 'none'
          }}
          onError={(e) => e.target.src = '/assets/images/items/placeholder.svg'}
        />
      </div>
    </div>
  )
}

function ExplorationPreview({ preview, uiTexts }) {
  const route = preview.matchedRoute

  return (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '20px' }}>
        <div>
          <strong>{uiTexts.equipmentWeight || 'Equipment Weight'}:</strong>
          <div style={{ fontSize: '1.5rem', color: '#10b981', fontWeight: 'bold' }}>
            {preview.totalWeight}
          </div>
        </div>
        <div>
          <strong>Exploration Level:</strong>
          <div style={{ fontSize: '1.5rem', color: '#8b5cf6', fontWeight: 'bold' }}>
            {preview.explorationLevel}
          </div>
        </div>
      </div>

      {route && (
        <div>
          <h3>Matched Route: {route.routeName}</h3>
          <p>{route.routeDescription}</p>
          
          <div style={{ marginTop: '15px' }}>
            <strong>{uiTexts.accessibleAreas || 'Accessible Areas'}:</strong>
            <div style={{ marginTop: '5px' }}>
              {route.accessibleAreas?.map((area, index) => (
                <span 
                  key={index}
                  style={{ 
                    display: 'inline-block',
                    backgroundColor: 'rgba(139, 92, 246, 0.2)',
                    color: '#a855f7',
                    padding: '4px 8px',
                    borderRadius: '12px',
                    fontSize: '0.8rem',
                    marginRight: '8px',
                    marginBottom: '4px'
                  }}
                >
                  {area}
                </span>
              ))}
            </div>
          </div>

          <div style={{ marginTop: '15px' }}>
            <strong>Hidden Discovery Probability:</strong>
            <span style={{ marginLeft: '8px', color: '#f59e0b' }}>
              {Math.round((route.hiddenDiscoveryProbability || 0) * 100)}%
            </span>
          </div>
        </div>
      )}
    </div>
  )
}

function ExplorationResult({ result, onReset, uiTexts, actions, levelUpInfo, onCloseLevelUp }) {
  if (!result.success) {
    return (
      <div className="card">
        <h2>Exploration Failed</h2>
        <p style={{ color: '#ef4444' }}>{result.error}</p>
        <button className="button" onClick={onReset}>
          Try Again
        </button>
      </div>
    )
  }

  const discovery = result.discovery
  const route = result.route
  const site = actions.getSite(route.targetSiteId)

  return (
    <div className="card">
      <h2 style={{ color: '#10b981' }}>
        {uiTexts.explorationComplete || 'Exploration Complete!'}
      </h2>
      
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '20px', marginTop: '20px' }}>
        <div style={{ 
          width: '100%', 
          height: '200px', 
          backgroundColor: '#374151',
          borderRadius: '8px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden'
        }}>
          <img 
            src={discovery.discoveryImage || '/assets/images/discoveries/placeholder.svg'} 
            alt={discovery.discoveryName}
            style={{ 
              width: '100%', 
              height: '100%', 
              objectFit: 'cover' 
            }}
            onError={(e) => e.target.src = '/assets/images/discoveries/placeholder.svg'}
          />
        </div>
        
        <div>
          <h3 style={{ margin: '0 0 10px 0', display: 'flex', alignItems: 'center', gap: '10px' }}>
            {discovery.discoveryName}
            {discovery.isHidden && (
              <span style={{ 
                backgroundColor: '#f59e0b',
                color: 'white',
                padding: '4px 8px',
                borderRadius: '12px',
                fontSize: '0.75rem',
                fontWeight: 'bold'
              }}>
                ⭐ HIDDEN
              </span>
            )}
          </h3>
          
          <p style={{ marginBottom: '15px', opacity: 0.8 }}>
            Found at: {site?.siteName || 'Unknown Site'}
          </p>
          
          <p style={{ lineHeight: '1.6', marginBottom: '20px' }}>
            {discovery.discoveryDescription}
          </p>
          
          <div style={{ 
            padding: '15px',
            backgroundColor: 'rgba(16, 185, 129, 0.1)',
            borderRadius: '8px',
            marginBottom: '20px'
          }}>
            <strong>Route:</strong> {route.routeName}<br/>
            <strong>Exploration Level:</strong> {result.explorationData?.totalWeight >= 7 ? 'Deep' : result.explorationData?.totalWeight >= 4 ? 'Moderate' : 'Surface'}
          </div>
        </div>
      </div>

      <div style={{ textAlign: 'center', marginTop: '20px' }}>
        <button className="button" onClick={onReset} style={{ marginRight: '10px' }}>
          New Exploration
        </button>
        <button 
          className="button" 
          onClick={() => window.location.href = '/gallery'}
          style={{ backgroundColor: '#8b5cf6' }}
        >
          View in Gallery
        </button>
      </div>
    </div>
  )
}

function LevelUpModal({ levelInfo, onClose }) {
  const { state } = useGame()
  
  // Add error handling and default values as per configuration tolerance requirements
  const handleClose = () => {
    console.log('LevelUpModal: handleClose called')
    try {
      if (typeof onClose === 'function') {
        console.log('LevelUpModal: Calling onClose function')
        onClose()
      } else {
        console.warn('LevelUpModal: onClose is not a function', typeof onClose)
      }
    } catch (error) {
      console.error('LevelUpModal: Error in onClose handler:', error)
    }
  }
  
  useEffect(() => {
    // Auto close after 5 seconds
    const timer = setTimeout(handleClose, 5000)
    return () => clearTimeout(timer)
  }, [onClose])

  // Validate levelInfo to prevent crashes
  if (!levelInfo) {
    console.warn('LevelUpModal: levelInfo is null or undefined')
    return null
  }

  return (
    <div className="modal-overlay" onClick={handleClose}>
      <div className="level-up-modal" onClick={(e) => e.stopPropagation()}>
        <div className="level-up-header">
          <h2>🎉 Level Up!</h2>
          <button className="close-btn" onClick={handleClose}>×</button>
        </div>
        
        <div className="level-up-content">
          <div className="new-level">
            <span className="level-number">Level {levelInfo.level || 'Unknown'}</span>
            <span className="level-title">{levelInfo.title || 'Level Up!'}</span>
          </div>
          
          <p className="level-description">{levelInfo.description || 'Congratulations on your advancement!'}</p>
          
          {levelInfo.newItems && levelInfo.newItems.length > 0 && (
            <div className="unlocks-section">
              <h3>🔓 New Items Unlocked:</h3>
              <div className="unlocked-items">
                {levelInfo.newItems.map(itemId => {
                  const item = state.items.find(i => i.itemId === itemId)
                  return item ? (
                    <div key={itemId} className="unlocked-item">
                      <img 
                        src={item.itemIcon || '/assets/images/items/placeholder.svg'} 
                        alt={item.itemName}
                        className="item-icon-small"
                      />
                      <span>{item.itemName}</span>
                    </div>
                  ) : null
                })}
              </div>
            </div>
          )}
          
          {levelInfo.newSites && levelInfo.newSites.length > 0 && (
            <div className="unlocks-section">
              <h3>🗺️ New Sites Unlocked:</h3>
              <div className="unlocked-sites">
                {levelInfo.newSites.map(siteId => {
                  const site = state.sites.find(s => s.siteId === siteId)
                  return site ? (
                    <div key={siteId} className="unlocked-site">
                      <span>{site.siteName}</span>
                    </div>
                  ) : null
                })}
              </div>
            </div>
          )}
          
          {levelInfo.perks && levelInfo.perks.length > 0 && (
            <div className="unlocks-section">
              <h3>✨ New Perks:</h3>
              <ul className="perks-list">
                {levelInfo.perks.map((perk, index) => (
                  <li key={index}>{perk}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
        
        <div className="level-up-footer">
          <button className="button button-primary" onClick={handleClose}>
            Continue Exploring!
          </button>
        </div>
      </div>
    </div>
  )
}

export default ExplorationPage