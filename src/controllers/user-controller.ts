import to from 'await-to-js';

import * as dao from '../data-access/user.dao';
import { ID, NewUser, User, Events, DummyObject, TokenInfo } from '../types';
import { debug, error } from '../libs/log';
import { errors, messages } from '../messages';
import { makeActivationToken } from './tokens-controller';
import { PASSWORD_SALT } from '../config';
import encryptString from '../libs/encrypt-string';
import eventService from '../services/event-service';
import { emailValidation } from '../services/validation.service';
import roles from '../libs/roles';

const {
  CANNOT_UPDATE_USER,
  USER_NOT_FOUND,
  CANNOT_CREATE_USER,
  CANNOT_GET_USERS_LIST,
  CANNOT_ACTIVATE_USER,
  CANNOT_DELETE_USER,
  ERROR_VALIDATION_EMAIL,
} = errors;
const { USER_DELETED } = messages;

export async function find(): Promise<User[]> {
  debug('Requesting a list of users from db');
  const [err, list] = await to(dao.find());
  if (err) {
    error(err);
    throw CANNOT_GET_USERS_LIST;
  }
  /* eslint-disable-next-line @typescript-eslint/no-non-null-assertion */
  return list!;
}

export async function findByEmail(email: string, role: string): Promise<User> {
  debug('Requesting user by email from db');
  const [err, user] = await to(dao.findByEmail(email, role));
  if (err) {
    error(err);
    throw USER_NOT_FOUND;
  }
  /* eslint-disable-next-line @typescript-eslint/no-non-null-assertion */
  return user!;
}

export async function findById(userId: ID): Promise<User> {
  debug('Requesting user by id from db');
  const [err, user] = await to(dao.findById(userId));
  if (err) {
    error(err);
    throw USER_NOT_FOUND;
  }
  /* eslint-disable-next-line @typescript-eslint/no-non-null-assertion */
  return user!;
}

export async function create(data: NewUser): Promise<User> {
  debug('Creating user');

  const isValidEmail = await emailValidation(data.email);
  if (!isValidEmail) {
    error(ERROR_VALIDATION_EMAIL);
    throw ERROR_VALIDATION_EMAIL;
  }

  const [err, user] = await to(dao.create(data));
  if (err) {
    error(err);
    throw CANNOT_CREATE_USER;
  }
  eventService(Events.USER_REGISTERED, user as DummyObject);
  /* eslint-disable-next-line @typescript-eslint/no-non-null-assertion */
  return user!;
}

export async function createUsers(users: User[]): Promise<User[]> {
  debug('Creating users');
  const userPromises: Promise<User | null>[] = [];
  users.forEach((user) => {
    userPromises.push(create(user));
  });
  await Promise.all(userPromises);
  /* eslint-disable-next-line @typescript-eslint/no-non-null-assertion */
  return users!;
}

export async function update(tokenInfo: TokenInfo, data: User): Promise<User> {
  debug(`Updating user with data: ${JSON.stringify(data)}`);
  const { email, role } = tokenInfo;
  const userData = { ...data };
  let currentPasword: string;
  let currentEmail: string;

  if (role === roles.userAndAdmin) {
    const [errInDb, existedUser] = await to(dao.findById(userData.id));
    if (errInDb || !existedUser) {
      error(errInDb);
      throw USER_NOT_FOUND;
    }
    currentPasword = existedUser.password;
    currentEmail = existedUser.email;
  } else {
    const [errInDb, currentUser] = await to(dao.findByEmail(email, role));
    if (errInDb || !currentUser) {
      error(errInDb);
      throw USER_NOT_FOUND;
    }
    userData.id = currentUser.id;
    userData.role = currentUser.role;
    userData.is_active = currentUser.is_active;
    currentPasword = currentUser.password;
    currentEmail = currentUser.email;
  }

  if (currentPasword !== userData.password) {
    const encryptedPassword = encryptString(
      `${encryptString(userData.password)}${PASSWORD_SALT}`
    );
    userData.password = encryptedPassword;
  }

  if (currentEmail !== userData.email) {
    const isValidEmail = await emailValidation(userData.email);
    if (!isValidEmail) {
      error(ERROR_VALIDATION_EMAIL);
      throw ERROR_VALIDATION_EMAIL;
    }

    userData.is_active = false;
    const [tokenErr, token] = await to(makeActivationToken(userData));
    if (tokenErr) {
      error(tokenErr);
      throw tokenErr;
    }

    // TODO: add controller for sending autorization token to user's new email
    console.log(`Sending new token: "${token}" for activation email...`);
    eventService(Events.SEND_EMAIL, userData.email);
  }

  const [err, updated] = await to(dao.update(userData));
  if (err) {
    error(err);
    throw CANNOT_UPDATE_USER;
  }

  eventService(Events.USER_UPDATED, updated as DummyObject);
  /* eslint-disable-next-line @typescript-eslint/no-non-null-assertion */
  return updated!;
}

export async function activateUser(email: string): Promise<boolean> {
  debug('Activate user');
  const [err] = await to(dao.updateIsActive(email, true));

  if (err) {
    error(err);
    throw CANNOT_ACTIVATE_USER;
  }
  eventService(Events.USER_ACTIVATED, email);
  return true;
}

export async function remove(id: ID): Promise<string> {
  debug('Removing user by current id');
  const [err] = await to(dao.remove(id));
  if (err) {
    error(err);
    throw CANNOT_DELETE_USER;
  }
  return USER_DELETED;
}

export async function softDelete(email: string): Promise<string> {
  debug('Removing user by current id');
  const [err] = await to(dao.softDelete(email));
  if (err) {
    error(err);
    throw CANNOT_DELETE_USER;
  }
  return USER_DELETED;
}
