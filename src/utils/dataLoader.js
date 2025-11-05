// Data loader utility for loading JSON configuration files
class GameDataLoader {
  constructor() {
    this.baseUrl = '/game-content'
  }

  // Load a single JSON file
  async loadJson(filePath) {
    try {
      const response = await fetch(filePath)
      if (!response.ok) {
        throw new Error(`Failed to load ${filePath}: ${response.statusText}`)
      }
      return await response.json()
    } catch (error) {
      console.error(`Error loading ${filePath}:`, error)
      throw error
    }
  }

  // Load items configuration
  async loadItems() {
    return await this.loadJson(`${this.baseUrl}/item-config/items.json`)
  }

  // Load sites configuration
  async loadSites() {
    return await this.loadJson(`${this.baseUrl}/site-config/sites.json`)
  }

  // Load ruins configuration (new structure)
  async loadRuins() {
    return await this.loadJson(`${this.baseUrl}/site-config/ruins.json`)
  }

  // Load routes configuration
  async loadRoutes() {
    return await this.loadJson(`${this.baseUrl}/route-config/routes.json`)
  }

  // Load all data in parallel
  async loadAllData() {
    try {
      console.log('🔄 Starting to load game data...')
      
      const [
        itemsData,
        sitesData,
        ruinsData,
        routesData
      ] = await Promise.all([
        this.loadItems(),
        this.loadSites(),
        this.loadRuins(),
        this.loadRoutes()
      ])

      const result = {
        items: itemsData.items || [],
        sites: sitesData.sites || [],
        ruins: ruinsData.ruins || [],
        routes: routesData.routes || []
      }
      
      console.log('✅ Game data loaded successfully:', {
        items: result.items.length,
        sites: result.sites.length,
        ruins: result.ruins.length,
        routes: result.routes.length
      })
      
      return result
    } catch (error) {
      console.error('❌ Error loading game data:', error)
      
      // Return minimal default data to prevent app crash
      return {
        items: [],
        sites: [],
        ruins: [],
        routes: []
      }
    }
  }

  // Validate loaded data structure
  validateData(data) {
    const errors = []
    
    // Check items structure
    if (data.items) {
      data.items.forEach((item, index) => {
        if (!item.itemId) errors.push(`Item ${index} missing itemId`)
        if (!item.itemName) errors.push(`Item ${item.itemId || index} missing itemName`)
        if (typeof item.explorationWeight !== 'number') {
          errors.push(`Item ${item.itemId} missing or invalid explorationWeight`)
        }
      })
    }

    // Check routes structure
    if (data.routes) {
      data.routes.forEach((route, index) => {
        if (!route.routeId) errors.push(`Route ${index} missing routeId`)
        if (!route.targetSiteId) errors.push(`Route ${route.routeId || index} missing targetSiteId`)
        if (!route.triggerConditions) {
          errors.push(`Route ${route.routeId} missing triggerConditions`)
        }
      })
    }

    // Check discoveries structure
    if (data.discoveries) {
      data.discoveries.forEach((discovery, index) => {
        if (!discovery.discoveryId) errors.push(`Discovery ${index} missing discoveryId`)
        if (!discovery.siteId) errors.push(`Discovery ${discovery.discoveryId || index} missing siteId`)
        if (!discovery.discoveryImage) {
          errors.push(`Discovery ${discovery.discoveryId} missing discoveryImage`)
        }
      })
    }

    if (errors.length > 0) {
      console.warn('Data validation errors:', errors)
      return { isValid: false, errors }
    }

    return { isValid: true, errors: [] }
  }
}

// Export singleton instance
export const gameDataLoader = new GameDataLoader()