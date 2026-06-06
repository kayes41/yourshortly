import { config } from 'dotenv';
import mongoose from 'mongoose';

config({ path: '.env.local' });

import Link from '../models/Link';
import Click from '../models/Click';

async function verify() {
  const MONGODB_URI = process.env.MONGODB_URI;
  if (!MONGODB_URI) {
    console.error('ERROR: MONGODB_URI is not defined in .env.local');
    process.exit(1);
  }

  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to DB for verification.');

    // 1. Create a link
    console.log('Creating a test link...');
    const testSlug = `test-${Date.now()}`;
    const link = await Link.create({
      slug: testSlug,
      targetUrl: 'https://example.com/test1',
    });
    console.log(`Link created: /${link.slug} -> ${link.targetUrl}`);

    // 2. Edit a link
    console.log('Editing the test link...');
    link.targetUrl = 'https://example.com/test2';
    await link.save();
    console.log(`Link edited: /${link.slug} -> ${link.targetUrl}`);

    // 3. Simulate click
    console.log('Simulating a click...');
    await Click.create({
      slug: link.slug,
      country: 'US',
      browser: 'Chrome',
      device: 'Desktop',
      ipHash: 'fake-hash',
    });
    link.clicks += 1;
    await link.save();
    console.log(`Click registered. Total clicks: ${link.clicks}`);

    // 4. Verify Analytics
    console.log('Verifying analytics...');
    const clickCount = await Click.countDocuments({ slug: link.slug });
    console.log(`Found ${clickCount} clicks in the DB for ${link.slug}`);

    // 5. Delete a link
    console.log('Deleting the test link...');
    await Link.deleteOne({ slug: link.slug });
    await Click.deleteMany({ slug: link.slug });
    console.log('Link and its clicks deleted.');

    console.log('Verification completed successfully!');
    process.exit(0);
  } catch (err) {
    console.error('Error during verification:', err);
    process.exit(1);
  }
}

verify();
