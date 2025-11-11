import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

/**
 * Interactive Tutorial Guide Component
 * Shows step-by-step instructions for new players
 */
function TutorialGuide({ onComplete, forceShow = false }) {
  const [currentStep, setCurrentStep] = useState(0)
  const [isVisible, setIsVisible] = useState(false)
  const navigate = useNavigate()

  // Tutorial steps configuration
  const steps = [
    {
      title: "Welcome, Explorer! 🏛️",
      content: "Embark on archaeological expeditions to discover ancient ruins and artifacts from around the world.",
      action: "Start Tutorial",
      highlightElement: null
    },
    {
      title: "Step 1: Explore the World 🌍",
      content: "Click on the World Map to see available archaeological sites. Each pin represents a country with hidden ruins waiting to be discovered!",
      action: "Got it",
      highlightElement: ".world-map-card"
    },
    {
      title: "Step 2: Choose Your Tools 🔨",
      content: "Go to Inventory to select items for your expedition. Different items help you discover different types of ruins.",
      action: "Next",
      highlightElement: null,
      actionButton: {
        text: "Open Inventory",
        onClick: () => navigate('/inventory')
      }
    },
    {
      title: "Step 3: Start Exploring 🗺️",
      content: "Select items and begin your expedition. The more suitable your tools, the higher your chance of discovering rare ruins!",
      action: "Next",
      highlightElement: null,
      actionButton: {
        text: "Start Exploration",
        onClick: () => navigate('/exploration')
      }
    },
    {
      title: "Step 4: Build Your Collection 📜",
      content: "Each discovery earns you experience points. Check your Gallery to see all the ruins you've found!",
      action: "Finish Tutorial",
      highlightElement: null
    }
  ]

  const currentStepData = steps[currentStep]

  // Show tutorial for new users (level 1) or when forced
  useEffect(() => {
    if (forceShow) {
      setIsVisible(true)
      setCurrentStep(0) // Reset to first step when manually triggered
      return
    }
    
    const hasSeenTutorial = localStorage.getItem('hasSeenTutorial')
    if (!hasSeenTutorial) {
      setIsVisible(true)
    }
  }, [forceShow])

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1)
    } else {
      handleComplete()
    }
  }

  const handleSkip = () => {
    handleComplete()
  }

  const handleComplete = () => {
    localStorage.setItem('hasSeenTutorial', 'true')
    setIsVisible(false)
    if (onComplete) onComplete()
  }

  if (!isVisible) return null

  return (
    <>
      {/* Backdrop */}
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        zIndex: 9998,
        backdropFilter: 'blur(4px)'
      }} onClick={handleSkip} />

      {/* Tutorial Modal */}
      <div style={{
        position: 'fixed',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        backgroundColor: '#3e2723',
        borderRadius: '15px',
        padding: '30px',
        maxWidth: '500px',
        width: '90%',
        boxShadow: '0 10px 40px rgba(0, 0, 0, 0.5)',
        zIndex: 9999,
        border: '2px solid #8b6f47',
        color: '#f5f5dc'
      }}>
        {/* Progress Indicator */}
        <div style={{
          display: 'flex',
          gap: '8px',
          marginBottom: '20px',
          justifyContent: 'center'
        }}>
          {steps.map((_, index) => (
            <div
              key={index}
              style={{
                width: '30px',
                height: '4px',
                backgroundColor: index <= currentStep ? '#10b981' : 'rgba(255, 255, 255, 0.2)',
                borderRadius: '2px',
                transition: 'background-color 0.3s'
              }}
            />
          ))}
        </div>

        {/* Step Number */}
        <div style={{
          fontSize: '0.85rem',
          opacity: 0.7,
          marginBottom: '10px',
          textAlign: 'center'
        }}>
          Step {currentStep + 1} of {steps.length}
        </div>

        {/* Title */}
        <h2 style={{
          margin: '0 0 15px 0',
          fontSize: '1.5rem',
          textAlign: 'center',
          color: '#f5f5dc'
        }}>
          {currentStepData.title}
        </h2>

        {/* Content */}
        <p style={{
          fontSize: '1rem',
          lineHeight: '1.6',
          marginBottom: '25px',
          textAlign: 'center',
          opacity: 0.9
        }}>
          {currentStepData.content}
        </p>

        {/* Action Buttons */}
        <div style={{
          display: 'flex',
          gap: '10px',
          justifyContent: 'space-between'
        }}>
          <button
            onClick={handleSkip}
            style={{
              padding: '10px 20px',
              backgroundColor: 'transparent',
              border: '1px solid rgba(255, 255, 255, 0.3)',
              borderRadius: '8px',
              color: '#f5f5dc',
              cursor: 'pointer',
              fontSize: '0.9rem',
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => {
              e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.1)'
            }}
            onMouseLeave={(e) => {
              e.target.style.backgroundColor = 'transparent'
            }}
          >
            Skip Tutorial
          </button>

          <div style={{ display: 'flex', gap: '10px' }}>
            {currentStepData.actionButton && (
              <button
                onClick={currentStepData.actionButton.onClick}
                style={{
                  padding: '10px 20px',
                  backgroundColor: '#8b6f47',
                  border: 'none',
                  borderRadius: '8px',
                  color: '#f5f5dc',
                  cursor: 'pointer',
                  fontSize: '0.9rem',
                  fontWeight: 'bold',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => {
                  e.target.style.backgroundColor = '#a0826b'
                }}
                onMouseLeave={(e) => {
                  e.target.style.backgroundColor = '#8b6f47'
                }}
              >
                {currentStepData.actionButton.text}
              </button>
            )}

            <button
              onClick={handleNext}
              style={{
                padding: '10px 25px',
                backgroundColor: '#10b981',
                border: 'none',
                borderRadius: '8px',
                color: 'white',
                cursor: 'pointer',
                fontSize: '0.9rem',
                fontWeight: 'bold',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => {
                e.target.style.backgroundColor = '#059669'
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = '#10b981'
              }}
            >
              {currentStepData.action}
            </button>
          </div>
        </div>
      </div>
    </>
  )
}

export default TutorialGuide
