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

// Discovery Generation Engine - handles ruins discovery based on difficulty
export class DiscoveryEngine {
  constructor(ruins) {
    this.ruins = ruins
  }

  // Generate exploration result based on route difficulty
  generateDiscovery(route, selectedItems) {
    if (!route || !route.routeDifficulty) {
      return null
    }

    // Get possible ruins for this route's difficulty
    const possibleRuins = this.ruins.filter(ruin => 
      this.isRuinAccessible(ruin, route.routeDifficulty)
    )

    if (possibleRuins.length === 0) {
      console.warn(`No ruins available for difficulty: ${route.routeDifficulty}`)
      return null
    }

    // Separate normal and hidden ruins
    const normalRuins = possibleRuins.filter(r => !r.isHidden)
    const hiddenRuins = possibleRuins.filter(r => r.isHidden)

    // Calculate hidden discovery probability based on route difficulty
    let hiddenProbability = 0
    if (route.routeDifficulty === 'master') {
      hiddenProbability = 0.35 // 35% chance for master routes
    } else if (route.routeDifficulty === 'advanced') {
      hiddenProbability = 0.15 // 15% chance for advanced routes
    } else {
      hiddenProbability = 0.05 // 5% chance for beginner routes
    }

    // Decide if we get a hidden ruin
    const shouldGetHidden = Math.random() < hiddenProbability && hiddenRuins.length > 0

    const availableRuins = shouldGetHidden ? hiddenRuins : normalRuins
    
    if (availableRuins.length === 0) {
      // Fallback to normal ruins if no hidden available
      return this.weightedRandomSelect(normalRuins)
    }

    return this.weightedRandomSelect(availableRuins)
  }

  // Check if ruin is accessible with current route difficulty
  isRuinAccessible(ruin, routeDifficulty) {
    const difficultyLevel = {
      'beginner': 1,
      'advanced': 2,
      'master': 3
    }

    const routeLevel = difficultyLevel[routeDifficulty] || 1
    const requiredLevel = difficultyLevel[ruin.requiredDifficulty] || 1

    // Route difficulty must be >= required difficulty
    return routeLevel >= requiredLevel
  }

  // Randomly select from array with weighted probability
  weightedRandomSelect(ruins) {
    if (!ruins || ruins.length === 0) return null
    
    // Use discoverProbability if available, otherwise equal chance
    const totalProbability = ruins.reduce((sum, ruin) => sum + (ruin.discoverProbability || 1), 0)
    let random = Math.random() * totalProbability
    
    for (const ruin of ruins) {
      random -= (ruin.discoverProbability || 1)
      if (random <= 0) {
        return ruin
      }
    }
    
    // Fallback to last item
    return ruins[ruins.length - 1]
  }

  // Randomly select from array (simple version)
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
    this.discoveryEngine = new DiscoveryEngine(gameData.ruins || [])
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
          ruin: null
        }
      }

      // Generate ruin discovery
      const ruin = this.discoveryEngine.generateDiscovery(route, selectedItems)
      
      if (!ruin) {
        return {
          success: false,
          error: 'No ruins available for this route',
          route,
          ruin: null
        }
      }

      return {
        success: true,
        route,
        ruin,
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
        ruin: null
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
    
    if (!this.gameData.ruins || this.gameData.ruins.length === 0) {
      errors.push('No ruins data loaded')
    }

    return {
      isValid: errors.length === 0,
      errors
    }
  }
}