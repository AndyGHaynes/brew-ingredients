# Brew Ingredients

This is a simple API using MongoDB to store and query brewing
ingredients with Express providing basic REST endpoints.

To run, set up the config.js to point to a MongoDB instance
and execute 'npm start'.` Once the server is initialized, the
data collections will be created.

Example endpoints:
 - /Grains/{id}
 - /Hops/search/{query}
 - /Yeast/searchBy/{field}/{query}
 - /random
 