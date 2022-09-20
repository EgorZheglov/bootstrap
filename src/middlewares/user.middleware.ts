import { Request, Response, NextFunction } from 'express';

import { ERR } from '../types';
import userCreateValidator from '../validators/user-create.validator';
import userDeleteByIdValidator from '../validators/user-delete.validator';
import userFindByIdValidator from '../validators/user-find.validator';
import userRegisterValidator from '../validators/user-register.validator';
import {
  meUpdateValidator,
  userUpdateValidator,
} from '../validators/user-update.validator';
import { error } from '../libs/log';

export const userCreateMw = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const payload = { ...req.body };
  const result = userCreateValidator(payload);
  if (result.error) {
    error(result.error);
    return next(ERR.ERROR_MW);
  }
  next();
};

export const userDeleteMw = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const id = req.params.userId;
  const result = userDeleteByIdValidator({ id });
  if (result.error) {
    error(result.error);
    return next(ERR.ERROR_MW);
  }
  next();
};

export const userFindByIdMw = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const id = req.params.userId;
  const result = userFindByIdValidator({ id });
  if (result.error) {
    error(result.error);
    return next(ERR.ERROR_MW);
  }
  next();
};

export const userRegisterMw = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const payload = { ...req.body };
  const result = userRegisterValidator(payload);
  if (result.error) {
    error(result.error);
    return next(ERR.ERROR_MW);
  }
  next();
};
export const userUpdateMw = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const payload = { ...req.body };
  const result = userUpdateValidator(payload);

  if (result.error) {
    error(result.error);
    return next(ERR.ERROR_MW);
  }
  next();
};
export const meUpdateMw = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const payload = { ...req.body };
  const result = meUpdateValidator(payload);

  if (result.error) {
    error(result.error);
    return next(ERR.ERROR_MW);
  }
  next();
};
