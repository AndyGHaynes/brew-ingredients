import { MongoClient } from 'mongodb';

import ingredients from './ingredient-data';
import { IngredientType } from './constants/search';

const TruncateCollections = false;
const Collections = {
  [IngredientType.Grain]: ingredients.grains,
  [IngredientType.Hop]: ingredients.hops,
  [IngredientType.Yeast]: ingredients.yeast
};

async function openConnection() {
  const url = 'mongodb://localhost:27017';
  return await MongoClient.connect(url);
}

function getDatabase(client) {
  const databaseName = 'BrewIngredients';
  return client.db(databaseName);
}

export async function initialize() {
  let client;
  try {
    client = await openConnection();
    await initializeCollections(getDatabase(client));
  } catch (e) {
    console.error(e);
  } finally {
    client && await client.close();
  }
}

async function initializeCollections(db) {
  return Promise.all(Object.keys(Collections).map(async (collectionName) => {
    const collection = db.collection(collectionName);
    const documents = Collections[collectionName];

    let documentCount = 0;
    if (TruncateCollections) {
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

export default {
  initialize
}
