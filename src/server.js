import bodyParser from 'body-parser';
import express from 'express';

import config from './config';
import db from './db';
import { IngredientType } from './constants/search';

export function start() {
  db.initialize();
  const app = express();

  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({ extended: false }));

  Object.keys(IngredientType).forEach((key) => {
    const ingredientType = IngredientType[key];

    app.get(`/${ingredientType}/:id`, async (req, res) => {
      res.send(JSON.stringify({
        data: await db.getIngredient(req.params.id, ingredientType)
      }));
    });

    app.get(`/${ingredientType}/search/:query`, async (req, res) => {
      const { query } = req.params;
      res.send(JSON.stringify({
        data: await db.search(query, ingredientType)
      }));
    });

    app.get(`/${ingredientType}/searchBy/:key/:query`, async (req, res) => {
      const { query, key } = req.params;
      res.send(JSON.stringify({
        data: await db.search(query, ingredientType, key)
      }));
    });

  app.get('/random', async (req, res) => {
    res.send(JSON.stringify({
      data: await db.getRandomIngredient()
    }));
  });

  ((port) => {
    app.listen(port, () => console.log(`API running on localhost:${port}`));
  })(config.express.port);
}
