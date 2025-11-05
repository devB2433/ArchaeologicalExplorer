import React from 'react'
import { useGame } from '../contexts/GameContext'

function GalleryPage() {
  const { state, actions } = useGame()
  
  // Debug logging
  console.log('🖼️ Gallery Debug:', {
    discoveryCollectionLength: state.discoveryCollection?.length,
    discoveryCollection: state.discoveryCollection,
    ruins: state.ruins.map(r => ({
      ruinId: r.ruinId,
      name: r.ruinName,
      isCollected: actions.isDiscoveryCollected(r.ruinId)
    }))
  })
  
  if (state.isLoading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
        <span style={{ marginLeft: '10px' }}>Loading gallery...</span>
      </div>
    )
  }

  // Group ruins by site
  const ruinsBySite = {}
  state.sites.forEach(site => {
    ruinsBySite[site.siteId] = {
      site,
      ruins: state.ruins.filter(r => r.siteId === site.siteId)
    }
  })

  const totalRuins = state.ruins.length
  const collectedDiscoveries = state.discoveryCollection.length
  const hiddenCollected = state.discoveryCollection.filter(collected => {
    const ruin = actions.getRuin(collected.discoveryId)
    return ruin && ruin.isHidden
  }).length

  return (
    <div className="container">
      <h1>Discovery Gallery</h1>
      
      <div className="card">
        <h2>Collection Statistics</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginTop: '15px' }}>
          <div>
            <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#10b981' }}>
              {collectedDiscoveries}
            </div>
            <div>Total Discoveries</div>
          </div>
          <div>
            <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#f59e0b' }}>
              {hiddenCollected}
            </div>
            <div>Hidden Found</div>
          </div>
          <div>
            <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#8b5cf6' }}>
              {totalRuins > 0 ? Math.round((collectedDiscoveries / totalRuins) * 100) : 0}%
            </div>
            <div>Completion Rate</div>
          </div>
        </div>
      </div>

      {Object.entries(ruinsBySite).map(([siteId, { site, ruins }]) => {
        const siteCollected = ruins.filter(r => actions.isDiscoveryCollected(r.ruinId))
        
        return (
          <div key={siteId} className="card">
            <h2>{site.siteName}</h2>
            <p style={{ opacity: 0.8, marginBottom: '20px' }}>{site.siteDescription}</p>
            <p style={{ marginBottom: '20px' }}>
              Collected: {siteCollected.length} / {ruins.length}
            </p>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '15px' }}>
              {ruins.map(ruin => (
                <RuinCard 
                  key={ruin.ruinId} 
                  ruin={ruin} 
                  isCollected={actions.isDiscoveryCollected(ruin.ruinId)}
                  collectionData={state.discoveryCollection.find(c => c.discoveryId === ruin.ruinId)}
                />
              ))}
            </div>
          </div>
        )
      })}
    </div>
  )
}

function RuinCard({ ruin, isCollected, collectionData }) {
  const isNew = collectionData && collectionData.isNew

  return (
    <div className="card" style={{ 
      padding: '15px',
      opacity: isCollected ? 1 : 0.4,
      position: 'relative',
      border: isCollected ? '2px solid #10b981' : '1px solid rgba(255, 255, 255, 0.2)'
    }}>
      {isNew && (
        <div style={{
          position: 'absolute',
          top: '10px',
          right: '10px',
          backgroundColor: '#ef4444',
          color: 'white',
          padding: '4px 8px',
          borderRadius: '12px',
          fontSize: '0.75rem',
          fontWeight: 'bold'
        }}>
          NEW!
        </div>
      )}
      
      {ruin.isHidden && (
        <div style={{
          position: 'absolute',
          top: '10px',
          left: '10px',
          backgroundColor: '#f59e0b',
          color: 'white',
          padding: '4px 8px',
          borderRadius: '12px',
          fontSize: '0.75rem',
          fontWeight: 'bold'
        }}>
          ⭐ HIDDEN
        </div>
      )}

      <div style={{ 
        width: '100%', 
        height: '200px', 
        backgroundColor: '#374151',
        borderRadius: '8px',
        marginBottom: '15px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden'
      }}>
        {isCollected ? (
          <>
            <img 
              src={ruin.ruinImage || '/assets/images/ruins/placeholder.svg'} 
              alt={ruin.ruinName}
              style={{ 
                width: '100%', 
                height: '100%', 
                objectFit: 'cover' 
              }}
              onError={(e) => {
                e.target.style.display = 'none'
                e.target.nextElementSibling.style.display = 'flex'
              }}
            />
            <div style={{ 
              display: 'none',
              alignItems: 'center',
              justifyContent: 'center',
              width: '100%',
              height: '100%',
              color: '#9ca3af',
              fontSize: '3rem'
            }}>
              🏛️
            </div>
          </>
        ) : (
          <div style={{ 
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '100%',
            height: '100%',
            color: '#9ca3af'
          }}>
            🔒 Not Yet Discovered
          </div>
        )}
      </div>

      <h3 style={{ margin: '0 0 10px 0', fontSize: '1.1rem' }}>
        {isCollected ? ruin.ruinName : '???'}
      </h3>
      
      {isCollected ? (
        <p style={{ 
          margin: '0',
          fontSize: '0.9rem',
          opacity: 0.8,
          lineHeight: '1.4'
        }}>
          {ruin.ruinDescription}
        </p>
      ) : (
        <p style={{ 
          margin: '0',
          fontSize: '0.9rem',
          opacity: 0.6,
          fontStyle: 'italic'
        }}>
          Complete explorations to discover this ruin
        </p>
      )}

      {isCollected && collectionData && (
        <div style={{ 
          marginTop: '15px',
          padding: '10px',
          backgroundColor: 'rgba(16, 185, 129, 0.1)',
          borderRadius: '6px',
          fontSize: '0.8rem'
        }}>
          Discovered: {new Date(collectionData.obtainedAt).toLocaleDateString()}
        </div>
      )}
      
      {/* Citation link - show only for discovered ruins */}
      {isCollected && ruin.citation && (
        <a 
          href={ruin.citation} 
          target="_blank" 
          rel="noopener noreferrer"
          style={{ 
            display: 'inline-block',
            marginTop: '12px',
            padding: '8px 16px',
            backgroundColor: 'rgba(59, 130, 246, 0.1)',
            color: '#3b82f6',
            borderRadius: '8px',
            textDecoration: 'none',
            fontSize: '0.85rem',
            fontWeight: '500',
            border: '1px solid rgba(59, 130, 246, 0.3)',
            transition: 'all 0.2s'
          }}
          onMouseEnter={(e) => {
            e.target.style.backgroundColor = 'rgba(59, 130, 246, 0.2)'
          }}
          onMouseLeave={(e) => {
            e.target.style.backgroundColor = 'rgba(59, 130, 246, 0.1)'
          }}
        >
          🔗 Learn More
        </a>
      )}
    </div>
  )
}

export default GalleryPage