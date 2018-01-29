import { MongoClient, ObjectId } from 'mongodb';

import config from './config';
import ingredients from './ingredient-data';
import { IngredientType } from './constants/search';

const TruncateCollections = false;
const Collections = {
  [IngredientType.Grain]: ingredients.grains,
  [IngredientType.Hop]: ingredients.hops,
  [IngredientType.Yeast]: ingredients.yeast
};

async function openConnection() {
  return await MongoClient.connect(config.mongo.url);
}

function getDatabase(client) {
  return client.db(config.mongo.database);
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

async function getRandomIngredient() {
  return await queryDb(async (db) => {
    const keys = Object.keys(IngredientType);
    const ingredientType = IngredientType[keys[Math.ceil(Math.random() * 509) % keys.length]];
    return (await db.collection(ingredientType)
      .aggregate({
        $sample: { size: 1 }
      })
      .limit(1)
      .toArray())[0];
  });
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
    predicate = {
      $or: config.search.defaultSearchKeys.map(k => ({
        [k]: regexPredicate
      }))
    };
  }

  return await collection
    .find(predicate)
    .limit(config.search.resultsLimit)
    .toArray();
}

export default {
  initialize,
  getIngredient,
  getRandomIngredient,
  search
}
