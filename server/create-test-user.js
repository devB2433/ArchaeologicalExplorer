const bcrypt = require('bcryptjs');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Default test account credentials
const DEFAULT_EMAIL = 'user@a.com';
const DEFAULT_PASSWORD = 'n^*6RPacV!a$gS';
const DEFAULT_USERNAME = 'TestUser';

// Get email and password from command line arguments or use defaults
const email = process.argv[2] || DEFAULT_EMAIL;
const password = process.argv[3] || DEFAULT_PASSWORD;
const username = process.argv[4] || DEFAULT_USERNAME;

const dbPath = path.join(__dirname, '../data/database.sqlite');
const db = new sqlite3.Database(dbPath);

console.log('🔐 Creating test account...');
console.log('   Email:', email);
console.log('   Username:', username);

bcrypt.hash(password, 10, (err, hash) => {
  if (err) {
    console.error('❌ Hash error:', err);
    db.close();
    process.exit(1);
  }
  
  // Delete existing user first
  db.run('DELETE FROM users WHERE email = ?', [email], function(delErr) {
    if (delErr) {
      console.error('⚠️  Delete error:', delErr.message);
    } else if (this.changes > 0) {
      console.log('🗑️  Deleted existing user');
    }
    
    // Insert new user
    db.run(
      'INSERT INTO users (email, password_hash, username, level, experience, is_verified) VALUES (?, ?, ?, ?, ?, ?)',
      [email, hash, username, 1, 0, 1],
      function(err) {
        if (err) {
          console.error('❌ Insert error:', err.message);
        } else {
          console.log('\n✅ Test account created successfully!');
          console.log('   ID:', this.lastID);
          console.log('   Email:', email);
          console.log('   Password:', password);
          console.log('   Username:', username);
          console.log('   Level: 1');
          console.log('   Verified: Yes');
        }
        db.close();
      }
    );
  });
});
