import to from 'await-to-js';

import {
  createSeedCategories,
  createSeedProducts,
  createSeedUsers,
} from '../libs/seed-functions';
import { error } from '../libs/log';
import db from './db';
import schema from './db-migration';
import shopQuery from './models/shop';

const lines: Array<number> = [];
const linesForCategories: Array<number> = [];
const amountOfCategories = 5;

for (let i = 0; i < 15; i += 1) {
  lines.push(i);
}

for (let i = 0; i < 5; i += 1) {
  linesForCategories.push(i);
}

// connect - drop - create - seed
const seed = async () => {
  await db.connect();
  const [existedSchemaErr, existedSchemaRes] = await to(
    db.query(shopQuery.selectExistedSchema)
  );
  if (existedSchemaErr || !existedSchemaRes) {
    error(existedSchemaErr);
    throw existedSchemaErr;
  }
  const existedSchema = existedSchemaRes.rows[0];

  if (existedSchema) {
    await db.query(shopQuery.dropSchema);
  }

  await schema.update();
  await createSeedUsers(lines);
  await createSeedCategories(linesForCategories);
  await createSeedProducts(lines, amountOfCategories);
  await db.disconnect();
};

seed();
