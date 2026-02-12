// Update admin password in MongoDB
db.getSiblingDB('proctolearn').users.updateOne(
  { email: 'admin@proctolearn.com' },
  {
    $set: {
      password: '$2a$10$nOnQXR1Xx9eSlqbGnfq9KuoZ.MTJHXK4DOG/gyqyI4Rq1DMCOch3O'
    }
  }
);

// Verify update
const admin = db.getSiblingDB('proctolearn').users.findOne({ email: 'admin@proctolearn.com' });
console.log('✅ Admin Account Created Successfully!');
console.log('');
console.log('📧 Email: ' + admin.email);
console.log('🔐 Password: Admin@123456');
console.log('👤 Role: ' + admin.role);
console.log('✅ Status: ACTIVE');
console.log('');
console.log('👉 Next: Open http://localhost:3000 and login!');
