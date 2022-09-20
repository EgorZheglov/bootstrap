import { QueryResult } from 'pg';

import { Category, ID, NewCategory } from '../types';
import db from '../db/db';
import query from '../db/models/categories';

// Create new category
export async function create(data: NewCategory): Promise<Category | null> {
  const result = await db.query(query.add, [data.name, data.slug]);
  if (!result || !result.rows || !result.rows.length) return null;
  return result.rows[0];
}

// Get list of all categories
export async function find(): Promise<Category[] | null> {
  const result = await db.query(query.findAll);
  if (!result || !result.rows || !result.rows.length) return null;
  return result.rows;
}

// Find category by ID
export async function findById(categoryId: ID): Promise<Category | null> {
  const result = await db.query(query.findById, [categoryId]);
  if (!result || !result.rows || !result.rows.length) return null;
  return result.rows[0];
}

// Find category by name
export async function findByName(name: string): Promise<Category | null> {
  const result = await db.query(query.findByName, [name]);
  if (!result || !result.rows || !result.rows.length) return null;
  return result.rows[0];
}

// Find category by slug
export async function findBySlug(slug: string): Promise<Category | null> {
  const result = await db.query(query.findBySlug, [slug]);
  if (!result || !result.rows || !result.rows.length) return null;
  return result.rows[0];
}

// Update category
export async function update(data: Category): Promise<Category | null> {
  const params = [data.id, data.name, data.slug];
  const result = await db.query(query.update, params);
  if (!result || !result.rows || !result.rows.length) return null;
  return result.rows[0];
}

// Delete category by ID
export async function remove(categoryId: ID): Promise<QueryResult> {
  const result = await db.query(query.delete, [categoryId]);
  return result;
}
