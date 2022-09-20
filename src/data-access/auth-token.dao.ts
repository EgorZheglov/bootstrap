import { AuthTokenInfo, authDbTokens } from '../types';
import db from '../db/db';
import query from '../db/models/auth-tokens';

export async function updateOrCreateAuthToken(
  email: string,
  accessToken: string,
  refreshToken: string
): Promise<AuthTokenInfo | null> {
  const params = [email, { accessToken, refreshToken }];
  const result = await db.query(query.updateOrCreateToken, params);
  if (!result || !result.rows || !result.rows.length) return null;
  return result.rows[0];
}

export async function getAllTokens(): Promise<authDbTokens[] | null> {
  const result = await db.query(query.getAllTokens);
  if (!result || !result.rows || !result.rows.length) return null;
  return result.rows;
}
