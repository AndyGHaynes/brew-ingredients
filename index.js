const mongo = require('mongodb').MongoClient;

const url = 'mongodb://localhost:27017';
const name = 'BrewIngredients';

mongo.connect(url, function(err, client) {
  const db = client.db(name);
  client.close();
});
