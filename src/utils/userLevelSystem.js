// User level system utilities
class UserLevelSystem {
  constructor(levelData) {
    this.levelData = levelData
    this.levels = levelData?.levels || []
    this.levelSystem = levelData?.levelSystem || {}
    this.itemUnlocks = levelData?.itemUnlocks || {}
    this.siteUnlocks = levelData?.siteUnlocks || {}
  }

  // Calculate experience required for a specific level
  getExpRequiredForLevel(level) {
    const levelInfo = this.levels.find(l => l.level === level)
    return levelInfo ? levelInfo.expRequired : 0
  }

  // Calculate current level from experience points
  getLevelFromExp(experience) {
    for (let i = this.levels.length - 1; i >= 0; i--) {
      const level = this.levels[i]
      if (experience >= level.expRequired) {
        return level.level
      }
    }
    return 1 // Minimum level
  }

  // Get level information
  getLevelInfo(level) {
    return this.levels.find(l => l.level === level) || this.levels[0]
  }

  // Calculate experience for next level
  getExpForNextLevel(currentLevel) {
    const nextLevel = currentLevel + 1
    const nextLevelInfo = this.levels.find(l => l.level === nextLevel)
    return nextLevelInfo ? nextLevelInfo.expRequired : null
  }

  // Calculate progress to next level (0-1)
  getProgressToNextLevel(experience, currentLevel) {
    const currentLevelExp = this.getExpRequiredForLevel(currentLevel)
    const nextLevelExp = this.getExpForNextLevel(currentLevel)
    
    if (!nextLevelExp) return 1 // Max level reached
    
    const expInCurrentLevel = experience - currentLevelExp
    const expNeededForNextLevel = nextLevelExp - currentLevelExp
    
    return Math.min(1, Math.max(0, expInCurrentLevel / expNeededForNextLevel))
  }

  // Check if item is unlocked at current level
  isItemUnlocked(itemId, userLevel) {
    const unlock = this.itemUnlocks[itemId]
    const isUnlocked = unlock ? userLevel >= unlock.requiredLevel : false
    console.log(`🔑 isItemUnlocked(${itemId}, level ${userLevel}):`, { unlock, isUnlocked })
    return isUnlocked
  }

  // Check if site is unlocked at current level  
  isSiteUnlocked(siteId, userLevel) {
    const unlock = this.siteUnlocks[siteId]
    return unlock ? userLevel >= unlock.requiredLevel : false
  }

  // Get all unlocked items for a level
  getUnlockedItemsForLevel(userLevel) {
    return Object.keys(this.itemUnlocks)
      .filter(itemId => this.isItemUnlocked(itemId, userLevel))
      .map(itemId => parseInt(itemId)) // Convert string to number
  }

  // Get all unlocked sites for a level
  getUnlockedSitesForLevel(userLevel) {
    return Object.keys(this.siteUnlocks).filter(siteId => 
      this.isSiteUnlocked(siteId, userLevel)
    )
  }

  // Get maximum item slots for a level
  getMaxItemSlots(userLevel) {
    const levelInfo = this.getLevelInfo(userLevel)
    return levelInfo?.maxItemSlots || 3 // 默认 3 个槽位
  }

  // Calculate experience reward for discovery
  calculateExpReward(discovery, isFirstTime = false) {
    const baseExp = this.levelSystem.expRewards?.normalDiscovery || 25
    const hiddenBonus = this.levelSystem.expRewards?.hiddenDiscovery || 50
    const firstTimeBonus = this.levelSystem.expRewards?.firstTimeDiscovery || 30
    const explorationBonus = this.levelSystem.expRewards?.explorationBonus || 15

    let totalExp = baseExp

    if (discovery.isHidden) {
      totalExp = hiddenBonus
    }

    if (isFirstTime) {
      totalExp += firstTimeBonus
    }
    
    // Every exploration gives bonus experience
    totalExp += explorationBonus

    return totalExp
  }

  // Get items newly unlocked at a specific level
  getNewlyUnlockedItems(level) {
    const levelInfo = this.getLevelInfo(level)
    return levelInfo?.unlockedItems || []
  }

  // Get sites newly unlocked at a specific level
  getNewlyUnlockedSites(level) {
    const levelInfo = this.getLevelInfo(level)
    return levelInfo?.unlockedSites || []
  }

  // Get level up rewards and unlocks
  getLevelUpRewards(newLevel) {
    const levelInfo = this.getLevelInfo(newLevel)
    
    return {
      level: newLevel,
      title: levelInfo?.title || `Level ${newLevel}`,
      description: levelInfo?.description || '',
      newItems: this.getNewlyUnlockedItems(newLevel),
      newSites: this.getNewlyUnlockedSites(newLevel),
      perks: levelInfo?.perks || []
    }
  }

  // Validate level system configuration
  validateConfiguration() {
    const errors = []

    if (!this.levels || this.levels.length === 0) {
      errors.push('No level data found')
    }

    if (!this.levelSystem) {
      errors.push('No level system configuration found')
    }

    // Check level progression
    for (let i = 1; i < this.levels.length; i++) {
      const currentLevel = this.levels[i]
      const previousLevel = this.levels[i - 1]
      
      if (currentLevel.expRequired <= previousLevel.expRequired) {
        errors.push(`Level ${currentLevel.level} has invalid experience requirement`)
      }
    }

    return {
      isValid: errors.length === 0,
      errors
    }
  }
}

// Export for use in other modules
export { UserLevelSystem }