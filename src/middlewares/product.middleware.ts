import { NextFunction, Request, Response } from 'express';

import { ERR } from '../types';
import { productUpdateValidator } from '../validators/product-update.validator';
import productCreateValidator from '../validators/product-create.validator';
import productFindByIdValidator from '../validators/product-find.validator';
import userDeleteByIdValidator from '../validators/user-delete.validator';
import { error } from '../libs/log';

export const productCreateMw = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const payload = { ...req.body };
  const result = productCreateValidator(payload);
  if (result.error) {
    error(result.error);
    return next(ERR.ERROR_MW);
  }
  next();
};

export const productUpdateMw = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const payload = { ...req.body };
  const result = productUpdateValidator(payload);
  if (result.error) {
    error(result.error);
    return next(ERR.ERROR_MW);
  }
  next();
};

export const productFindByIdMw = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const { id } = req.body;
  const result = productFindByIdValidator(id);
  if (result.error) {
    error(result.error);
    return next(ERR.ERROR_MW);
  }
  next();
};

export const productDeleteMw = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const { id } = req.body;
  const result = userDeleteByIdValidator(id);
  if (result.error) {
    error(result.error);
    return next(ERR.ERROR_MW);
  }
  next();
};
