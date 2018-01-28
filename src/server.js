import { MongoClient } from 'mongodb';

export function start() {
  const url = 'mongodb://localhost:27017';
  const name = 'BrewIngredients';

  MongoClient.connect(url, (err, client) => {
    const db = client.db(name);
    client.close();
  });
}
