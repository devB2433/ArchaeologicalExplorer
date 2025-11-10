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
  const [expInfo, setExpInfo] = useState(null) // Save experience info for display

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
  }, [state.isLoading, state.items, state.routes, state.ruins])

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

  if (state.isLoading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
        <span style={{ marginLeft: '10px' }}>Loading exploration...</span>
      </div>
    )
  }

  const ownedItems = state.items.filter(item => actions.isItemOwned(item.itemId))
  
  // Get current user's max item slots from level system
  const userLevel = actions.getUserLevel()
  const levelSystem = actions.getLevelSystem()
  const maxItemSlots = levelSystem?.getMaxItemSlots(userLevel) || 3

  const handleItemToggle = (itemId) => {
    setSelectedItems(prev => {
      if (prev.includes(itemId)) {
        // Deselect item
        return prev.filter(id => id !== itemId)
      } else {
        // Select new item, check slot limit
        if (prev.length >= maxItemSlots) {
          // Reached max slots, cannot select more
          return prev
        }
        return [...prev, itemId]
      }
    })
  }

  const handleStartExploration = async () => {
    if (!gameEngine || selectedItems.length === 0) return

    setIsExploring(true)
    setExplorationResult(null)

    // Simulate exploration time (2 seconds)
    setTimeout(async () => {
      const result = await gameEngine.executeExploration(selectedItems)
      
      if (result.success) {
        console.log('🎉 Exploration successful! Ruin:', result.ruin.ruinId)
        
        // Add ruin to local collection
        const ruinInfo = actions.addDiscovery(result.ruin.ruinId)
        console.log('💎 Ruin info from GameContext:', ruinInfo)
        
        // Add experience to user account
        if (ruinInfo?.experienceGained) {
          console.log('📤 Sending to backend - ruinId:', result.ruin.ruinId, 'exp:', ruinInfo.experienceGained)
          const expResult = await authActions.addDiscovery(
            result.ruin.ruinId, 
            ruinInfo.experienceGained
          )
          console.log('📥 Backend response:', expResult)
          
          if (expResult.success) {
            // Save experience info for display
            setExpInfo({
              gained: expResult.experienceGained,
              total: expResult.newExperience,
              isNew: expResult.isNewDiscovery
            })
            
            if (expResult.levelUp) {
              const levelSystem = actions.getLevelSystem()
              if (levelSystem) {
                const levelUpRewards = levelSystem.getLevelUpRewards(expResult.newLevel)
                console.log('Setting level up info:', levelUpRewards)
                setLevelUpInfo(levelUpRewards)
              }
            }
          }
        } else {
          console.warn('⚠️ No ruinInfo or experienceGained!', ruinInfo)
        }
        
        // Add exploration record
        actions.addExplorationRecord(
          result.route.routeId,
          selectedItems,
          result.ruin.ruinId
        )
      }
      
      setExplorationResult(result)
      setIsExploring(false)
    }, 2000)
  }

  const resetExploration = () => {
    setExplorationResult(null)
    setLevelUpInfo(null)
    setExpInfo(null) // Reset experience info
    setSelectedItems([])
    setPreview(null)
  }

  return (
    <div className="container">
      <h1>Exploration</h1>

      {!explorationResult && (
        <>
          <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
              <h2>Select Items</h2>
              <div style={{ 
                fontSize: '1.1rem', 
                fontWeight: 'bold',
                color: selectedItems.length >= maxItemSlots ? '#ef4444' : '#10b981'
              }}>
                {selectedItems.length} / {maxItemSlots} Slots
              </div>
            </div>
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
            
            {/* Start Exploration Button - always visible */}
            <div style={{ marginTop: '30px', borderTop: '1px solid rgba(255, 255, 255, 0.1)', paddingTop: '20px' }}>
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
                  'Start Exploration'
                )}
              </button>
              
              {selectedItems.length === 0 && (
                <p style={{ textAlign: 'center', marginTop: '10px', color: '#f59e0b' }}>
                  Please select at least one item to begin exploration
                </p>
              )}
              
              {selectedItems.length >= maxItemSlots && (
                <p style={{ textAlign: 'center', marginTop: '10px', color: '#ef4444' }}>
                  ℹ️ You have reached the maximum item slots for Level {userLevel} ({maxItemSlots} items)
                </p>
              )}
              
              {selectedItems.length > 0 && !preview?.canExplore && (
                <p style={{ textAlign: 'center', marginTop: '10px', color: '#ef4444' }}>
                  No suitable exploration route found with current equipment
                </p>
              )}
            </div>
          </div>
        </>
      )}

      {explorationResult && (
        <ExplorationResult 
          result={explorationResult} 
          onReset={resetExploration}
          actions={actions}
          levelUpInfo={levelUpInfo}
          expInfo={expInfo}
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
  const [showTooltip, setShowTooltip] = React.useState(false);
  
  // Rarity visual effects - Earth tone color scheme with clear distinction
  const rarityStyles = {
    common: {
      borderColor: '#a89174',  // Medium earth brown
      glowColor: 'rgba(168, 145, 116, 0.5)',
      backgroundColor: 'rgba(168, 145, 116, 0.15)',
      cardBgColor: '#f0e6d2'  // Very light cream - lightest
    },
    rare: {
      borderColor: '#8b6f47',  // Darker warm brown
      glowColor: 'rgba(139, 111, 71, 0.5)',
      backgroundColor: 'rgba(139, 111, 71, 0.12)',
      cardBgColor: '#d4c4a8'  // Medium tan - clearly darker
    },
    legendary: {
      borderColor: '#5d4e37',  // Very deep brown (coffee)
      glowColor: 'rgba(93, 78, 55, 0.6)',
      backgroundColor: 'rgba(93, 78, 55, 0.15)',
      cardBgColor: '#b8a889'  // Darker taupe - darkest
    }
  }

  const rarity = item.rarity || 'common'
  const style = rarityStyles[rarity]

  return (
    <div 
      className="card" 
      onClick={onToggle}
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
      style={{ 
        padding: '15px',
        cursor: 'pointer',
        border: isSelected 
          ? `2px solid ${style.borderColor}` 
          : `1px solid ${style.borderColor}`,
        backgroundColor: isSelected ? style.backgroundColor : style.cardBgColor,
        boxShadow: isSelected 
          ? `0 0 20px ${style.glowColor}, inset 0 0 20px ${style.glowColor}` 
          : `0 0 10px ${style.glowColor}`,
        transition: 'all 0.3s ease',
        position: 'relative'
      }}
    >
      {/* Rarity badge */}
      <div style={{ 
        position: 'absolute',
        top: '8px',
        right: '8px',
        padding: '3px 8px',
        borderRadius: '10px',
        fontSize: '0.7rem',
        fontWeight: 'bold',
        backgroundColor: style.borderColor,
        color: 'white',
        textTransform: 'uppercase',
        zIndex: 10
      }}>
        {rarity === 'legendary' ? '⭐' : rarity === 'rare' ? '💎' : '🔹'}
      </div>

      {/* Selection checkmark */}
      <div style={{ 
        position: 'absolute',
        top: '10px',
        left: '10px',
        width: '28px', 
        height: '28px', 
        borderRadius: '50%',
        border: `2px solid ${style.borderColor}`,
        backgroundColor: isSelected ? style.borderColor : 'transparent',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 10
      }}>
        {isSelected && <span style={{ color: 'white', fontSize: '16px' }}>✓</span>}
      </div>

      {/* Large circular icon with rarity glow */}
      <div style={{ 
        width: '200px', 
        height: '200px',
        borderRadius: '50%',
        overflow: 'hidden',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        margin: '0 auto',
        background: 'transparent'
      }}>
        <img 
          src={item.itemIcon || '/assets/images/items/placeholder.svg'} 
          alt={item.itemName}
          style={{ 
            width: '90%', 
            height: '90%',
            objectFit: 'contain',
            background: 'transparent',
            filter: isSelected 
              ? `drop-shadow(0 0 10px ${style.glowColor}) sepia(0.15)` 
              : 'sepia(0.1)'
          }}
          onError={(e) => e.target.src = '/assets/images/items/placeholder.svg'}
        />
      </div>

      {/* Custom Tooltip */}
      {showTooltip && item.itemDescription && (
        <div style={{
          position: 'absolute',
          bottom: '100%',
          left: '50%',
          transform: 'translateX(-50%)',
          marginBottom: '10px',
          padding: '12px 16px',
          backgroundColor: 'rgba(62, 39, 35, 0.95)',
          color: '#f5f5dc',
          borderRadius: '8px',
          fontSize: '0.85rem',
          lineHeight: '1.4',
          maxWidth: '280px',
          width: 'max-content',
          whiteSpace: 'normal',
          wordWrap: 'break-word',
          zIndex: 1000,
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
          pointerEvents: 'none',
          textAlign: 'center'
        }}>
          {item.itemDescription}
          {/* Tooltip Arrow */}
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
  )
}

function ExplorationResult({ result, onReset, actions, expInfo }) {
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

  const ruin = result.ruin
  const route = result.route
  const site = actions.getSite(ruin.siteId)

  return (
    <div className="card">
      <h2 style={{ color: '#10b981' }}>
        Exploration Complete!
      </h2>
      
      {/* Display experience info */}
      {expInfo && (
        <div style={{ 
          marginBottom: '20px', 
          padding: '15px', 
          backgroundColor: 'rgba(16, 185, 129, 0.1)',
          borderRadius: '8px',
          border: '1px solid rgba(16, 185, 129, 0.3)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <strong style={{ color: '#10b981', fontSize: '1.2rem' }}>
                {expInfo.isNew ? '🎉 First Discovery!' : '🔁 Repeat Exploration'}
              </strong>
              <p style={{ margin: '5px 0 0 0', fontSize: '0.9rem', opacity: 0.8 }}>
                {expInfo.isNew ? 'Full experience gained' : '10% experience gained'}
              </p>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#10b981' }}>
                +{expInfo.gained} EXP
              </div>
              <div style={{ fontSize: '0.9rem', opacity: 0.7 }}>
                Total EXP: {expInfo.total}
              </div>
            </div>
          </div>
        </div>
      )}
      
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
            src={ruin.ruinImage || '/assets/images/ruins/placeholder.svg'} 
            alt={ruin.ruinName}
            style={{ 
              width: '100%', 
              height: '100%', 
              objectFit: 'cover' 
            }}
            onError={(e) => e.target.src = '/assets/images/ruins/placeholder.svg'}
          />
        </div>
        
        <div>
          <h3 style={{ margin: '0 0 10px 0', display: 'flex', alignItems: 'center', gap: '10px' }}>
            {ruin.ruinName}
            {ruin.isHidden && (
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
            {ruin.ruinDescription}
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