const fs = require('fs');
const path = require('path');

// https://jlongster.com/Backend-Apps-with-Webpack--Part-I
const nodeModules = fs.readdirSync('node_modules')
  .reduce((modules, mod) => {
    if (mod !== '.bin') {
      modules[mod] = `commonjs ${mod}`;
    }
    return modules;
  }, {});

module.exports = {
  entry: ['babel-polyfill', './index.js'],
  target: 'node',
  output: {
    path: path.join(__dirname, 'dist'),
    filename: 'bundle.js'
  },
  module: {
    loaders: [{
      test: /.js$/,
      loader: 'babel-loader',
      exclude: '/node_modules/',
      query: {
        presets: [
          'env'
        ]
      }
    }]
  },
  externals: nodeModules
};
