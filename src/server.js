import { MongoClient } from 'mongodb';

import ingredients from './ingredient-data';

const truncateCollections = false;
const collections = {
  Grains: ingredients.grains,
  Hops: ingredients.hops,
  Yeast: ingredients.yeast
};

export function start() {
  const url = 'mongodb://localhost:27017';
  const name = 'BrewIngredients';

  MongoClient.connect(url, async (err, client) => {
    await initializeCollections(client.db(name));
    client.close();
  });
}

async function initializeCollections(db) {
  return Promise.all(Object.keys(collections).map(async (collectionName) => {
    const collection = db.collection(collectionName);
    const documents = collections[collectionName];

    let documentCount = 0;
    if (truncateCollections) {
      try {
        await collection.drop();
      } catch (e) {
        console.error(e);
      }
    } else {
      documentCount = await collection.count();
    }

    if (documentCount === 0) {
      await db.createCollection(collectionName, {
        validator: {
          $and: [
            { name: { $type: 'string' } }
          ]
        }
      });
    }

    if (documentCount === 0) {
      return await collection.insertMany(documents);
    }
  }));
}
