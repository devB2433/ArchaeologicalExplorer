import React, { createContext, useContext, useReducer, useEffect } from 'react'
import { gameDataLoader } from '../utils/dataLoader'
import { gameStateManager } from '../utils/gameState'
import { UserLevelSystem } from '../utils/userLevelSystem'
import { useAuth } from './AuthContext'

// Game context
const GameContext = createContext()

// Initial state
const initialState = {
  // Static data loaded from JSON files
  items: [],
  sites: [],
  discoveries: [],
  routes: [],
  characters: [],
  levelSystem: null,
  uiTexts: {},
  messages: {},
  
  // Dynamic game state
  playerData: {
    currentCharacter: 'archaeologist_001',
    ownedItems: [], // Now determined by user level
    unlockedSites: [], // Now determined by user level
  },
  
  explorationHistory: [],
  discoveryCollection: [],
  
  // UI state
  isLoading: true,
  error: null,
  currentRoute: null,
  selectedItems: [],
}

// Action types
const ACTIONS = {
  SET_LOADING: 'SET_LOADING',
  SET_ERROR: 'SET_ERROR',
  LOAD_STATIC_DATA: 'LOAD_STATIC_DATA',
  LOAD_GAME_STATE: 'LOAD_GAME_STATE',
  SELECT_ITEMS: 'SELECT_ITEMS',
  ADD_DISCOVERY: 'ADD_DISCOVERY',
  ADD_EXPLORATION_RECORD: 'ADD_EXPLORATION_RECORD',
  SET_CURRENT_ROUTE: 'SET_CURRENT_ROUTE',
  UPDATE_USER_PROGRESS: 'UPDATE_USER_PROGRESS'
}

// Reducer function
function gameReducer(state, action) {
  switch (action.type) {
    case ACTIONS.SET_LOADING:
      return { ...state, isLoading: action.payload }
    
    case ACTIONS.SET_ERROR:
      return { ...state, error: action.payload, isLoading: false }
    
    case ACTIONS.LOAD_STATIC_DATA:
      return { 
        ...state, 
        ...action.payload,
        isLoading: false,
        error: null
      }
    
    case ACTIONS.LOAD_GAME_STATE:
      return {
        ...state,
        playerData: { ...state.playerData, ...action.payload.playerData },
        explorationHistory: action.payload.explorationHistory || [],
        discoveryCollection: action.payload.discoveryCollection || []
      }
    
    case ACTIONS.SELECT_ITEMS:
      return { ...state, selectedItems: action.payload }
    
    case ACTIONS.SET_CURRENT_ROUTE:
      return { ...state, currentRoute: action.payload }
    
    case ACTIONS.ADD_DISCOVERY:
      const newDiscovery = {
        discoveryId: action.payload.discoveryId,
        obtainedAt: Date.now(),
        isNew: true
      }
      const updatedCollection = [...state.discoveryCollection, newDiscovery]
      
      // Save to localStorage (for offline backup)
      gameStateManager.saveDiscoveryCollection(updatedCollection)
      
      return {
        ...state,
        discoveryCollection: updatedCollection
      }
    
    case ACTIONS.UPDATE_USER_PROGRESS:
      // Update player data based on user level
      const { userLevel } = action.payload
      const levelSystem = state.levelSystem
      
      if (levelSystem) {
        const ownedItems = levelSystem.getUnlockedItemsForLevel(userLevel)
        const unlockedSites = levelSystem.getUnlockedSitesForLevel(userLevel)
        
        return {
          ...state,
          playerData: {
            ...state.playerData,
            ownedItems,
            unlockedSites
          }
        }
      }
      
      return state
    
    case ACTIONS.ADD_EXPLORATION_RECORD:
      const newRecord = {
        timestamp: Date.now(),
        route: action.payload.route,
        items: action.payload.items,
        result: action.payload.result
      }
      const updatedHistory = [...state.explorationHistory, newRecord]
      
      // Save to localStorage
      gameStateManager.saveExplorationHistory(updatedHistory)
      
      return {
        ...state,
        explorationHistory: updatedHistory
      }
    
    default:
      return state
  }
}

// Game Provider Component
export function GameProvider({ children }) {
  const [state, dispatch] = useReducer(gameReducer, initialState)
  const { state: authState } = useAuth()

  // Load static data on mount
  useEffect(() => {
    async function loadGameData() {
      try {
        dispatch({ type: ACTIONS.SET_LOADING, payload: true })
        
        // Load static data from JSON files
        const staticData = await gameDataLoader.loadAllData()
        
        // Load level system data
        const levelSystemData = await gameDataLoader.loadJson('/game-content/user-config/level-system.json')
        const levelSystem = new UserLevelSystem(levelSystemData)
        
        dispatch({ 
          type: ACTIONS.LOAD_STATIC_DATA, 
          payload: { 
            ...staticData, 
            levelSystem 
          } 
        })
        
        // Load saved game state (for offline backup)
        const savedState = gameStateManager.loadGameState()
        if (savedState) {
          dispatch({ type: ACTIONS.LOAD_GAME_STATE, payload: savedState })
        }
        
      } catch (error) {
        console.error('Error loading game data:', error)
        dispatch({ type: ACTIONS.SET_ERROR, payload: error.message })
      }
    }

    loadGameData()
  }, [])

  // Update player progress when user level changes
  useEffect(() => {
    if (authState.isAuthenticated && authState.user && state.levelSystem) {
      // Set user ID for data isolation
      gameStateManager.setUserId(authState.user.id)
      
      // Reload user-specific game state
      const userGameState = gameStateManager.loadGameState()
      if (userGameState) {
        dispatch({ type: ACTIONS.LOAD_GAME_STATE, payload: userGameState })
      }
      
      dispatch({ 
        type: ACTIONS.UPDATE_USER_PROGRESS, 
        payload: { userLevel: authState.user.level } 
      })
    } else if (!authState.isAuthenticated) {
      // Set guest mode when not authenticated
      gameStateManager.setUserId(null)
      
      // Load guest game state
      const guestGameState = gameStateManager.loadGameState()
      if (guestGameState) {
        dispatch({ type: ACTIONS.LOAD_GAME_STATE, payload: guestGameState })
      }
    }
  }, [authState.user?.level, authState.user?.id, state.levelSystem])

  // Game actions
  const actions = {
    selectItems: (items) => {
      dispatch({ type: ACTIONS.SELECT_ITEMS, payload: items })
    },
    
    setCurrentRoute: (route) => {
      dispatch({ type: ACTIONS.SET_CURRENT_ROUTE, payload: route })
    },
    
    addDiscovery: (discoveryId) => {
      // Add to local collection for immediate UI update
      dispatch({ type: ACTIONS.ADD_DISCOVERY, payload: { discoveryId } })
      
      // If user is authenticated, also add to backend
      if (authState.isAuthenticated && state.levelSystem) {
        const discovery = state.discoveries.find(d => d.discoveryId === discoveryId)
        const isFirstTime = !state.discoveryCollection.some(d => d.discoveryId === discoveryId)
        const expReward = state.levelSystem.calculateExpReward(discovery, isFirstTime)
        
        // This will be handled by AuthContext
        return { discoveryId, experienceGained: expReward }
      }
    },
    
    addExplorationRecord: (route, items, result) => {
      dispatch({ 
        type: ACTIONS.ADD_EXPLORATION_RECORD, 
        payload: { route, items, result } 
      })
    },
    
    // Helper functions
    getItem: (itemId) => state.items.find(item => item.itemId === itemId),
    getSite: (siteId) => state.sites.find(site => site.siteId === siteId),
    getDiscovery: (discoveryId) => state.discoveries.find(d => d.discoveryId === discoveryId),
    isItemOwned: (itemId) => {
      // For authenticated users, check level-based ownership
      if (authState.isAuthenticated && authState.user && state.levelSystem) {
        return state.levelSystem.isItemUnlocked(itemId, authState.user.level)
      }
      // Fallback to local data
      return state.playerData.ownedItems.includes(itemId)
    },
    isSiteUnlocked: (siteId) => {
      // For authenticated users, check level-based unlocks
      if (authState.isAuthenticated && authState.user && state.levelSystem) {
        return state.levelSystem.isSiteUnlocked(siteId, authState.user.level)
      }
      // Fallback to local data
      return state.playerData.unlockedSites.includes(siteId)
    },
    isDiscoveryCollected: (discoveryId) => state.discoveryCollection.some(d => d.discoveryId === discoveryId),
    
    // Level system helpers
    getLevelSystem: () => state.levelSystem,
    getUserLevel: () => authState.user?.level || 1,
    getUserExperience: () => authState.user?.experience || 0,
  }

  return (
    <GameContext.Provider value={{ state, actions }}>
      {children}
    </GameContext.Provider>
  )
}

// Custom hook to use game context
export function useGame() {
  const context = useContext(GameContext)
  if (!context) {
    throw new Error('useGame must be used within a GameProvider')
  }
  return context
}