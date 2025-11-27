#!/bin/bash

# Archaeological Explorer - Data Export Script
# Export user and exploration data to JSON format

CONTAINER_NAME="${1:-archaeology-game-app}"
OUTPUT_DIR="./exported-data"
TIMESTAMP=$(date +"%Y-%m-%d_%H%M%S")

echo "📊 Archaeological Explorer - Data Export"
echo "=========================================="
echo ""

# Check if container is running
if ! docker ps --format '{{.Names}}' | grep -q "^${CONTAINER_NAME}$"; then
    echo "❌ Container '${CONTAINER_NAME}' is not running!"
    echo ""
    echo "Available containers:"
    docker ps --format "table {{.Names}}\t{{.Status}}"
    exit 1
fi

echo "✅ Container '${CONTAINER_NAME}' is running"
echo ""

# Create output directory
mkdir -p "$OUTPUT_DIR"
echo "📁 Output directory: $OUTPUT_DIR"
echo ""

# File paths
USERS_FILE="$OUTPUT_DIR/users_$TIMESTAMP.json"
DISCOVERIES_FILE="$OUTPUT_DIR/discoveries_$TIMESTAMP.json"
STATS_FILE="$OUTPUT_DIR/statistics_$TIMESTAMP.json"

# Export Users Data
echo "👥 Exporting user data..."
docker exec ${CONTAINER_NAME} node -e "
const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('/app/data/database.sqlite');

db.all('SELECT id, email, username, level, experience, is_verified, created_at, updated_at FROM users ORDER BY id', (err, rows) => {
  if (err) {
    console.error('Error:', err.message);
    process.exit(1);
  }
  
  const users = rows.map(r => ({
    id: r.id,
    email: r.email,
    username: r.username,
    level: r.level,
    experience: r.experience,
    isVerified: r.is_verified === 1,
    createdAt: r.created_at,
    updatedAt: r.updated_at
  }));
  
  console.log(JSON.stringify(users, null, 2));
  db.close();
});
" > "$USERS_FILE"

if [ $? -eq 0 ]; then
    echo "   ✅ Users exported to: $USERS_FILE"
    USER_COUNT=$(docker exec ${CONTAINER_NAME} node -e "
      const sqlite3 = require('sqlite3').verbose();
      const db = new sqlite3.Database('/app/data/database.sqlite');
      db.get('SELECT COUNT(*) as count FROM users', (err, row) => {
        if (!err) console.log(row.count);
        db.close();
      });
    ")
    echo "   📊 Total users: $USER_COUNT"
else
    echo "   ❌ Failed to export users"
fi
echo ""

# Export Discoveries Data
echo "🏺 Exporting discovery data..."
docker exec ${CONTAINER_NAME} node -e "
const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('/app/data/database.sqlite');

db.all('SELECT user_id, discovery_id, experience_gained, obtained_at FROM user_discoveries ORDER BY user_id, obtained_at', (err, rows) => {
  if (err) {
    console.error('Error:', err.message);
    process.exit(1);
  }
  
  const discoveries = rows.map(r => ({
    userId: r.user_id,
    discoveryId: r.discovery_id,
    experienceGained: r.experience_gained,
    obtainedAt: r.obtained_at
  }));
  
  console.log(JSON.stringify(discoveries, null, 2));
  db.close();
});
" > "$DISCOVERIES_FILE"

if [ $? -eq 0 ]; then
    echo "   ✅ Discoveries exported to: $DISCOVERIES_FILE"
    DISCOVERY_COUNT=$(docker exec ${CONTAINER_NAME} node -e "
      const sqlite3 = require('sqlite3').verbose();
      const db = new sqlite3.Database('/app/data/database.sqlite');
      db.get('SELECT COUNT(*) as count FROM user_discoveries', (err, row) => {
        if (!err) console.log(row.count);
        db.close();
      });
    ")
    echo "   📊 Total discoveries: $DISCOVERY_COUNT"
else
    echo "   ❌ Failed to export discoveries"
fi
echo ""

# Export Statistics
echo "📈 Exporting statistics..."
docker exec ${CONTAINER_NAME} node -e "
const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('/app/data/database.sqlite');

Promise.all([
  new Promise((resolve) => {
    db.get('SELECT COUNT(*) as count FROM users', (err, row) => {
      resolve({ totalUsers: err ? 0 : row.count });
    });
  }),
  new Promise((resolve) => {
    db.get('SELECT COUNT(*) as count FROM users WHERE is_verified = 1', (err, row) => {
      resolve({ verifiedUsers: err ? 0 : row.count });
    });
  }),
  new Promise((resolve) => {
    db.get('SELECT COUNT(*) as count FROM user_discoveries', (err, row) => {
      resolve({ totalDiscoveries: err ? 0 : row.count });
    });
  }),
  new Promise((resolve) => {
    db.get('SELECT COUNT(DISTINCT user_id) as count FROM user_discoveries', (err, row) => {
      resolve({ usersWithDiscoveries: err ? 0 : row.count });
    });
  }),
  new Promise((resolve) => {
    db.get('SELECT demo_visits, total_explorations FROM site_statistics WHERE id = 1', (err, row) => {
      resolve({ 
        demoVisits: err || !row ? 0 : row.demo_visits,
        totalExplorations: err || !row ? 0 : row.total_explorations
      });
    });
  })
]).then(results => {
  const stats = Object.assign({}, ...results);
  stats.exportedAt = new Date().toISOString();
  console.log(JSON.stringify(stats, null, 2));
  db.close();
});
" > "$STATS_FILE"

if [ $? -eq 0 ]; then
    echo "   ✅ Statistics exported to: $STATS_FILE"
else
    echo "   ❌ Failed to export statistics"
fi
echo ""

# Summary
echo "=========================================="
echo "✅ Data export completed!"
echo ""
echo "📂 Exported files:"
echo "   - $USERS_FILE"
echo "   - $DISCOVERIES_FILE"
echo "   - $STATS_FILE"
echo ""
echo "💡 Tip: View with: cat $USERS_FILE | jq ."
echo ""
