export default {
  express: {
    port: 5000
  },
  mongo: {
    database: 'BrewIngredients',
    url: 'mongodb://localhost:27017'
  },
  search: {
    defaultSearchKeys: [
      'name',
      'description',
      'characteristics',
      'code',
      'categories',
      'aroma',
      'styles',
      'flavor',
      'mfg'
    ],
    resultsLimit: 10
  }
}
