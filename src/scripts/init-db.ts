import { config } from 'dotenv';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

// Load environment variables from .env.local
config({ path: '.env.local' });

import Admin from '../models/Admin';
import Link from '../models/Link';
import Click from '../models/Click';

async function initDB() {
  const MONGODB_URI = process.env.MONGODB_URI;
  if (!MONGODB_URI) {
    console.error('ERROR: MONGODB_URI is not defined in .env.local');
    process.exit(1);
  }

  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB successfully.');

    console.log('Creating collections if they do not exist...');
    await Admin.createCollection();
    await Link.createCollection();
    await Click.createCollection();

    console.log('Syncing indexes...');
    await Admin.syncIndexes();
    await Link.syncIndexes();
    await Click.syncIndexes();

    console.log('Checking for admin user...');
    const adminUsername = process.env.ADMIN_USERNAME;
    const adminPassword = process.env.ADMIN_PASSWORD;

    if (adminUsername && adminPassword) {
      const existingAdmin = await Admin.findOne({ username: adminUsername });
      if (!existingAdmin) {
        console.log(`Creating default admin user: ${adminUsername}`);
        const passwordHash = await bcrypt.hash(adminPassword, 10);
        await Admin.create({ username: adminUsername, passwordHash });
        console.log('Default admin user created.');
      } else {
        console.log('Admin user already exists. Skipping creation.');
      }
    } else {
      console.log('ADMIN_USERNAME or ADMIN_PASSWORD not set in environment. Skipping admin creation.');
    }

    console.log('Database initialization completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error during database initialization:', error);
    process.exit(1);
  }
}

initDB();
