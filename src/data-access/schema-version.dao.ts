import { MigrationVersion } from '../types';
import db from '../db/db';
import schemaVersion from '../db/models/schema-version';

export async function find(): Promise<MigrationVersion[]> {
  const result = await db.query(schemaVersion.find);
  if (!result || !result.rows || !result.rows.length) return [];
  return result.rows;
}

export async function create(
  version: MigrationVersion
): Promise<MigrationVersion | null> {
  const result = await db.query(schemaVersion.create, [
    version.checksum,
    version.path,
  ]);
  if (!result || !result.rows || !result.rows.length) return null;
  return result.rows[0];
}
