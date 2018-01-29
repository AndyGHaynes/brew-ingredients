import { MongoClient, ObjectId } from 'mongodb';

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

function sanitizeRegexInput(input) {
  return input.replace(/[^ 0-9a-z]/ig, '');
}

async function queryDb(operation) {
  let client;
  try {
    client = await openConnection();
    return await operation(getDatabase(client));
  } catch (e) {
    console.error(e);
  } finally {
    client && await client.close();
  }
}

async function initialize() {
  await queryDb(async (db) => await initializeCollections(db));
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

async function getIngredient(id, ingredientType) {
  await queryDb(async (client, db) =>
    await db.collection(ingredientType)
      .findOne(ObjectId(id))
  );
}

async function search(query, ingredientType, key) {
  return await queryDb(async (db) => {
    if (Object.keys(Collections).includes(ingredientType)) {
      return await searchIngredients(db.collection(ingredientType), key, query);
    }
  });
}

async function searchIngredients(collection, key, query) {
  const sanitizedQuery = sanitizeRegexInput(query);
  const regexPredicate = {
    $regex: new RegExp(`.*${sanitizedQuery}.*`),
    $options: 'i'
  };

  let predicate;
  if (key) {
    predicate = {
      [key]: regexPredicate
    };
  } else {
    const defaultSearchKeys = [
      'name',
      'description',
      'characteristics',
      'code',
      'categories',
      'aroma',
      'styles',
      'flavor',
      'mfg'
    ];

    predicate = {
      $or: defaultSearchKeys.map(k => ({
        [k]: regexPredicate
      }))
    };
  }

  return await collection
    .find(predicate)
    .limit(10)
    .toArray();
}

export default {
  initialize,
  getIngredient,
  search
}
