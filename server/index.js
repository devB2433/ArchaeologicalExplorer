const express = require('express')
const cors = require('cors')
const sqlite3 = require('sqlite3').verbose()
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const nodemailer = require('nodemailer')
const { v4: uuidv4 } = require('uuid')
const path = require('path')
const fs = require('fs')

// Load environment variables
require('dotenv').config()

const app = express()
const PORT = process.env.PORT || 3001
const JWT_SECRET = process.env.JWT_SECRET || 'archaeology_game_secret_key_2024'

// Middleware
app.use(cors())
app.use(express.json())

// Request logging middleware
app.use((req, res, next) => {
  console.log(`📥 ${req.method} ${req.path}`)
  next()
})

// Serve static files from the dist directory
const staticPath = path.join(__dirname, '../dist')
console.log('🗂️  Setting up static file serving from:', staticPath)
console.log('📂 Static directory exists:', fs.existsSync(staticPath))
if (fs.existsSync(staticPath)) {
  const indexPath = path.join(staticPath, 'index.html')
  console.log('📄 Index.html exists:', fs.existsSync(indexPath))
  console.log('📜 Index.html content sample:', fs.readFileSync(indexPath, 'utf8').substring(0, 100))
}
app.use(express.static(staticPath))

// Database setup
const dbPath = path.join(__dirname, 'database.sqlite')
const db = new sqlite3.Database(dbPath)

// Initialize database tables
db.serialize(() => {
  // Users table
  db.run(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    username TEXT NOT NULL,
    level INTEGER DEFAULT 1,
    experience INTEGER DEFAULT 0,
    is_verified INTEGER DEFAULT 0,
    verification_token TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`)

  // User discoveries table
  db.run(`CREATE TABLE IF NOT EXISTS user_discoveries (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    discovery_id TEXT NOT NULL,
    obtained_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    experience_gained INTEGER DEFAULT 0,
    FOREIGN KEY (user_id) REFERENCES users (id),
    UNIQUE(user_id, discovery_id)
  )`)

  // Email verification codes
  db.run(`CREATE TABLE IF NOT EXISTS verification_codes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT NOT NULL,
    code TEXT NOT NULL,
    expires_at DATETIME NOT NULL,
    used INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`)
})

// Email configuration
let emailTransporter = null

// Initialize email transporter only if credentials are provided
if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
  // Support both Gmail and Hostinger email services
  const emailConfig = process.env.EMAIL_SERVICE === 'hostinger' 
    ? {
        host: process.env.SMTP_HOST || 'smtp.hostinger.com',
        port: parseInt(process.env.SMTP_PORT) || 465,
        secure: true, // SSL for port 465
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS
        },
        tls: {
          rejectUnauthorized: false
        }
      }
    : {
        service: 'gmail',
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS
        }
      }
  
  emailTransporter = nodemailer.createTransport(emailConfig)
  console.log('✅ Email service initialized with SMTP credentials')
  console.log('📧 Using service:', process.env.EMAIL_SERVICE || 'gmail')
  console.log('🔌 SMTP Config:', {
    host: emailConfig.host || emailConfig.service,
    port: emailConfig.port || 'default',
    secure: emailConfig.secure
  })
} else {
  console.log('⚠️  No email credentials found. Running in development mode.')
  console.log('📧 Verification codes will be displayed in console instead of sent via email.')
  console.log('🔧 To enable email: copy .env.example to .env and configure EMAIL_USER and EMAIL_PASS')
}

// Load level system configuration
let levelSystemConfig = null

function loadLevelSystemConfig() {
  if (!levelSystemConfig) {
    try {
      // Try production path first (dist/)
      let configPath = path.join(__dirname, '../dist/game-content/user-config/level-system.json')
      
      // If dist doesn't exist, use development path (public/)
      if (!fs.existsSync(configPath)) {
        configPath = path.join(__dirname, '../public/game-content/user-config/level-system.json')
        console.log('🛠️  Development mode: Loading config from public/')
      } else {
        console.log('🚀 Production mode: Loading config from dist/')
      }
      
      const configData = fs.readFileSync(configPath, 'utf8')
      levelSystemConfig = JSON.parse(configData)
      console.log('✅ Level system configuration loaded successfully')
      console.log('📋 Config preview:', {
        levels: levelSystemConfig.levels?.length || 0,
        itemUnlocks: Object.keys(levelSystemConfig.itemUnlocks || {}).length
      })
    } catch (error) {
      console.error('❌ Failed to load level system configuration:', error)
      // Fallback configuration
      levelSystemConfig = {
        levels: [
          { level: 1, expRequired: 0 },
          { level: 2, expRequired: 50 },
          { level: 3, expRequired: 110 }
        ]
      }
    }
  }
  return levelSystemConfig
}

// Utility functions
function generateVerificationCode() {
  // Development mode: use fixed verification code for testing
  if (process.env.NODE_ENV !== 'production') {
    const devCode = '123456'  // 固定的开发验证码
    console.log('🔧 Development mode: Using fixed verification code:', devCode)
    return devCode
  }
  // Production mode: generate random code
  const randomCode = Math.floor(100000 + Math.random() * 900000).toString()
  console.log('🎲 Production mode: Generated random verification code')
  return randomCode
}

function calculateLevelFromExp(experience) {
  const config = loadLevelSystemConfig()
  const levels = config.levels || []
  
  // Use the same logic as frontend: find the highest level where experience >= expRequired
  for (let i = levels.length - 1; i >= 0; i--) {
    const level = levels[i]
    if (experience >= level.expRequired) {
      return level.level
    }
  }
  
  return 1 // Minimum level
}

// Middleware for JWT authentication
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization']
  const token = authHeader && authHeader.split(' ')[1]

  if (!token) {
    return res.status(401).json({ error: 'Access token required' })
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid or expired token' })
    }
    req.user = user
    next()
  })
}

// API Routes

// Auth check endpoint
app.get('/api/auth/check', authenticateToken, (req, res) => {
  // If we reach here, token is valid
  db.get('SELECT id, email, username, level, experience FROM users WHERE id = ?', 
    [req.user.userId], (err, user) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' })
    }

    if (!user) {
      return res.status(404).json({ error: 'User not found' })
    }

    res.json({ 
      authenticated: true,
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        level: user.level,
        experience: user.experience
      }
    })
  })
})

// User registration
app.post('/api/auth/register', async (req, res) => {
  try {
    const { email, password, username } = req.body

    if (!email || !password || !username) {
      return res.status(400).json({ error: 'Email, password, and username are required' })
    }

    // Check if verified user already exists
    db.get('SELECT id, is_verified FROM users WHERE email = ?', [email], async (err, row) => {
      if (err) {
        console.error('Database error during user check:', err)
        return res.status(500).json({ error: 'Database error' })
      }

      // If verified user exists, don't allow re-registration
      if (row && row.is_verified === 1) {
        return res.status(400).json({ error: 'Email already registered and verified. Please login.' })
      }

      // If unverified user exists, delete it and allow re-registration
      if (row && row.is_verified === 0) {
        console.log(`🗑️  Deleting unverified user for email: ${email}`)
        db.run('DELETE FROM users WHERE email = ? AND is_verified = 0', [email])
        db.run('DELETE FROM verification_codes WHERE email = ?', [email])
      }

      // Hash password
      const passwordHash = await bcrypt.hash(password, 10)
      const verificationToken = uuidv4()

      // Insert user
      db.run(
        'INSERT INTO users (email, password_hash, username, verification_token) VALUES (?, ?, ?, ?)',
        [email, passwordHash, username, verificationToken],
        function(err) {
          if (err) {
            return res.status(500).json({ error: 'Failed to create user' })
          }

          // Generate and send verification code
          const verificationCode = generateVerificationCode()
          const expiresAt = new Date(Date.now() + 10 * 60 * 1000) // 10 minutes
          const expiresAtISO = expiresAt.toISOString().replace('T', ' ').replace('Z', '')

          db.run(
            'INSERT INTO verification_codes (email, code, expires_at) VALUES (?, ?, ?)',
            [email, verificationCode, expiresAtISO],
            (err) => {
              if (err) {
                console.error('Failed to save verification code:', err)
              } else {
                // Send verification email or log to console
                sendVerificationEmail(email, verificationCode)
              }
            }
          )

          res.status(201).json({
            message: 'User registered successfully. Please check your email for verification code.',
            userId: this.lastID
          })
        }
      )
    })
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' })
  }
})

// Email verification
app.post('/api/auth/verify-email', (req, res) => {
  const { email, code } = req.body

  if (!email || !code) {
    return res.status(400).json({ error: 'Email and verification code are required' })
  }

  // Check verification code
  db.get(
    'SELECT * FROM verification_codes WHERE email = ? AND code = ? AND used = 0 AND expires_at > ?',
    [email, code, new Date().toISOString().replace('T', ' ').replace('Z', '')],
    (err, row) => {
      if (err) {
        console.error('Database error during verification:', err)
        return res.status(500).json({ error: 'Database error' })
      }
      
      if (!row) {
        return res.status(400).json({ error: 'Invalid or expired verification code' })
      }
      
      // Mark code as used
      db.run('UPDATE verification_codes SET used = 1 WHERE id = ?', [row.id])

      // Mark user as verified
      db.run('UPDATE users SET is_verified = 1 WHERE email = ?', [email], (err) => {
        if (err) {
          console.error('Error updating user verification status:', err)
          return res.status(500).json({ error: 'Failed to verify user' })
        }

        res.json({ message: 'Email verified successfully' })
      })
    }
  )
})

// User login
app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' })
  }

  db.get('SELECT * FROM users WHERE email = ?', [email], async (err, user) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' })
    }

    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' })
    }

    if (!user.is_verified) {
      return res.status(401).json({ error: 'Please verify your email before logging in' })
    }

    // Check password
    const passwordValid = await bcrypt.compare(password, user.password_hash)
    if (!passwordValid) {
      return res.status(401).json({ error: 'Invalid credentials' })
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      JWT_SECRET,
      { expiresIn: '7d' }
    )

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        level: user.level,
        experience: user.experience
      }
    })
  })
})

// Get user profile
app.get('/api/user/profile', authenticateToken, (req, res) => {
  db.get('SELECT id, email, username, level, experience, created_at FROM users WHERE id = ?', 
    [req.user.userId], (err, user) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' })
    }

    if (!user) {
      return res.status(404).json({ error: 'User not found' })
    }

    res.json({ user })
  })
})

// Add discovery and experience
app.post('/api/user/add-discovery', authenticateToken, (req, res) => {
  const { discoveryId, experienceGained } = req.body
  const userId = req.user.userId

  // Insert discovery record
  db.run(
    'INSERT OR IGNORE INTO user_discoveries (user_id, discovery_id, experience_gained) VALUES (?, ?, ?)',
    [userId, discoveryId, experienceGained],
    function(err) {
      if (err) {
        console.error('❌ Failed to insert discovery:', err)
        return res.status(500).json({ error: 'Failed to add discovery' })
      }

      const isNewDiscovery = this.changes > 0

      // Get current user data
      db.get('SELECT experience, level FROM users WHERE id = ?', [userId], (err, user) => {
        if (err) {
          console.error('❌ Failed to get user data:', err)
          return res.status(500).json({ error: 'Database error' })
        }

        // If it's a repeated discovery, give 10% experience
        const actualExpGained = isNewDiscovery ? experienceGained : Math.floor(experienceGained * 0.1)
        const newExperience = user.experience + actualExpGained
        const oldLevel = user.level
        const newLevel = calculateLevelFromExp(newExperience)

        db.run(
          'UPDATE users SET experience = ?, level = ? WHERE id = ?',
          [newExperience, newLevel, userId],
          (err) => {
            if (err) {
              console.error('❌ Failed to update user experience:', err)
              return res.status(500).json({ error: 'Failed to update experience' })
            }

            const response = {
              message: isNewDiscovery ? 'Discovery added successfully' : 'Exploration completed (already discovered)',
              newExperience,
              newLevel,
              levelUp: newLevel > oldLevel,
              isNewDiscovery,
              experienceGained: actualExpGained
            }

            console.log('✅ Discovery processed:', {
              userId,
              discoveryId,
              isNew: isNewDiscovery,
              expGained: actualExpGained,
              newExp: newExperience,
              newLevel
            })

            res.json(response)
          }
        )
      })
    }
  )
})

// Get user discoveries
app.get('/api/user/discoveries', authenticateToken, (req, res) => {
  db.all(
    'SELECT discovery_id, obtained_at, experience_gained FROM user_discoveries WHERE user_id = ? ORDER BY obtained_at DESC',
    [req.user.userId],
    (err, discoveries) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' })
      }

      res.json({ discoveries })
    }
  )
})

// Get user exploration statistics
app.get('/api/user/stats', authenticateToken, (req, res) => {
  const userId = req.user.userId
  
  // Get discovery count
  db.get(
    'SELECT COUNT(*) as discoveryCount FROM user_discoveries WHERE user_id = ?',
    [userId],
    (err, discoveryResult) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' })
      }
      
      // Get last discovery date
      db.get(
        'SELECT obtained_at FROM user_discoveries WHERE user_id = ? ORDER BY obtained_at DESC LIMIT 1',
        [userId],
        (err, lastDiscoveryResult) => {
          if (err) {
            return res.status(500).json({ error: 'Database error' })
          }
          
          res.json({
            discoveryCount: discoveryResult.discoveryCount,
            lastExploration: lastDiscoveryResult?.obtained_at || null
          })
        }
      )
    }
  )
})

// Development mode: Skip email verification (only in development)
app.post('/api/auth/dev-verify', (req, res) => {
  if (process.env.NODE_ENV === 'production') {
    return res.status(403).json({ error: 'Development endpoint not available in production' })
  }

  const { email } = req.body
  
  if (!email) {
    return res.status(400).json({ error: 'Email is required' })
  }

  // Mark user as verified without checking code
  db.run('UPDATE users SET is_verified = 1 WHERE email = ?', [email], function(err) {
    if (err) {
      return res.status(500).json({ error: 'Failed to verify user' })
    }
    
    if (this.changes === 0) {
      return res.status(404).json({ error: 'User not found' })
    }

    res.json({ message: 'Email verified successfully (dev mode)' })
  })
})

// Development mode: Get latest verification code for email (debugging)
app.get('/api/dev/verification-code/:email', (req, res) => {
  if (process.env.NODE_ENV === 'production') {
    return res.status(403).json({ error: 'Development endpoint not available in production' })
  }

  const { email } = req.params
  
  // Get the latest unused verification code for this email
  db.get(
    'SELECT code, expires_at, created_at FROM verification_codes WHERE email = ? AND used = 0 ORDER BY created_at DESC LIMIT 1',
    [email],
    (err, row) => {
      if (err) {
        console.error('Database error getting verification code:', err)
        return res.status(500).json({ error: 'Database error' })
      }
      
      if (!row) {
        return res.status(404).json({ error: 'No verification code found for this email' })
      }
      
      const now = new Date().toISOString().replace('T', ' ').replace('Z', '')
      const isExpired = row.expires_at < now
      
      res.json({
        email,
        code: row.code,
        expires_at: row.expires_at,
        created_at: row.created_at,
        is_expired: isExpired,
        current_time: now
      })
    }
  )
})

// Development mode: Clean user data isolation issue
app.delete('/api/dev/clean-user-data/:userId', (req, res) => {
  if (process.env.NODE_ENV === 'production') {
    return res.status(403).json({ error: 'Development endpoint not available in production' })
  }

  const { userId } = req.params
  
  console.log('🧹 Cleaning user data for userId:', userId)
  
  // Delete all discoveries for user
  db.run('DELETE FROM user_discoveries WHERE user_id = ?', [userId], function(err) {
    if (err) {
      console.error('❌ Failed to delete discoveries:', err)
      return res.status(500).json({ error: 'Failed to clean discoveries' })
    }
    
    const deletedDiscoveries = this.changes
    
    // Reset user experience and level
    db.run(
      'UPDATE users SET experience = 0, level = 1 WHERE id = ?',
      [userId],
      (err) => {
        if (err) {
          console.error('❌ Failed to reset user stats:', err)
          return res.status(500).json({ error: 'Failed to reset user stats' })
        }
        
        console.log('✅ User data cleaned successfully')
        
        res.json({
          message: 'User data cleaned successfully',
          deletedDiscoveries,
          resetLevel: 1,
          resetExperience: 0
        })
      }
    )
  })
})

// Helper function to send verification email
async function sendVerificationEmail(email, code) {
  // Development mode: log to console if no email service configured
  if (!emailTransporter) {
    console.log('\n' + '='.repeat(50))
    console.log('🔑 VERIFICATION CODE DETAILS')
    console.log('='.repeat(50))
    console.log('📧 Email:', email)
    console.log('🔢 Code:', code)
    console.log('⏰ Valid for: 10 minutes')
    console.log('💡 Copy this code to complete registration')
    console.log('='.repeat(50) + '\n')
    return
  }

  // Production mode: send actual email
  try {
    const mailOptions = {
      from: process.env.EMAIL_USER || 'noreply@archaeology-game.com',
      to: email,
      subject: 'Archaeological Explorer - Email Verification',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #4f46e5;">Welcome to Archaeological Explorer!</h2>
          <p>Thank you for registering. Please use the following verification code to complete your registration:</p>
          <div style="background: #f3f4f6; padding: 20px; text-align: center; border-radius: 8px; margin: 20px 0;">
            <h1 style="color: #1f2937; font-size: 32px; margin: 0; letter-spacing: 4px;">${code}</h1>
          </div>
          <p>This code will expire in 10 minutes.</p>
          <p>If you didn't create an account, please ignore this email.</p>
          <hr style="margin: 20px 0; border: none; border-top: 1px solid #e5e7eb;">
          <p style="color: #6b7280; font-size: 14px;">Archaeological Explorer Game - Discover the Past, Unlock the Future</p>
        </div>
      `
    }

    await emailTransporter.sendMail(mailOptions)
    console.log('✅ Verification email sent to:', email)
  } catch (error) {
    console.error('❌ Failed to send verification email:', error)
    // Fallback: log to console
    console.log('\n🔑 EMAIL SEND FAILED - VERIFICATION CODE for', email)
    console.log('📧 Code:', code)
    console.log('⏰ Valid for 10 minutes\n')
  }
}

// Serve React app for all non-API routes (catch-all)
// Admin routes (for development/debugging)
app.get('/api/admin/users', (req, res) => {
  // Simple authentication - only in development
  const authHeader = req.headers['x-admin-key']
  if (process.env.NODE_ENV === 'development' && authHeader === 'dev-admin-123') {
    db.all(`
      SELECT 
        id, email, username, level, experience, is_verified, created_at, updated_at
      FROM users 
      ORDER BY created_at DESC
    `, [], (err, rows) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' })
      }
      
      res.json({
        success: true,
        total: rows.length,
        users: rows
      })
    })
  } else {
    res.status(401).json({ error: 'Unauthorized' })
  }
})

// Public statistics endpoint (no authentication required)
app.get('/api/stats/public', (req, res) => {
  db.get(`
    SELECT COUNT(*) as total_users FROM users
  `, [], (err, userStats) => {
    if (err) {
      console.error('❌ Error fetching user stats:', err)
      return res.status(500).json({ error: 'Database error', success: false })
    }
    
    // Count total discoveries instead of explorations (since explorations table is not used)
    db.get(`
      SELECT COUNT(*) as total_discoveries FROM user_discoveries
    `, [], (err2, discoveryStats) => {
      if (err2) {
        console.error('❌ Error fetching discovery stats:', err2)
        return res.status(500).json({ error: 'Database error', success: false })
      }
      
      console.log('📊 Stats fetched - Users:', userStats.total_users, 'Discoveries:', discoveryStats.total_discoveries)
      
      res.json({
        success: true,
        totalUsers: userStats.total_users || 0,
        totalExplorations: discoveryStats.total_discoveries || 0  // Using discoveries count
      })
    })
  })
})

app.get('/api/admin/stats', (req, res) => {
  // Simple authentication - only in development
  const authHeader = req.headers['x-admin-key']
  if (process.env.NODE_ENV === 'development' && authHeader === 'dev-admin-123') {
    db.get(`
      SELECT 
        COUNT(*) as total_users,
        COUNT(CASE WHEN is_verified = 1 THEN 1 END) as verified_users,
        COUNT(CASE WHEN is_verified = 0 THEN 1 END) as unverified_users
      FROM users
    `, [], (err, stats) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' })
      }
      
      res.json({
        success: true,
        stats
      })
    })
  } else {
    res.status(401).json({ error: 'Unauthorized' })
  }
})

app.get('*', (req, res) => {
  console.log('🔄 Catch-all route hit for:', req.path)
  // Only serve React app for non-API routes
  if (!req.path.startsWith('/api/')) {
    console.log('🚀 Serving index.html for:', req.path)
    res.sendFile(path.join(__dirname, '../dist/index.html'))
  } else {
    console.log('⚠️  API endpoint not found:', req.path)
    res.status(404).json({ error: 'API endpoint not found' })
  }
})

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})