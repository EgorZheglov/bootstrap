import { Request } from 'express';

export { ERR } from './error-types';

export type ID = number | string;

export type CachingRequestData = Pick<
  Request,
  'id' | 'method' | 'params' | 'body'
>;

export type NewUser = {
  name: string;
  email: string;
  password: string;
};

export type User = NewUser & {
  id: ID;
  role: string;
  is_active: boolean;
  deleted_at: null | Date;
};

export type NewProduct = {
  author_id: ID;
  category_id: ID;
  name: string;
  slug: string;
  price: number;
  description: string;
  number_of_views?: number;
  images: string[];
  draft: boolean;
};

export type Product = NewProduct & {
  id: ID;
  created_date: Date;
};

export type AuthUserResponse = {
  data: {
    email: string;
    name: string;
    username: string;
  };
};

export type RegisterUser = {
  password: string;
  name: string;
  email: string;
  confirm_password: string;
  role: string;
};

export type ErrorType = {
  message: string;
  statusCode: number;
};

export type RefreshTokenInfo = {
  accessToken: string;
  email: string;
  role: string;
};

export type NewCategory = {
  name: string;
  slug: string;
};

export type Category = NewCategory & {
  id: ID;
};

export type ActivationTokenInfo = {
  email: string;
  expires_in: null | Date;
};

export type DummyObject = {
  [key: string]: any;
};

export type FullActivationTokenInfo = ActivationTokenInfo & {
  activation_token: string;
  id: ID;
};

export type ChangeLog = {
  id: number;
  sqlFile: string;
};

export type MigrationVersion = {
  path: string;
  checksum: string;
};

export type AuthTokenInfo = {
  email: string;
  token: null | string;
};

export type authDbTokens = {
  email: string;
  token: { accessToken: string };
};

export type TokenInfo = {
  email: string;
  role: string;
};

export type Cart = {
  id: ID;
  owner_id: ID;
  product_id: ID;
  name: string;
  price: number;
  count: number;
};

export enum Events {
  ERROR = 'ERROR',
  SEND_EMAIL = 'SEND_EMAIL',
  USER_UPDATED = 'USER_UPDATED',
  USER_ACTIVATED = 'USER_ACTIVATED',
  USER_REGISTERED = 'USER_REGISTERED',
}

export enum RestrictedResponseRoutes {
  ME = 'Me',
  USER = 'User',
  PRODUCTS = 'Products',
}

export type UserLoginInfo = {
  email: string;
  password: string;
  requestId: string;
  ip: string;
};

export type ProductSearchRequest = {
  category?: string;
  name?: string;
  minPrice?: number;
  maxPrice?: number;
  minCreatedAt?: Date;
  maxCreatedAt?: Date;
  page: number;
  perPage: number;
  orderBy?: string;
  order?: string;
  offset?: number;
  draft?: boolean;
};

export type MailsacResponse = {
  data: {
    email: string;
    domain: string;
    isValidFormat: boolean;
    local: string;
    isDisposable: boolean;
    disposableDomains: string[];
    aliases: string[];
  };
};
