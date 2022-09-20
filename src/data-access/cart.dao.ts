import { QueryResult } from 'pg';

import db from '../db/db';
import cart from '../db/models/cart';
import { Cart, ID } from '../types';

export async function find(): Promise<Cart[] | null> {
  const result = await db.query(cart.findAll);
  if (!result || !result.rows) return null;
  return result.rows;
}

export async function findByOwnerId(ownerId: ID): Promise<Cart[] | null> {
  const result = await db.query(cart.findByOwnerId, [ownerId]);
  if (!result || !result.rows) return null;
  return result.rows;
}

export async function findByOwnerEmail(email: string): Promise<Cart[] | null> {
  const result = await db.query(cart.findByOwnerEmail, [email]);
  if (!result || !result.rows) return null;
  return result.rows;
}

export async function removeCart(ownerEmail: string): Promise<QueryResult> {
  const result = await db.query(cart.delete, [ownerEmail]);
  return result;
}

export async function removeProduct(
  ownerEmail: string,
  id: ID
): Promise<QueryResult> {
  const result = await db.query(cart.removeProduct, [ownerEmail, id]);
  return result;
}

export async function checkCartByProduct(
  email: string,
  productId: ID
): Promise<Cart> {
  const result = await db.query(cart.checkCartByProduct, [email, productId]);
  return result.rows[0];
}

export async function updateCart(cartId: ID, cartCount: number): Promise<Cart> {
  const params = [cartId, cartCount];
  const result = await db.query(cart.updateCart, params);
  return result.rows[0];
}

export async function addProductToCart(data: {
  email: string;
  productId: ID;
  count: number;
}): Promise<Cart> {
  const { email, productId, count } = data;
  const params = [email, productId, count];
  const result = await db.query(cart.addCart, params);
  return result.rows[0];
}

export async function decrementCountOfProducts(
  email: string,
  data: { id: ID; count: string }
): Promise<Cart> {
  const { id, count } = data;
  const params = [email, id, count];
  const result = await db.query(cart.decrementCountOfProducts, params);
  return result.rows[0];
}
