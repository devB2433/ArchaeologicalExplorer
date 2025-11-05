import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import { GameProvider } from './contexts/GameContext'
import Navigation from './components/Navigation'
import HomePage from './pages/HomePage'
import ExplorationPage from './pages/ExplorationPage'
import InventoryPage from './pages/InventoryPage'
import GalleryPage from './pages/GalleryPage'
import AuthPage from './pages/AuthPage'
import ProtectedRoute from './components/ProtectedRoute'
import './App.css'

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppContent />
      </Router>
    </AuthProvider>
  )
}

function AppContent() {
  const { state: authState } = useAuth()

  // Show auth page if not authenticated
  if (!authState.isAuthenticated) {
    return (
      <div className="app">
        <AuthPage />
      </div>
    )
  }

  // Show main app if authenticated
  return (
    <GameProvider>
      <div className="app">
        <Navigation />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<ProtectedRoute><HomePage /></ProtectedRoute>} />
            <Route path="/exploration" element={<ProtectedRoute><ExplorationPage /></ProtectedRoute>} />
            <Route path="/inventory" element={<ProtectedRoute><InventoryPage /></ProtectedRoute>} />
            <Route path="/gallery" element={<ProtectedRoute><GalleryPage /></ProtectedRoute>} />
          </Routes>
        </main>
      </div>
    </GameProvider>
  )
}

export default App