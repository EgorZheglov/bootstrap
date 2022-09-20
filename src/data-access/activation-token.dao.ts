import { QueryResult } from 'pg';

import { ActivationTokenInfo, FullActivationTokenInfo } from '../types';
import db from '../db/db';
import query from '../db/models/activation-token';

// Find token info by activation token
export async function findByActivationToken(
  activationToken: string
): Promise<ActivationTokenInfo | null> {
  const result = await db.query(query.findByActivationToken, [activationToken]);
  if (!result || !result.rows || !result.rows.length) return null;
  return result.rows[0];
}

export async function addToken(
  email: string,
  hash: string,
  expiresDate: Date
): Promise<FullActivationTokenInfo | null> {
  const params = [email, hash, expiresDate];
  const result = await db.query(query.addToken, params);
  if (!result || !result.rows || !result.rows.length) return null;
  return result.rows[0];
}

export async function removeByEmail(email: string): Promise<QueryResult> {
  const params = [email];
  const result = await db.query(query.removeByEmail, params);
  return result;
}
