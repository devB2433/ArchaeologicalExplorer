// Game state manager for localStorage operations
class GameStateManager {
  constructor() {
    this.baseStorageKeys = {
      PLAYER_DATA: 'archaeology_game_player_data',
      EXPLORATION_HISTORY: 'archaeology_game_exploration_history',
      DISCOVERY_COLLECTION: 'archaeology_game_discovery_collection',
      SETTINGS: 'archaeology_game_settings'
    }
    this.currentUserId = null
  }

  // Set current user ID for data isolation
  setUserId(userId) {
    this.currentUserId = userId
  }

  // Get user-specific storage keys
  getUserStorageKeys() {
    const userId = this.currentUserId || 'guest'
    return {
      PLAYER_DATA: `${this.baseStorageKeys.PLAYER_DATA}_${userId}`,
      EXPLORATION_HISTORY: `${this.baseStorageKeys.EXPLORATION_HISTORY}_${userId}`,
      DISCOVERY_COLLECTION: `${this.baseStorageKeys.DISCOVERY_COLLECTION}_${userId}`,
      SETTINGS: `${this.baseStorageKeys.SETTINGS}_${userId}`
    }
  }

  // Save data to localStorage with error handling
  saveToStorage(key, data) {
    try {
      localStorage.setItem(key, JSON.stringify(data))
      return true
    } catch (error) {
      console.error(`Error saving to localStorage (${key}):`, error)
      return false
    }
  }

  // Load data from localStorage with error handling
  loadFromStorage(key, defaultValue = null) {
    try {
      const data = localStorage.getItem(key)
      return data ? JSON.parse(data) : defaultValue
    } catch (error) {
      console.error(`Error loading from localStorage (${key}):`, error)
      return defaultValue
    }
  }

  // Save player data
  savePlayerData(playerData) {
    const keys = this.getUserStorageKeys()
    return this.saveToStorage(keys.PLAYER_DATA, playerData)
  }

  // Load player data
  loadPlayerData() {
    const keys = this.getUserStorageKeys()
    return this.loadFromStorage(keys.PLAYER_DATA, {
      currentCharacter: 'archaeologist_001',
      ownedItems: ['brush', 'trowel', 'notebook'],
      unlockedSites: ['site_pyramid_giza']
    })
  }

  // Save exploration history
  saveExplorationHistory(history) {
    const keys = this.getUserStorageKeys()
    return this.saveToStorage(keys.EXPLORATION_HISTORY, history)
  }

  // Load exploration history
  loadExplorationHistory() {
    const keys = this.getUserStorageKeys()
    return this.loadFromStorage(keys.EXPLORATION_HISTORY, [])
  }

  // Save discovery collection
  saveDiscoveryCollection(collection) {
    const keys = this.getUserStorageKeys()
    return this.saveToStorage(keys.DISCOVERY_COLLECTION, collection)
  }

  // Load discovery collection
  loadDiscoveryCollection() {
    const keys = this.getUserStorageKeys()
    return this.loadFromStorage(keys.DISCOVERY_COLLECTION, [])
  }

  // Load complete game state
  loadGameState() {
    return {
      playerData: this.loadPlayerData(),
      explorationHistory: this.loadExplorationHistory(),
      discoveryCollection: this.loadDiscoveryCollection()
    }
  }

  // Save complete game state
  saveGameState(gameState) {
    const success = [
      this.savePlayerData(gameState.playerData),
      this.saveExplorationHistory(gameState.explorationHistory),
      this.saveDiscoveryCollection(gameState.discoveryCollection)
    ]
    
    return success.every(result => result === true)
  }

  // Clear all saved data
  clearAllData() {
    try {
      const keys = this.getUserStorageKeys()
      Object.values(keys).forEach(key => {
        localStorage.removeItem(key)
      })
      return true
    } catch (error) {
      console.error('Error clearing localStorage:', error)
      return false
    }
  }

  // Clear data for specific user
  clearUserData(userId) {
    try {
      const oldUserId = this.currentUserId
      this.setUserId(userId)
      const keys = this.getUserStorageKeys()
      Object.values(keys).forEach(key => {
        localStorage.removeItem(key)
      })
      this.setUserId(oldUserId) // Restore previous user ID
      return true
    } catch (error) {
      console.error('Error clearing user data:', error)
      return false
    }
  }

  // Get storage usage info
  getStorageInfo() {
    const info = {}
    const keys = this.getUserStorageKeys()
    
    Object.entries(keys).forEach(([name, key]) => {
      const data = localStorage.getItem(key)
      info[name] = {
        key,
        size: data ? data.length : 0,
        exists: !!data
      }
    })
    
    return info
  }

  // Auto-save functionality
  enableAutoSave(gameState, intervalMs = 30000) { // Auto-save every 30 seconds
    if (this.autoSaveInterval) {
      clearInterval(this.autoSaveInterval)
    }
    
    this.autoSaveInterval = setInterval(() => {
      if (gameState) {
        this.saveGameState(gameState)
        console.log('Auto-saved game state')
      }
    }, intervalMs)
    
    return this.autoSaveInterval
  }

  // Disable auto-save
  disableAutoSave() {
    if (this.autoSaveInterval) {
      clearInterval(this.autoSaveInterval)
      this.autoSaveInterval = null
    }
  }

  // Export game data as JSON
  exportGameData() {
    const gameState = this.loadGameState()
    const exportData = {
      version: '1.0.0',
      exportDate: new Date().toISOString(),
      gameState
    }
    
    return JSON.stringify(exportData, null, 2)
  }

  // Import game data from JSON
  importGameData(jsonString) {
    try {
      const importData = JSON.parse(jsonString)
      
      if (importData.gameState) {
        return this.saveGameState(importData.gameState)
      }
      
      return false
    } catch (error) {
      console.error('Error importing game data:', error)
      return false
    }
  }
}

// Export singleton instance
export const gameStateManager = new GameStateManager()