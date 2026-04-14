require('dotenv').config();

const mongoose = require('mongoose');
const connectDB = require('../config/db');
const User = require('../models/User');

const { ADMIN_SEED_EMAIL, ADMIN_SEED_PASSWORD, ADMIN_SEED_NAME } = process.env;

if (!ADMIN_SEED_EMAIL || !ADMIN_SEED_PASSWORD) {
  console.error(
    'Usage: ADMIN_SEED_EMAIL=xxx ADMIN_SEED_PASSWORD=xxx npm run seed'
  );
  console.error('Set these values in your .env file or pass them inline.');
  process.exit(1);
}

const seedAdmin = async () => {
  try {
    await connectDB();

    const existingAdmin = await User.findOne({ role: 'admin' });

    if (existingAdmin) {
      console.log('Admin already exists');
      process.exit(0);
    }

    await User.create({
      name: ADMIN_SEED_NAME || 'Admin',
      email: ADMIN_SEED_EMAIL,
      password: ADMIN_SEED_PASSWORD,
      role: 'admin',
    });

    console.log(`Admin created with email: ${ADMIN_SEED_EMAIL}`);
    process.exit(0);
  } catch (err) {
    console.error('Seed failed:', err.message);
    process.exit(1);
  }
};

seedAdmin();
