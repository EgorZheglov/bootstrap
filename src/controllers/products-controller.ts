import fs from 'fs';
import to from 'await-to-js';

import * as dao from '../data-access/products.dao';
import { FILE_UPLOAD_DIRECTORY, PRODUCTS_FILTER_CACHE_TTL } from '../config';
import { ID, NewProduct, Product, ProductSearchRequest } from '../types';
import { debug, error } from '../libs/log';
import { errors } from '../messages';
import contains from '../libs/arrays-intersection';

const {
  CANNOT_CREATE_PRODUCT,
  CANNOT_DELETE_PRODUCT,
  CANNOT_GET_PRODUCT,
  CANNOT_GET_PRODUCTS_LIST,
  CANNOT_UPDATE_PRODUCT,
  PRODUCT_NOT_FOUND,
  CANNOT_ADD_IMAGE,
} = errors;

// Create product
export async function create(data: NewProduct): Promise<Product> {
  debug('Creating product');
  if (data.images) {
    let uploadedImages: string[] = [];
    uploadedImages = fs.readdirSync(FILE_UPLOAD_DIRECTORY);
    const checkImages = contains(uploadedImages, data.images);
    if (!checkImages) {
      throw CANNOT_ADD_IMAGE;
    }
  }
  const [err, product] = await to(dao.create(data));
  if (err) {
    error(err);
    throw CANNOT_CREATE_PRODUCT;
  }
  /* eslint-disable-next-line @typescript-eslint/no-non-null-assertion */
  return product!;
}

// Get list of products from DB
export const find = (function (): (
  payload: ProductSearchRequest,
  role: string
) => Promise<Product[] | null> {
  let productsDao;
  const lengthSearchedName = 3;
  // creating local cache object (memoization)
  const findCache: {
    [key: string]: {
      payload: Product[];
      timestamp: number;
    };
  } = {};
  return async (
    payload: ProductSearchRequest,
    role: string
  ): Promise<Product[] | null> => {
    const cacheKey = JSON.stringify(payload);
    const cacheTimestamp = new Date().getTime();
    if (
      findCache[cacheKey] &&
      findCache[cacheKey].timestamp + PRODUCTS_FILTER_CACHE_TTL >=
        cacheTimestamp
    ) {
      return findCache[cacheKey].payload;
    }
    if (
      payload.category &&
      typeof payload.category === 'string' &&
      payload.category.length !== 0
    ) {
      productsDao = dao.findByCategory;
    } else if (
      payload.name &&
      typeof payload.name === 'string' &&
      payload.name.length >= lengthSearchedName
    ) {
      productsDao = dao.findByNameLike;
    } else {
      productsDao = dao.findDefaultSearch;
    }
    const [err, list] = await to(productsDao(payload, role));
    if (err) {
      error(err);
      throw CANNOT_GET_PRODUCTS_LIST;
    }
    findCache[cacheKey] = {
      /* eslint-disable-next-line @typescript-eslint/no-non-null-assertion */
      payload: list!,
      timestamp: cacheTimestamp,
    };
    /* eslint-disable-next-line @typescript-eslint/no-non-null-assertion */
    return list!;
  };
})();

export async function findByName(name: string): Promise<Product | null> {
  debug('Requesting product by name from db');
  const [err, product] = await to(dao.findByName(name));
  if (err || !product) {
    error(err);
    throw CANNOT_GET_PRODUCT;
  }

  return product;
}

export async function findById(id: ID): Promise<Product | null> {
  debug('Requesting product by id from db');
  const [err, product] = await to(dao.findByIdWI(id));
  if (err || !product) {
    error(err);
    throw CANNOT_GET_PRODUCT;
  }

  return product;
}

export async function update(data: Product): Promise<Product | null> {
  debug('Updating product with current data');
  const productData = { ...data };
  const [errInDb, existedProduct] = await to(dao.findById(productData.id));
  if (errInDb || !existedProduct) {
    error(errInDb);
    throw PRODUCT_NOT_FOUND;
  }
  if (data.images) {
    let uploadedImages: string[] = [];
    uploadedImages = fs.readdirSync(FILE_UPLOAD_DIRECTORY);
    const checkImages = contains(uploadedImages, data.images);
    if (!checkImages) {
      throw CANNOT_ADD_IMAGE;
    }
  }
  const [err, updatedProduct] = await to(
    dao.update({ ...existedProduct, ...productData })
  );
  if (err || !updatedProduct) {
    error(err);
    throw CANNOT_UPDATE_PRODUCT;
  }
  return updatedProduct;
}

export async function remove(id: ID): Promise<null> {
  debug('Removing product by current id');
  const [err] = await to(dao.remove(id));
  if (err) {
    error(err);
    throw CANNOT_DELETE_PRODUCT;
  }

  return null;
}
