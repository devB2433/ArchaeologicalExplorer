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

  // Load discoveries configuration
  async loadDiscoveries() {
    return await this.loadJson(`${this.baseUrl}/site-config/discoveries.json`)
  }

  // Load routes configuration
  async loadRoutes() {
    return await this.loadJson(`${this.baseUrl}/route-config/routes.json`)
  }

  // Load characters configuration
  async loadCharacters() {
    return await this.loadJson(`${this.baseUrl}/character-config/characters.json`)
  }

  // Load UI texts
  async loadUITexts() {
    return await this.loadJson(`${this.baseUrl}/game-texts/ui-texts.json`)
  }

  // Load game messages
  async loadMessages() {
    return await this.loadJson(`${this.baseUrl}/game-texts/messages.json`)
  }

  // Load all data in parallel
  async loadAllData() {
    try {
      const [
        itemsData,
        sitesData,
        discoveriesData,
        routesData,
        charactersData,
        uiTextsData,
        messagesData
      ] = await Promise.all([
        this.loadItems(),
        this.loadSites(),
        this.loadDiscoveries(),
        this.loadRoutes(),
        this.loadCharacters(),
        this.loadUITexts(),
        this.loadMessages()
      ])

      return {
        items: itemsData.items || [],
        sites: sitesData.sites || [],
        discoveries: discoveriesData.discoveries || [],
        routes: routesData.routes || [],
        characters: charactersData.characters || [],
        uiTexts: uiTextsData,
        messages: messagesData
      }
    } catch (error) {
      console.error('Error loading game data:', error)
      
      // Return minimal default data to prevent app crash
      return {
        items: [],
        sites: [],
        discoveries: [],
        routes: [],
        characters: [],
        uiTexts: { navigation: {}, exploration: {}, inventory: {}, gallery: {} },
        messages: { exploration: {}, errors: {} }
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