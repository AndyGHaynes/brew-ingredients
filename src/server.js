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

  MongoClient.connect(url, (err, client) => {
    initializeCollections(client.db(name))
      .then(() => {
        client.close();
      });
  });
}

function initializeCollections(db) {
  return Promise.all(Object.keys(collections).map((collectionName) =>
    new Promise((resolve, reject) => {
      const collection = db.collection(collectionName);

      function create() {
        return db.createCollection(collectionName, {
          validator: {
            $and: [
              { name: { $type: 'string' } }
            ]
          }
        });
      }

      function dropAndCreate() {
        return collection.drop()
          .then(create)
          .catch(console.error);
      }

      (truncateCollections ? dropAndCreate() : create())
        .then(() => collection.count())
        .then((count) => {
          if (count === 0) {
            collection
              .insertMany(collections[collectionName])
              .then(resolve)
              .catch(console.error);
          }
        })
        .then(resolve)
        .catch(reject);
    })
  ));
}
