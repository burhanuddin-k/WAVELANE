import 'dotenv/config';
import bcrypt from 'bcryptjs';
import db from './db.js';

async function main() {
  const email = process.env.ADMIN_EMAIL || 'admin@wavelane.app';
  const password = process.env.ADMIN_PASSWORD || 'admin1234';

  const existing = db.prepare('SELECT * FROM admins WHERE email = ?').get(email);
  if (existing) {
    console.log(`Admin already exists: ${email}`);
    return;
  }

  const passwordHash = await bcrypt.hash(password, 10);
  db.prepare('INSERT INTO admins (email, passwordHash, name) VALUES (?, ?, ?)').run(
    email,
    passwordHash,
    'Admin'
  );

  console.log('Admin account created:');
  console.log(`  email:    ${email}`);
  console.log(`  password: ${password}`);
  console.log('Log in at the admin app and change this password later.');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
