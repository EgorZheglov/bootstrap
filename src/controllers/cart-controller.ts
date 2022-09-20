import to from 'await-to-js';

import * as dao from '../data-access/cart.dao';
import { ID, Cart, TokenInfo } from '../types';
import { debug, error } from '../libs/log';
import { errors, messages } from '../messages';
import jwt from '../libs/jwt';

const {
  CANNOT_GET_CARTS_LIST,
  CANNOT_GET_CART,
  CANNOT_DELETE_CART,
  CANNOT_UPDATE_CART,
  CANNOT_ADD_PRODUCT,
  CANNOT_DELETE_PRODUCT,
} = errors;
const { CART_DELETED, PRODUCT_DELETED } = messages;

export async function findAllCarts(): Promise<Cart[]> {
  debug('Requesting a list carts from db');
  const [err, list] = await to(dao.find());

  if (err) {
    error(err);
    throw CANNOT_GET_CARTS_LIST;
  }
  /* eslint-disable-next-line @typescript-eslint/no-non-null-assertion */
  return list!;
}

export async function findCartByOwnerId(id: ID): Promise<Cart[]> {
  debug('Requesting cart by owner id from db');
  const [err, cart] = await to(dao.findByOwnerId(id));

  if (err) {
    error(err);
    throw CANNOT_GET_CART;
  }
  /* eslint-disable-next-line @typescript-eslint/no-non-null-assertion */
  return cart!;
}

export async function getCartByOwnerEmail(token: string): Promise<Cart[]> {
  debug('Requesting cart by owner email from db');
  const tokenInfo = (await jwt.check(token.split(' ')[1])) as TokenInfo;
  const { email } = tokenInfo;
  const [err, cart] = await to(dao.findByOwnerEmail(email));
  if (err) {
    error(err);
    throw CANNOT_GET_CART;
  }
  /* eslint-disable-next-line @typescript-eslint/no-non-null-assertion */
  return cart!;
}

export async function removeCart(token: string): Promise<string> {
  debug('Removing cart by owner email from db');
  const tokenInfo = (await jwt.check(token.split(' ')[1])) as TokenInfo;
  const { email } = tokenInfo;
  const [err] = await to(dao.removeCart(email));
  if (err) {
    error(err);
    throw CANNOT_DELETE_CART;
  }
  return CART_DELETED;
}

export async function removeProductFromCart(
  token: string,
  id: ID
): Promise<string> {
  debug('Removing cart by owner email from db');
  const tokenInfo = (await jwt.check(token.split(' ')[1])) as TokenInfo;
  const { email } = tokenInfo;
  const [err] = await to(dao.removeProduct(email, id));
  if (err) {
    error(err);
    throw CANNOT_DELETE_PRODUCT;
  }
  return PRODUCT_DELETED;
}

export async function addProductToCart(
  token: string,
  body: { id: ID; count: string }
): Promise<Cart> {
  debug("Adding product to user's cart");
  const tokenInfo = (await jwt.check(token.split(' ')[1])) as TokenInfo;
  const { email } = tokenInfo;
  const productId = body.id;
  let count = Number(body.count);

  // checking cart by owner email and productId
  const [errProdExists, productExists] = await to(
    dao.checkCartByProduct(email, productId)
  );
  count =
    !errProdExists && productExists
      ? Number(productExists.count) + count
      : count;

  // if product exists in cart update count of products
  if (productExists) {
    const [err, cart] = await to(dao.updateCart(productExists.id, count));
    if (err) {
      error(err);
      throw CANNOT_UPDATE_CART;
    }
    /* eslint-disable-next-line @typescript-eslint/no-non-null-assertion */
    return cart!;
  }

  // else add new product to cart
  const data = { email, productId, count };
  const [err, cart] = await to(dao.addProductToCart(data));
  if (err) {
    error(err);
    throw CANNOT_ADD_PRODUCT;
  }
  /* eslint-disable-next-line @typescript-eslint/no-non-null-assertion */
  return cart!;
}

export async function updateCart(
  token: string,
  body: { id: ID; count: string }
): Promise<Cart | string> {
  debug("Adding product to user's cart");
  const tokenInfo = (await jwt.check(token.split(' ')[1])) as TokenInfo;
  const { email } = tokenInfo;
  const [err, cart] = await to(dao.decrementCountOfProducts(email, body));
  if (err) {
    const pstgrMessage =
      'new row for relation "cart" violates check constraint "cart_count_check"';
    if (err.message === pstgrMessage) {
      // if after decrement count < 1 need delete this product from cart
      const [errorRemove] = await to(dao.removeProduct(email, body.id));
      if (errorRemove) {
        error(err);
        throw CANNOT_DELETE_PRODUCT;
      }
      return PRODUCT_DELETED;
    }
    error(err);
    throw CANNOT_UPDATE_CART;
  }
  /* eslint-disable-next-line @typescript-eslint/no-non-null-assertion */
  return cart!;
}
