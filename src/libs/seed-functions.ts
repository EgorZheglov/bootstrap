import { createCategory, createProduct, createUser } from './seed-models';
import { error } from './log';
import db from '../db/db';
import categoryQuery from '../db/models/categories';
import productQuery from '../db/models/products';
import userQuery from '../db/models/user';
import { errors } from '../messages';

const { ERROR_WITH_SEED } = errors;

export const createSeedUsers = async (lines: Array<number>) => {
  try {
    await lines.reduce(async (acc: any): Promise<any> => {
      await acc.then(() => db.query(userQuery.createUser, createUser()));
    }, Promise.resolve());
  } catch (err) {
    error(ERROR_WITH_SEED);
    throw new Error(ERROR_WITH_SEED);
  }
};

export const createSeedCategories = async (lines: Array<number>) => {
  try {
    await lines.reduce(async (acc: any): Promise<any> => {
      await acc.then(() => db.query(categoryQuery.add, createCategory()));
    }, Promise.resolve());
  } catch (err) {
    error(ERROR_WITH_SEED);
    throw new Error(ERROR_WITH_SEED);
  }
};

export const createSeedProducts = async (
  lines: Array<number>,
  amountofCategories: number
) => {
  try {
    await lines.reduce(async (acc: any, item): Promise<any> => {
      await acc.then(() =>
        db.query(productQuery.create, createProduct(item, amountofCategories))
      );
    }, Promise.resolve());
  } catch (err) {
    error(ERROR_WITH_SEED);
    throw new Error(ERROR_WITH_SEED);
  }
};
