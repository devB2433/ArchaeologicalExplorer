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
  ruins: [],
  routes: [],
  levelSystem: null,
  
  // Dynamic game state
  playerData: {
    currentCharacter: 'archaeologist_001',
    ownedItems: [], // Determined by user level
    unlockedSites: [], // Determined by user level
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
      console.log('📦 GameReducer: LOAD_STATIC_DATA called with:', {
        items: action.payload.items?.length,
        sites: action.payload.sites?.length,
        levelSystem: !!action.payload.levelSystem
      })
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
  const { state: authState, actions: authActions } = useAuth()

  // Load static data on mount
  useEffect(() => {
    async function loadGameData() {
      try {
        console.log('🎮 GameContext: Starting to load game data...')
        dispatch({ type: ACTIONS.SET_LOADING, payload: true })
        
        // Load static data from JSON files
        const staticData = await gameDataLoader.loadAllData()
        console.log('📥 GameContext: Received static data:', { 
          items: staticData.items?.length, 
          sites: staticData.sites?.length 
        })
        
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
    async function syncUserData() {
      console.log('🔄 syncUserData called, authState:', {
        isAuthenticated: authState.isAuthenticated,
        hasUser: !!authState.user,
        hasLevelSystem: !!state.levelSystem,
        userId: authState.user?.id
      })
      
      if (authState.isAuthenticated && authState.user && state.levelSystem) {
        // Set user ID for data isolation
        gameStateManager.setUserId(authState.user.id)
        
        // Sync discoveries from backend (this is the source of truth)
        console.log('📡 Fetching discoveries from backend...')
        const discoveriesResult = await authActions.getUserDiscoveries()
        console.log('📥 Backend discoveries result:', discoveriesResult)
        
        if (discoveriesResult?.success && discoveriesResult.discoveries) {
          // Convert backend format to frontend format
          const discoveryCollection = discoveriesResult.discoveries.map(d => ({
            discoveryId: d.discovery_id,
            obtainedAt: new Date(d.obtained_at).getTime(),
            isNew: false // From backend, so not new
          }))
          
          console.log('✅ Synced discovery collection:', discoveryCollection)
          
          // Update state with backend data
          dispatch({ 
            type: ACTIONS.LOAD_GAME_STATE, 
            payload: { 
              playerData: state.playerData,
              explorationHistory: [],
              discoveryCollection 
            } 
          })
          
          // Also save to localStorage for offline backup
          gameStateManager.saveDiscoveryCollection(discoveryCollection)
        } else {
          console.warn('⚠️ Failed to get discoveries or empty:', discoveriesResult)
        }
        
        dispatch({ 
          type: ACTIONS.UPDATE_USER_PROGRESS, 
          payload: { userLevel: authState.user.level } 
        })
      } else if (!authState.isAuthenticated) {
        console.log('👤 Guest mode: loading from localStorage')
        // Set guest mode when not authenticated
        gameStateManager.setUserId(null)
        
        // Load guest game state from localStorage
        const guestGameState = gameStateManager.loadGameState()
        if (guestGameState) {
          dispatch({ type: ACTIONS.LOAD_GAME_STATE, payload: guestGameState })
        }
      }
    }
    
    syncUserData()
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
      console.log('🔍 GameContext.addDiscovery called with:', discoveryId)
      console.log('🔍 Current state:', {
        isAuthenticated: authState.isAuthenticated,
        hasLevelSystem: !!state.levelSystem,
        ruinsCount: state.ruins?.length,
        discoveryCollectionCount: state.discoveryCollection?.length
      })
      
      // Add to local collection for immediate UI update
      dispatch({ type: ACTIONS.ADD_DISCOVERY, payload: { discoveryId } })
      
      // If user is authenticated, also add to backend
      if (authState.isAuthenticated && state.levelSystem) {
        const ruin = state.ruins.find(r => r.ruinId === discoveryId)
        console.log('🏛️ Found ruin:', ruin)
        
        const isFirstTime = !state.discoveryCollection.some(d => d.discoveryId === discoveryId)
        console.log('❓ Is first time?', isFirstTime)
        
        const expReward = state.levelSystem.calculateExpReward(ruin, isFirstTime)
        console.log('🎁 Experience reward:', expReward)
        
        // This will be handled by AuthContext
        return { discoveryId, experienceGained: expReward }
      } else {
        console.warn('⚠️ Not authenticated or no level system')
        return null
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
    getRuin: (ruinId) => state.ruins.find(r => r.ruinId === ruinId),
    getRoute: (routeId) => state.routes.find(r => r.routeId === routeId),
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