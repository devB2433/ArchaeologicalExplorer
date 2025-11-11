import React from 'react'
import { useGame } from '../contexts/GameContext'

function InventoryPage() {
  const { state, actions } = useGame()
  
  if (state.isLoading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
        <span style={{ marginLeft: '10px' }}>Loading inventory...</span>
      </div>
    )
  }

  // Debug logging
  console.log('🔍 Inventory Debug:', {
    totalItems: state.items.length,
    levelSystem: !!state.levelSystem,
    userLevel: actions.getUserLevel(),
    sampleItemCheck: state.items.length > 0 ? {
      itemId: state.items[0].itemId,
      isOwned: actions.isItemOwned(state.items[0].itemId)
    } : 'No items'
  })

  const ownedItems = state.items.filter(item => actions.isItemOwned(item.itemId))
  const unownedItems = state.items.filter(item => !actions.isItemOwned(item.itemId))
  
  console.log('📦 Items filtered:', { ownedCount: ownedItems.length, unownedCount: unownedItems.length })

  return (
    <div className="container">
      <h1>Available Items</h1>
      
      <div className="card">
        <h2>Owned Items ({ownedItems.length})</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '15px', marginTop: '20px' }}>
          {ownedItems.length > 0 ? ownedItems.map(item => (
            <ItemCard key={item.itemId} item={item} isOwned={true} />
          )) : (
            <p>No items owned yet.</p>
          )}
        </div>
      </div>

      {unownedItems.length > 0 && (
        <div className="card">
          <h2>Discoverable Items ({unownedItems.length})</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '15px', marginTop: '20px' }}>
            {unownedItems.map(item => (
              <ItemCard key={item.itemId} item={item} isOwned={false} />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function ItemCard({ item, isOwned }) {
  // Rarity visual effects - Earth tone color scheme with clear distinction
  const rarityStyles = {
    common: {
      borderColor: '#a89174',  // Medium earth brown
      glowColor: 'rgba(168, 145, 116, 0.5)',
      backgroundColor: 'rgba(168, 145, 116, 0.15)',
      badgeIcon: '🔹',
      cardBgColor: '#f0e6d2'  // Very light cream - lightest
    },
    rare: {
      borderColor: '#8b6f47',  // Darker warm brown
      glowColor: 'rgba(139, 111, 71, 0.5)',
      backgroundColor: 'rgba(139, 111, 71, 0.12)',
      badgeIcon: '💎',
      cardBgColor: '#d4c4a8'  // Medium tan - clearly darker
    },
    legendary: {
      borderColor: '#5d4e37',  // Very deep brown (coffee)
      glowColor: 'rgba(93, 78, 55, 0.6)',
      backgroundColor: 'rgba(93, 78, 55, 0.15)',
      badgeIcon: '⭐',
      cardBgColor: '#b8a889'  // Darker taupe - darkest
    }
  }

  const rarity = item.rarity || 'common'
  const style = rarityStyles[rarity]

  return (
    <div className="card" style={{ 
      padding: '20px',
      opacity: isOwned ? 1 : 0.6,
      border: isOwned 
        ? `2px solid ${style.borderColor}` 
        : `1px solid rgba(255, 255, 255, 0.2)`,
      backgroundColor: isOwned ? style.cardBgColor : 'rgba(17, 24, 39, 0.5)',
      boxShadow: isOwned ? `0 0 15px ${style.glowColor}` : 'none',
      position: 'relative'
    }}>
      {/* Rarity badge - show for owned items */}
      {isOwned && (
        <div style={{ 
          position: 'absolute',
          top: '12px',
          right: '12px',
          padding: '4px 10px',
          borderRadius: '12px',
          fontSize: '0.75rem',
          fontWeight: 'bold',
          backgroundColor: style.borderColor,
          color: 'white',
          textTransform: 'uppercase',
          display: 'flex',
          alignItems: 'center',
          gap: '4px',
          zIndex: 10
        }}>
          {style.badgeIcon} {rarity}
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '15px' }}>
        {/* Large circular icon - enlarged */}
        <div style={{ 
          width: '220px', 
          height: '220px', 
          borderRadius: '50%',
          overflow: 'hidden',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
          background: isOwned ? 'transparent' : 'rgba(0, 0, 0, 0.3)'
        }}>
          {isOwned ? (
            <img 
              src={item.itemIcon || '/assets/images/items/placeholder.svg'} 
              alt={item.itemName}
              style={{ 
                width: '90%', 
                height: '90%',
                objectFit: 'contain',
                background: 'transparent',
                filter: 'sepia(0.1)'
              }}
              onError={(e) => {
                e.target.src = '/assets/images/items/placeholder.svg'
              }}
            />
          ) : (
            <div style={{
              fontSize: '5rem',
              color: 'rgba(255, 255, 255, 0.3)'
            }}>
              🔒
            </div>
          )}
        </div>
        
        {/* Text information - description only */}
        <div style={{ width: '100%', textAlign: 'center' }}>
          {isOwned ? (
            <>
              <p style={{ margin: '0 0 15px 0', fontSize: '0.95rem', opacity: 1, lineHeight: '1.4', color: '#2c1810' }}>
                {item.itemDescription}
              </p>
              
              {/* Citation link */}
              {item.citation && (
                <a 
                  href={item.citation} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  style={{ 
                    display: 'inline-block',
                    marginTop: '10px',
                    padding: '8px 16px',
                    backgroundColor: 'rgba(139, 111, 71, 0.15)',
                    color: '#3e2723',
                    borderRadius: '8px',
                    textDecoration: 'none',
                    fontSize: '0.85rem',
                    fontWeight: '500',
                    border: '1px solid rgba(139, 111, 71, 0.3)',
                    transition: 'all 0.2s'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.backgroundColor = 'rgba(139, 111, 71, 0.25)'
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.backgroundColor = 'rgba(139, 111, 71, 0.15)'
                  }}
                >
                  🔗 Learn More
                </a>
              )}
            </>
          ) : (
            <>
              <h3 style={{ margin: '0 0 10px 0', fontSize: '1.1rem', color: '#f5f5dc' }}>
                ???
              </h3>
              <p style={{ 
                margin: '12px 0 0 0', 
                fontSize: '0.9rem', 
                color: 'rgba(245, 245, 220, 0.7)'
              }}>
                🔒 Not yet discovered
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default InventoryPage