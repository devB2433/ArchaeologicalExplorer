// Route Matching Engine - handles item combination to route matching
export class RouteMatchingEngine {
  constructor(items, routes, itemCombinations = []) {
    this.items = items
    this.routes = routes
    this.itemCombinations = itemCombinations
  }

  // Find matching route based on carried items
  findMatchingRoute(selectedItems) {
    if (!selectedItems || selectedItems.length === 0) {
      return null
    }

    // Get all enabled routes
    const availableRoutes = this.routes.filter(route => route.isEnabled !== false)
    
    // Calculate total item weight
    const totalWeight = this.calculateTotalWeight(selectedItems)
    
    // Filter routes that meet conditions
    const matchingRoutes = availableRoutes.filter(route => 
      this.checkRouteConditions(route, selectedItems, totalWeight)
    )
    
    // Sort by priority and return highest priority route
    return matchingRoutes.sort((a, b) => (b.routePriority || 0) - (a.routePriority || 0))[0] || null
  }

  // Calculate total weight including combination bonuses
  calculateTotalWeight(selectedItems) {
    // Calculate base weight
    let totalWeight = selectedItems.reduce((total, itemId) => {
      const item = this.items.find(i => i.itemId === itemId)
      return total + (item?.explorationWeight || 0)
    }, 0)

    // Add combination bonuses
    const comboBonus = this.calculateCombinationBonus(selectedItems)
    
    return totalWeight + comboBonus
  }

  // Calculate combination bonus from item sets
  calculateCombinationBonus(selectedItems) {
    let bonus = 0
    
    this.itemCombinations.forEach(combo => {
      if (this.hasAllItems(selectedItems, combo.requiredItems)) {
        bonus += combo.comboEffect?.weightBonus || 0
      }
    })
    
    return bonus
  }

  // Check if all required items are present
  hasAllItems(selectedItems, requiredItems) {
    return requiredItems.every(itemId => selectedItems.includes(itemId))
  }

  // Check route trigger conditions
  checkRouteConditions(route, selectedItems, totalWeight) {
    const conditions = route.triggerConditions
    if (!conditions) return false

    // Check required items
    if (conditions.requiredItems && !this.hasAllItems(selectedItems, conditions.requiredItems)) {
      return false
    }

    // Check weight range
    if (conditions.minWeight !== undefined && totalWeight < conditions.minWeight) {
      return false
    }
    if (conditions.maxWeight !== undefined && totalWeight > conditions.maxWeight) {
      return false
    }

    // Check excluded items
    if (conditions.excludedItems && conditions.excludedItems.some(itemId => selectedItems.includes(itemId))) {
      return false
    }

    // Check special requirements
    if (conditions.specialRequirements && !this.checkSpecialRequirements(route, selectedItems)) {
      return false
    }

    return true
  }

  // Check special requirements like categories
  checkSpecialRequirements(route, selectedItems) {
    const special = route.triggerConditions.specialRequirements
    
    // Check required categories
    if (special.mustIncludeCategories) {
      const hasRequiredCategories = special.mustIncludeCategories.every(category => 
        selectedItems.some(itemId => {
          const item = this.items.find(i => i.itemId === itemId)
          return item?.itemCategory === category
        })
      )
      if (!hasRequiredCategories) return false
    }

    return true
  }

  // Get exploration preview information
  getExplorationPreview(selectedItems) {
    const totalWeight = this.calculateTotalWeight(selectedItems)
    const matchedRoute = this.findMatchingRoute(selectedItems)
    
    let explorationLevel = 'Surface'
    if (totalWeight >= 7) explorationLevel = 'Deep'
    else if (totalWeight >= 4) explorationLevel = 'Moderate'

    return {
      totalWeight,
      explorationLevel,
      matchedRoute,
      canExplore: !!matchedRoute,
      selectedItems
    }
  }
}

// Discovery Generation Engine - handles discovery selection
export class DiscoveryEngine {
  constructor(discoveries) {
    this.discoveries = discoveries
  }

  // Generate exploration result
  generateDiscovery(route, selectedItems) {
    if (!route || !route.discoveryPool) {
      return null
    }

    // Get possible discoveries for this route
    const possibleDiscoveries = this.discoveries.filter(discovery => 
      route.discoveryPool.includes(discovery.discoveryId) ||
      (discovery.availableRoutes && discovery.availableRoutes.includes(route.routeId))
    )

    if (possibleDiscoveries.length === 0) {
      return null
    }

    // Calculate hidden discovery probability
    let hiddenProbability = route.hiddenDiscoveryProbability || 0
    
    // Apply special item bonuses
    if (selectedItems.includes('ancient_map')) {
      hiddenProbability += 0.15 // Ancient map bonus
    }

    // Separate normal and hidden discoveries
    const normalDiscoveries = possibleDiscoveries.filter(d => !d.isHidden)
    const hiddenDiscoveries = possibleDiscoveries.filter(d => d.isHidden)

    // Decide if we get a hidden discovery
    const shouldGetHidden = Math.random() < hiddenProbability && hiddenDiscoveries.length > 0

    const availableDiscoveries = shouldGetHidden ? hiddenDiscoveries : normalDiscoveries
    
    if (availableDiscoveries.length === 0) {
      // Fallback to normal discoveries if no hidden available
      return this.randomSelect(normalDiscoveries)
    }

    return this.randomSelect(availableDiscoveries)
  }

  // Randomly select from array
  randomSelect(array) {
    if (!array || array.length === 0) return null
    return array[Math.floor(Math.random() * array.length)]
  }
}

// Main Game Engine that orchestrates exploration
export class GameEngine {
  constructor(gameData) {
    this.routeEngine = new RouteMatchingEngine(
      gameData.items, 
      gameData.routes, 
      gameData.items?.[0]?.itemCombinations || []
    )
    this.discoveryEngine = new DiscoveryEngine(gameData.discoveries)
    this.gameData = gameData
  }

  // Main exploration method
  async executeExploration(selectedItems) {
    try {
      // Find matching route
      const route = this.routeEngine.findMatchingRoute(selectedItems)
      
      if (!route) {
        return {
          success: false,
          error: 'No suitable exploration route found with current equipment',
          route: null,
          discovery: null
        }
      }

      // Generate discovery
      const discovery = this.discoveryEngine.generateDiscovery(route, selectedItems)
      
      if (!discovery) {
        return {
          success: false,
          error: 'No discoveries available for this route',
          route,
          discovery: null
        }
      }

      return {
        success: true,
        route,
        discovery,
        explorationData: {
          selectedItems,
          totalWeight: this.routeEngine.calculateTotalWeight(selectedItems),
          timestamp: Date.now()
        }
      }

    } catch (error) {
      console.error('Exploration execution error:', error)
      return {
        success: false,
        error: 'An error occurred during exploration',
        route: null,
        discovery: null
      }
    }
  }

  // Get exploration preview without executing
  getExplorationPreview(selectedItems) {
    return this.routeEngine.getExplorationPreview(selectedItems)
  }

  // Validate game data
  validateGameData() {
    const errors = []
    
    if (!this.gameData.items || this.gameData.items.length === 0) {
      errors.push('No items data loaded')
    }
    
    if (!this.gameData.routes || this.gameData.routes.length === 0) {
      errors.push('No routes data loaded')
    }
    
    if (!this.gameData.discoveries || this.gameData.discoveries.length === 0) {
      errors.push('No discoveries data loaded')
    }

    return {
      isValid: errors.length === 0,
      errors
    }
  }
}