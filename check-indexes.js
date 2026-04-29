const { MongoClient } = require('mongodb');

async function main() {
  const uri = 'mongodb://127.0.0.1:27017/attendance_app';
  const client = new MongoClient(uri);

  try {
    await client.connect();
    const db = client.db('attendance_app');
    
    const indexes = await db.collection('students').indexes();
    console.log('Indexes on students collection:', JSON.stringify(indexes, null, 2));
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await client.close();
  }
}

main().catch(console.error);
