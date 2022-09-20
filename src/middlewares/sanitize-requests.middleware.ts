import { NextFunction, Request, Response } from 'express';
import { body, param, validationResult } from 'express-validator';

import { ERR } from '../types';

export default async (req: Request, res: Response, next: NextFunction) => {
  if (req.path === '/login' || req.path === '/signup') {
    await body('email')
      .not()
      .isEmpty()
      .trim()
      .isEmail()
      .normalizeEmail()
      .run(req);
  }
  if (req.path === '/signup') {
    await body('name').not().isEmpty().trim().escape().run(req);
  }
  if (req.path.startsWith('/products') && req.params.productId) {
    await param('productId')
      .isNumeric()
      .withMessage('productId must be numeric')
      .run(req);
  }
  if (req.path.startsWith('/categories') && req.params.categoryId) {
    await param('categoryId')
      .isNumeric()
      .withMessage('categoryId must be numeric')
      .run(req);
  }
  if (req.path.startsWith('/users') && req.params.userId) {
    await param('userId')
      .isNumeric()
      .withMessage('userId must be numeric')
      .run(req);
  }
  if (req.path.startsWith('/cart') && req.method === 'DELETE') {
    await param('productId')
      .isNumeric()
      .withMessage('productId must be numeric')
      .run(req);
  }
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(ERR.BAD_REQUEST);
  }
  return next();
};
