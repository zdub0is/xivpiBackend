const { MongoClient } = require('mongodb');

const uri = process.env['DB_URL'];
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

async function connect() {
  await client.connect();
  return client.db('contentV2').collection('items');
}

module.exports = { connect };