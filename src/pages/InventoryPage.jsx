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
  // Rarity visual effects - Vintage/Retro theme
  const rarityStyles = {
    common: {
      borderColor: '#a8a29e',  // Warm stone gray
      glowColor: 'rgba(168, 162, 158, 0.4)',
      backgroundColor: 'rgba(168, 162, 158, 0.12)',
      badgeIcon: '🔹',
      cardBgColor: '#78716c'  // Vintage stone background
    },
    rare: {
      borderColor: '#a78bfa',  // Soft vintage purple
      glowColor: 'rgba(167, 139, 250, 0.45)',
      backgroundColor: 'rgba(167, 139, 250, 0.12)',
      badgeIcon: '💎',
      cardBgColor: '#7c3aed'  // Deep vintage purple
    },
    legendary: {
      borderColor: '#fbbf24',  // Antique gold
      glowColor: 'rgba(251, 191, 36, 0.5)',
      backgroundColor: 'rgba(251, 191, 36, 0.15)',
      badgeIcon: '⭐',
      cardBgColor: '#b45309'  // Bronze/antique gold background
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
          gap: '4px'
        }}>
          {style.badgeIcon} {rarity}
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '15px' }}>
        {/* Large icon with rarity glow */}
        <div style={{ 
          width: '140px', 
          height: '140px', 
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
          borderRadius: '8px',
          background: 'transparent',  // Force transparent background
          boxShadow: isOwned ? `0 0 20px ${style.glowColor}` : 'none'
        }}>
          <img 
            src={item.itemIcon || '/assets/images/items/placeholder.svg'} 
            alt={item.itemName}
            style={{ 
              width: '100%', 
              height: '100%',
              objectFit: 'contain',
              background: 'transparent',
              filter: 'sepia(0.1)'
            }}
            onError={(e) => {
              e.target.src = '/assets/images/items/placeholder.svg'
            }}
          />
        </div>
        
        {/* Text information */}
        <div style={{ width: '100%', textAlign: 'center' }}>
          <h3 style={{ margin: '0 0 10px 0', fontSize: '1.2rem' }}>{item.itemName}</h3>
          <p style={{ margin: '0 0 15px 0', fontSize: '0.95rem', opacity: 0.8, lineHeight: '1.4' }}>
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
                backgroundColor: 'rgba(217, 119, 6, 0.15)',  // Vintage amber tint
                color: '#d97706',  // Vintage amber
                borderRadius: '8px',
                textDecoration: 'none',
                fontSize: '0.85rem',
                fontWeight: '500',
                border: '1px solid rgba(217, 119, 6, 0.3)',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => {
                e.target.style.backgroundColor = 'rgba(217, 119, 6, 0.25)'
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = 'rgba(217, 119, 6, 0.15)'
              }}
            >
              🔗 Learn More
            </a>
          )}

          {!isOwned && (
            <p style={{ 
              margin: '12px 0 0 0', 
              fontSize: '0.85rem', 
              color: '#fbbf24'  // Antique gold for locked items
            }}>
              🔒 Not yet discovered
            </p>
          )}
        </div>
      </div>
    </div>
  )
}

export default InventoryPage