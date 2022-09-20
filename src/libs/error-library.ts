import { ErrorType } from '../types';

const MovedTemporarilyError = (errMessage: string): ErrorType => ({
  message: errMessage,
  statusCode: 302,
});

const BadRequestError = (errMessage: string): ErrorType => ({
  message: errMessage,
  statusCode: 400,
});

const AuthorizationError = (errMessage: string): ErrorType => ({
  message: errMessage,
  statusCode: 401,
});

const AccessForbiddenError = (errMessage: string): ErrorType => ({
  message: errMessage,
  statusCode: 403,
});

const NotFoundError = (errMessage: string): ErrorType => ({
  message: errMessage,
  statusCode: 404,
});

const NotAcceptableError = (errMessage: string): ErrorType => ({
  message: errMessage,
  statusCode: 406,
});

const ServerError = (errMessage: string): ErrorType => ({
  message: errMessage,
  statusCode: 500,
});

export {
  BadRequestError,
  AuthorizationError,
  NotFoundError,
  ServerError,
  AccessForbiddenError,
  NotAcceptableError,
  MovedTemporarilyError,
};
