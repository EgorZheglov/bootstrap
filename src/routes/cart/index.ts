import { NextFunction, Request, Response, Router } from 'express';
import to from 'await-to-js';

import { ERR } from '../../types';
import { error } from '../../libs/log';
import {
  getCartByOwnerEmail,
  addProductToCart,
  removeCart,
  removeProductFromCart,
  updateCart,
} from '../../controllers/cart-controller';
import sanitizeRequests from '../../middlewares/sanitize-requests.middleware';

const router = Router();

router.get('/cart', async (req: Request, res: Response, next: NextFunction) => {
  // Get current cart state for the user from DB
  /* eslint-disable-next-line @typescript-eslint/no-non-null-assertion */
  const token = req.headers.authorization!;
  const [err, list] = await to(getCartByOwnerEmail(token));
  if (err) {
    error(err);
    return next(ERR.ERROR_GETTING_CART);
  }
  return res.status(200).send(list);
});

router.post(
  '/cart',
  async (req: Request, res: Response, next: NextFunction) => {
    // Add product to cart of current user
    /* eslint-disable-next-line @typescript-eslint/no-non-null-assertion */
    const token = req.headers.authorization!;
    const { body } = req;
    const [err, cart] = await to(addProductToCart(token, body));
    if (err) {
      error(err);
      return next(ERR.ERROR_DURING_EXECUTING);
    }
    return res.status(200).send(cart);
  }
);

router.put('/cart', async (req: Request, res: Response, next: NextFunction) => {
  // Update count of products in user's cart
  /* eslint-disable-next-line @typescript-eslint/no-non-null-assertion */
  const token = req.headers.authorization!;
  const { body } = req;
  const [err, cart] = await to(updateCart(token, body));
  if (err) {
    error(err);
    return next(ERR.ERROR_DURING_EXECUTING);
  }
  return res.status(200).send(cart);
});

router.delete(
  '/cart',
  async (req: Request, res: Response, next: NextFunction) => {
    // Delete all products from cart of current user
    /* eslint-disable-next-line @typescript-eslint/no-non-null-assertion */
    const token = req.headers.authorization!;
    const [err, response] = await to(removeCart(token));
    if (err) {
      error(err);
      return next(ERR.ERROR_DURING_EXECUTING);
    }
    return res.status(200).send(response);
  }
);

router.delete(
  '/cart/:productId',
  sanitizeRequests,
  async (req: Request, res: Response, next: NextFunction) => {
    // Delete product from cart of current user
    /* eslint-disable-next-line @typescript-eslint/no-non-null-assertion */
    const token = req.headers.authorization!;
    const [err, response] = await to(
      removeProductFromCart(token, req.params.productId)
    );
    if (err) {
      error(err);
      return next(ERR.ERROR_DURING_EXECUTING);
    }
    return res.status(200).send(response);
  }
);

export default router;
