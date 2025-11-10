#!/bin/bash

# Archaeological Explorer - Data Check Script
# This script checks database status and user data

CONTAINER_NAME="archaeology-game-app"

echo "📊 Archaeological Explorer - Data Check"
echo "========================================"
echo ""

# Check if container is running
if ! docker ps --format '{{.Names}}' | grep -q "^${CONTAINER_NAME}$"; then
    echo "❌ Container ${CONTAINER_NAME} is not running!"
    exit 1
fi

echo "✅ Container is running"
echo ""

# Check database file location
echo "🗄️  Database File Location:"
docker exec ${CONTAINER_NAME} find /app -name "database.sqlite" 2>/dev/null
echo ""

# Check database file in /app/data/
echo "📁 Database in Volume (/app/data/):"
docker exec ${CONTAINER_NAME} ls -lh /app/data/database.sqlite 2>/dev/null || echo "   ⚠️  No database found in /app/data/"
echo ""

# Count users
echo "👥 User Statistics:"
docker exec ${CONTAINER_NAME} node -e "
const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('/app/data/database.sqlite');
db.get('SELECT COUNT(*) as count FROM users', (err, row) => {
  if (err) {
    console.log('   ❌ Error:', err.message);
  } else {
    console.log('   Total users:', row.count);
  }
  db.close();
});
" 2>/dev/null
echo ""

# List recent users
echo "📋 Recent Users (Last 5):"
docker exec ${CONTAINER_NAME} node -e "
const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('/app/data/database.sqlite');
db.all('SELECT id, email, username, level, experience, is_verified, created_at FROM users ORDER BY id DESC LIMIT 5', (err, rows) => {
  if (err) {
    console.log('   ❌ Error:', err.message);
  } else if (rows.length === 0) {
    console.log('   ℹ️  No users found');
  } else {
    rows.forEach(r => {
      const verified = r.is_verified ? '✅' : '⏳';
      console.log(\`   \${verified} ID:\${r.id} | \${r.email} | Level:\${r.level} | EXP:\${r.experience} | Created:\${r.created_at}\`);
    });
  }
  db.close();
});
" 2>/dev/null
echo ""

# Count discoveries
echo "🏺 Discovery Statistics:"
docker exec ${CONTAINER_NAME} node -e "
const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('/app/data/database.sqlite');
db.get('SELECT COUNT(*) as count FROM user_discoveries', (err, row) => {
  if (err) {
    console.log('   ❌ Error:', err.message);
  } else {
    console.log('   Total discoveries:', row.count);
  }
  db.close();
});
" 2>/dev/null
echo ""

# Check container logs for database path
echo "🔍 Database Path from Logs:"
docker logs ${CONTAINER_NAME} 2>&1 | grep "Database path" | tail -1
echo ""

echo "✅ Data check completed!"
