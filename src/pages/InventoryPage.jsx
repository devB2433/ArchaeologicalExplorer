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
  const categoryColors = {
    cleaning_tools: '#10b981',
    digging_tools: '#f59e0b',
    detection_tools: '#8b5cf6',
    recording_tools: '#3b82f6',
    utility_tools: '#6b7280',
    navigation_tools: '#ef4444'
  }

  const rarityColors = {
    common: '#6b7280',
    rare: '#8b5cf6',
    legendary: '#f59e0b'
  }

  return (
    <div className="card" style={{ 
      padding: '20px',
      opacity: isOwned ? 1 : 0.6,
      border: isOwned ? '2px solid #10b981' : '1px solid rgba(255, 255, 255, 0.2)'
    }}>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '15px' }}>
        {/* 大图标 - 无黑框 */}
        <div style={{ 
          width: '140px', 
          height: '140px', 
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0
        }}>
          <img 
            src={item.itemIcon || '/assets/images/items/placeholder.svg'} 
            alt={item.itemName}
            style={{ 
              width: '100%', 
              height: '100%',
              objectFit: 'contain'
            }}
            onError={(e) => {
              e.target.src = '/assets/images/items/placeholder.svg'
            }}
          />
        </div>
        
        {/* 文字信息 */}
        <div style={{ width: '100%', textAlign: 'center' }}>
          <h3 style={{ margin: '0 0 10px 0', fontSize: '1.2rem' }}>{item.itemName}</h3>
          <p style={{ margin: '0 0 15px 0', fontSize: '0.95rem', opacity: 0.8, lineHeight: '1.4' }}>
            {item.itemDescription}
          </p>
          
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '10px', justifyContent: 'center' }}>
            <span style={{ 
              backgroundColor: categoryColors[item.itemCategory] || '#6b7280',
              color: 'white',
              padding: '4px 12px',
              borderRadius: '12px',
              fontSize: '0.8rem',
              fontWeight: '500'
            }}>
              {item.itemCategory?.replace('_', ' ') || 'Unknown'}
            </span>
            
            <span style={{ 
              backgroundColor: rarityColors[item.rarity] || '#6b7280',
              color: 'white',
              padding: '4px 12px',
              borderRadius: '12px',
              fontSize: '0.8rem',
              fontWeight: '500'
            }}>
              {item.rarity || 'Common'}
            </span>
            
            <span style={{ 
              backgroundColor: '#374151',
              color: 'white',
              padding: '4px 12px',
              borderRadius: '12px',
              fontSize: '0.8rem',
              fontWeight: '500'
            }}>
              Weight: {item.explorationWeight}
            </span>
          </div>

          {!isOwned && (
            <p style={{ 
              margin: '8px 0 0 0', 
              fontSize: '0.85rem', 
              color: '#f59e0b'
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