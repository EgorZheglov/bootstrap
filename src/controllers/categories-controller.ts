import to from 'await-to-js';

import * as dao from '../data-access/categories.dao';
import { Category, ID, NewCategory } from '../types';
import { debug, error } from '../libs/log';
import { errors, messages } from '../messages';

const {
  CANNOT_GET_CATEGORIES_LIST,
  CATEGORY_NOT_FOUND,
  CANNOT_CREATE_CATEGORY,
  CANNOT_DELETE_CATEGORY,
  CANNOT_UPDATE_CATEGORY,
} = errors;
const { CATEGORY_DELETED } = messages;

export async function find(): Promise<Category[]> {
  debug('Requesting a list of categories from db');
  const [err, list] = await to(dao.find());

  if (err) {
    error(err);
    throw CANNOT_GET_CATEGORIES_LIST;
  }
  /* eslint-disable-next-line @typescript-eslint/no-non-null-assertion */
  return list!;
}

export async function findById(id: ID): Promise<Category> {
  debug('Requesting category by id from db');
  const [err, category] = await to(dao.findById(id));

  if (err) {
    error(err);
    throw CATEGORY_NOT_FOUND;
  }
  /* eslint-disable-next-line @typescript-eslint/no-non-null-assertion */
  return category!;
}

export async function findByName(name: string): Promise<Category> {
  debug('Requesting category by name from db');
  const [err, category] = await to(dao.findByName(name));

  if (err) {
    error(err);
    throw CATEGORY_NOT_FOUND;
  }
  /* eslint-disable-next-line @typescript-eslint/no-non-null-assertion */
  return category!;
}

export async function findBySlug(slug: string): Promise<Category> {
  debug('Requesting category by slug from db');
  const [err, category] = await to(dao.findBySlug(slug));

  if (err) {
    error(err);
    throw CATEGORY_NOT_FOUND;
  }
  /* eslint-disable-next-line @typescript-eslint/no-non-null-assertion */
  return category!;
}

export async function create(data: NewCategory): Promise<Category> {
  debug('Creating category');
  const [err, category] = await to(dao.create(data));

  if (err) {
    error(err);
    throw CANNOT_CREATE_CATEGORY;
  }
  /* eslint-disable-next-line @typescript-eslint/no-non-null-assertion */
  return category!;
}

export async function update(data: Category): Promise<Category> {
  debug('Updating category with current data');
  const [err, category] = await to(dao.update(data));

  if (err) {
    error(err);
    throw CANNOT_UPDATE_CATEGORY;
  }
  /* eslint-disable-next-line @typescript-eslint/no-non-null-assertion */
  return category!;
}

export async function remove(id: ID): Promise<string> {
  debug('Removing category by current id');
  const [err] = await to(dao.remove(id));

  if (err) {
    error(err);
    throw CANNOT_DELETE_CATEGORY;
  }
  return CATEGORY_DELETED;
}
