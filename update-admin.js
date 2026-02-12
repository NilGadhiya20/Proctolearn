const { MongoClient } = require('mongodb');

const uri = 'mongodb://localhost:27017/proctolearn';
const client = new MongoClient(uri);

async function updateAdmin() {
  try {
    await client.connect();
    const db = client.db('proctolearn');
    const usersCollection = db.collection('users');
    
    // Update the admin user with the correct password hash
    const result = await usersCollection.updateOne(
      { email: 'admin@proctolearn.com' },
      {
        $set: {
          password: '$2a$10$nOnQXR1Xx9eSlqbGnfq9KuoZ.MTJHXK4DOG/gyqyI4Rq1DMCOch3O'
        }
      }
    );
    
    console.log('✅ Admin password updated successfully!');
    console.log(`Matched: ${result.matchedCount}, Modified: ${result.modifiedCount}`);
    
    // Verify the update
    const adminUser = await usersCollection.findOne({ email: 'admin@proctolearn.com' });
    console.log('\n✅ Admin user details:');
    console.log(`   Email: ${adminUser.email}`);
    console.log(`   Name: ${adminUser.firstName} ${adminUser.lastName}`);
    console.log(`   Role: ${adminUser.role}`);
    console.log(`   Status: Active`);
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await client.close();
  }
}

updateAdmin();
