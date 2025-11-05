import React from 'react'
import { useGame } from '../contexts/GameContext'

function GalleryPage() {
  const { state, actions } = useGame()
  const uiTexts = state.uiTexts.gallery || {}
  
  if (state.isLoading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
        <span style={{ marginLeft: '10px' }}>Loading gallery...</span>
      </div>
    )
  }

  // Group discoveries by site
  const discoveriesBySite = {}
  state.sites.forEach(site => {
    discoveriesBySite[site.siteId] = {
      site,
      discoveries: state.discoveries.filter(d => d.siteId === site.siteId)
    }
  })

  const totalDiscoveries = state.discoveries.length
  const collectedDiscoveries = state.discoveryCollection.length
  const hiddenCollected = state.discoveryCollection.filter(collected => {
    const discovery = actions.getDiscovery(collected.discoveryId)
    return discovery && discovery.isHidden
  }).length

  return (
    <div className="container">
      <h1>{uiTexts.discoveryGallery || 'Discovery Gallery'}</h1>
      
      <div className="card">
        <h2>Collection Statistics</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginTop: '15px' }}>
          <div>
            <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#10b981' }}>
              {collectedDiscoveries}
            </div>
            <div>{uiTexts.totalDiscoveries || 'Total Discoveries'}</div>
          </div>
          <div>
            <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#f59e0b' }}>
              {hiddenCollected}
            </div>
            <div>{uiTexts.hiddenFound || 'Hidden Found'}</div>
          </div>
          <div>
            <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#8b5cf6' }}>
              {Math.round((collectedDiscoveries / totalDiscoveries) * 100)}%
            </div>
            <div>Completion Rate</div>
          </div>
        </div>
      </div>

      {Object.entries(discoveriesBySite).map(([siteId, { site, discoveries }]) => {
        const siteCollected = discoveries.filter(d => actions.isDiscoveryCollected(d.discoveryId))
        
        return (
          <div key={siteId} className="card">
            <h2>{site.siteName}</h2>
            <p style={{ opacity: 0.8, marginBottom: '20px' }}>{site.siteDescription}</p>
            <p style={{ marginBottom: '20px' }}>
              Collected: {siteCollected.length} / {discoveries.length}
            </p>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '15px' }}>
              {discoveries.map(discovery => (
                <DiscoveryCard 
                  key={discovery.discoveryId} 
                  discovery={discovery} 
                  isCollected={actions.isDiscoveryCollected(discovery.discoveryId)}
                  collectionData={state.discoveryCollection.find(c => c.discoveryId === discovery.discoveryId)}
                />
              ))}
            </div>
          </div>
        )
      })}
    </div>
  )
}

function DiscoveryCard({ discovery, isCollected, collectionData }) {
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
      
      {discovery.isHidden && (
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
          <img 
            src={discovery.discoveryImage || '/assets/images/discoveries/placeholder.svg'} 
            alt={discovery.discoveryName}
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
        ) : null}
        <div style={{ 
          display: isCollected ? 'none' : 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: '100%',
          height: '100%',
          color: '#9ca3af'
        }}>
          🔒 Not Yet Discovered
        </div>
      </div>

      <h3 style={{ margin: '0 0 10px 0', fontSize: '1.1rem' }}>
        {isCollected ? discovery.discoveryName : '???'}
      </h3>
      
      {isCollected ? (
        <p style={{ 
          margin: '0',
          fontSize: '0.9rem',
          opacity: 0.8,
          lineHeight: '1.4'
        }}>
          {discovery.discoveryDescription}
        </p>
      ) : (
        <p style={{ 
          margin: '0',
          fontSize: '0.9rem',
          opacity: 0.6,
          fontStyle: 'italic'
        }}>
          Complete explorations to discover this artifact
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
    </div>
  )
}

export default GalleryPage