import { QueryResult } from 'pg';

import { ID, NewUser, User } from '../types';
import db from '../db/db';
import user from '../db/models/user';
import roles from '../libs/roles';

// Create new user
export async function create(userData: NewUser): Promise<User | null> {
  const role = roles.user;
  const isActive = false;
  const params = [
    userData.name,
    role,
    isActive,
    userData.email,
    userData.password,
  ];
  const result = await db.query(user.createUser, params);
  if (!result || !result.rows || !result.rows.length) {
    return null;
  }
  return result.rows[0];
}

// Get list of all users
export async function find(): Promise<User[] | null> {
  const result = await db.query(user.find);
  if (!result || !result.rows || !result.rows.length) return null;
  return result.rows;
}

// Find user by email
export async function findByEmail(
  email: string,
  role: string
): Promise<User | null> {
  const params = [email];
  const result = await db.query(user.findByEmail(role), params);
  if (!result || !result.rows || !result.rows.length) return null;
  return result.rows[0];
}

// Find user by ID
export async function findById(userId: ID): Promise<User | null> {
  const params = [userId];
  const result = await db.query(user.findById, params);
  if (!result || !result.rows || !result.rows.length) return null;
  return result.rows[0];
}

// Find user by id and update it
export async function update(userData: User): Promise<User | null> {
  const params = [
    userData.id,
    userData.name,
    userData.role,
    userData.is_active,
    userData.email,
    userData.password,
  ];
  const result = await db.query(user.update, params);
  if (!result || !result.rows || !result.rows.length) return null;
  return result.rows[0];
}

// update isActive flag
export async function updateIsActive(
  email: string,
  isActive: boolean
): Promise<void> {
  const params = [email, isActive];
  await db.query(user.updateIsActive, params);
}

// Delete user by ID
export async function remove(userId: ID): Promise<QueryResult> {
  const params = [userId];
  const result = await db.query(user.delete, params);
  return result;
}

// Soft delete user by email
export async function softDelete(email: string): Promise<QueryResult> {
  const params = [email];
  const result = await db.query(user.softDelete, params);
  return result;
}
