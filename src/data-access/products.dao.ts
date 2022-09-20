import { QueryResult } from 'pg';

import { ID, NewProduct, Product, ProductSearchRequest } from '../types';
import db from '../db/db';
import product from '../db/models/products';

// Create product
export async function create(data: NewProduct): Promise<Product | null> {
  const params = [
    data.author_id,
    data.category_id,
    data.name,
    data.slug,
    new Date(Date.now()),
    0,
    data.price,
    data.description,
    data.images,
    data.draft,
  ];
  const result = await db.query(product.create, params);
  if (!result || !result.rows || !result.rows.length) return null;
  return result.rows[0];
}

// Get list of products
export async function find(): Promise<Product[] | null> {
  const result = await db.query(product.find);
  if (!result || !result.rows || !result.rows.length) return null;
  return result.rows;
}

// Find product by name With Increment 'number_of_views'
export async function findByName(productName: string): Promise<Product | null> {
  const params = [productName];
  const result = await db.query(product.findByNameWI, params);
  if (!result || !result.rows || !result.rows.length) return null;
  return result.rows[0];
}

// Gets product's list uses page, perPage, orderColumn, orderRule
export async function findDefaultSearch(
  payload: ProductSearchRequest,
  role: string
): Promise<Product[] | null> {
  const result = await db.query(product.findDefaultProducts(payload, role));
  if (!result || !result.rows || !result.rows.length) return null;
  return result.rows;
}

// Gets product's list by name uses LIKE, page, perPage, orderColumn, orderRule
export async function findByNameLike(
  payload: ProductSearchRequest,
  role: string
): Promise<Product[] | null> {
  const result = await db.query(product.findByNameLike(payload, role));
  if (!result || !result.rows || !result.rows.length) return null;
  return result.rows;
}

// Gets product's list by category uses price, page, perPage, orderColumn, orderRule
export async function findByCategory(
  payload: ProductSearchRequest,
  role: string
): Promise<Product[] | null> {
  const result = await db.query(product.findByCategory(payload, role));
  if (!result || !result.rows || !result.rows.length) return null;
  return result.rows;
}

// Find product by ID
export async function findById(productId: ID): Promise<Product | null> {
  const params = [productId];
  const result = await db.query(product.findById, params);
  if (!result || !result.rows || !result.rows.length) return null;
  return result.rows[0];
}

// Find product by ID With Increment 'number_of_views'
export async function findByIdWI(productId: ID): Promise<Product | null> {
  const params = [productId];
  const result = await db.query(product.findByIdWI, params);
  if (!result || !result.rows || !result.rows.length) return null;
  return result.rows[0];
}

// Find product by slug
export async function findBySlug(productSlug: string): Promise<Product | null> {
  const params = [productSlug];
  const result = await db.query(product.findBySlug, params);
  if (!result || !result.rows || !result.rows.length) return null;
  return result.rows[0];
}

// Update product
export async function update(data: Product): Promise<Product | null> {
  const params = [
    data.id,
    data.name,
    data.slug,
    data.price,
    data.description,
    data.images,
    data.draft,
  ];
  const result = await db.query(product.update, params);
  if (!result || !result.rows || !result.rows.length) return null;
  return result.rows[0];
}

// Delete product by ID
export async function remove(productId: ID): Promise<QueryResult> {
  const params = [productId];
  const result = await db.query(product.delete, params);
  return result;
}
