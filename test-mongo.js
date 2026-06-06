const { MongoClient } = require('mongodb');

async function test() {
  const uri = "mongodb://sarahjeancaldeira91_db_user:Shojib123@ac-huuqvjv-shard-00-00.w3odaof.mongodb.net:27017,ac-huuqvjv-shard-00-01.w3odaof.mongodb.net:27017,ac-huuqvjv-shard-00-02.w3odaof.mongodb.net:27017/yourshortly?ssl=true&replicaSet=atlas-huuqvjv-shard-0&authSource=admin&retryWrites=true&w=majority&appName=yourshortly-cluster";
  console.log('Testing connection to MongoDB without SRV...');
  try {
    const client = new MongoClient(uri, { serverSelectionTimeoutMS: 5000 });
    await client.connect();
    console.log('Connection successful!');
    await client.close();
  } catch (err) {
    console.error('Connection failed:', err);
    process.exit(1);
  }
}

test();
