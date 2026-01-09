const bcrypt = require('bcryptjs');
const { query } = require('./config/db');

async function createAdminUser() {
  const email = process.argv[2] || 'admin@example.com';
  const password = process.argv[3] || 'admin123';
  const name = process.argv[4] || 'Admin User';

  try {
    // Hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Insert the admin user into the database
    const result = await query(
      'INSERT INTO users (email, password_hash, name, role, created_at) VALUES ($1, $2, $3, $4, $5) RETURNING id, email, name, role',
      [email, hashedPassword, name, 'admin', new Date()]
    );

    console.log('Admin user created successfully!');
    console.log('ID:', result.rows[0].id);
    console.log('Email:', result.rows[0].email);
    console.log('Name:', result.rows[0].name);
    console.log('Role:', result.rows[0].role);
    console.log('\nYou can now log in to the admin panel with these credentials.');
  } catch (error) {
    if (error.code === '23505') { // Unique violation error code
      console.error('Error: A user with this email already exists.');
    } else {
      console.error('Error creating admin user:', error.message);
    }
  }
}

// Run the function if this file is executed directly
if (require.main === module) {
  createAdminUser();
}

module.exports = { createAdminUser };