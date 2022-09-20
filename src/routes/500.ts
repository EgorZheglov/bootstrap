import { Request, Response, NextFunction } from 'express';

import { ErrorType, ERR } from '../types';
import { errors } from '../messages';
import {
  AuthorizationError,
  ServerError,
  BadRequestError,
  AccessForbiddenError,
  NotAcceptableError,
  MovedTemporarilyError,
} from '../libs/error-library';

const {
  ERROR_DURING_EXECUTING,
  SHOULD_CONTAINS_TOKEN,
  INCORRECT_TOKEN,
  BAD_REQUEST,
  ERROR_UPLOADING,
  ERROR_VERIFICATION_EMAIL,
  ERROR_LOGIN,
  ERROR_SIGNUP,
  ERROR_LOGOUT,
  ERROR_GETTING_CART,
  ACCESS_DENIED,
  ERROR_MW,
  MOVED_TEMPORARILY,
} = errors;

let result: ErrorType;

export default (
  error: Error | string | any,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  switch (error) {
    case ERR.ERROR_DURING_EXECUTING:
      result = ServerError(ERROR_DURING_EXECUTING);
      break;
    case ERR.SHOULD_CONTAINS_TOKEN:
      result = AccessForbiddenError(SHOULD_CONTAINS_TOKEN);
      break;
    case ERR.INCORRECT_TOKEN:
      result = AccessForbiddenError(INCORRECT_TOKEN);
      break;
    case ERR.BAD_REQUEST:
      result = BadRequestError(BAD_REQUEST);
      break;
    case ERR.ERROR_UPLOADING:
      result = BadRequestError(ERROR_UPLOADING);
      break;
    case ERR.ERROR_VERIFICATION_EMAIL:
      result = AccessForbiddenError(ERROR_VERIFICATION_EMAIL);
      break;
    case ERR.ERROR_LOGIN:
      result = AuthorizationError(ERROR_LOGIN);
      break;
    case ERR.ERROR_SIGNUP:
      result = BadRequestError(ERROR_SIGNUP);
      break;
    case ERR.ERROR_LOGOUT:
      result = ServerError(ERROR_LOGOUT);
      break;
    case ERR.ERROR_GETTING_CART:
      result = ServerError(ERROR_GETTING_CART);
      break;
    case ERR.ACCESS_DENIED:
      result = AccessForbiddenError(ACCESS_DENIED);
      break;
    case ERR.ERROR_MW:
      result = NotAcceptableError(ERROR_MW);
      break;
    case ERR.MOVED_TEMPORARILY:
      result = MovedTemporarilyError(MOVED_TEMPORARILY);
      break;
  }
  res.status(result.statusCode).send(result.message);
};
