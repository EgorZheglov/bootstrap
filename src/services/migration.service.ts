import checksum from 'checksum';
import fs from 'fs';
import to from 'await-to-js';

import * as versionDao from '../data-access/schema-version.dao';
import {
  CHANGE_LOGS_DIR,
  CHANGE_LOGS_SCRIPTS_DIR,
  DB_MIGRATION_FILE,
} from '../config';
import { ChangeLog, MigrationVersion } from '../types';
import { error } from '../libs/log';
import { errors } from '../messages';
import db from '../db/db';
import schemaVersionModel from '../db/models/schema-version';
import shopModel from '../db/models/shop';

const { DB_MIGRATION_FAILED } = errors;

export const isSchemaExist = async (): Promise<boolean> => {
  const [existedSchemaErr, existedSchemaRes] = await to(
    db.query(shopModel.selectExistedSchema)
  );
  if (existedSchemaErr || !existedSchemaRes) {
    error(existedSchemaErr);
    throw existedSchemaErr;
  }
  return existedSchemaRes && existedSchemaRes.rows.length > 0;
};

export const isVersionTableExist = async (): Promise<boolean> => {
  const [existedVersionTableErr, existedVersionTableRes] = await to(
    db.query(schemaVersionModel.selectExistedTable)
  );
  if (existedVersionTableErr || !existedVersionTableRes) {
    error(existedVersionTableErr);
    throw existedVersionTableErr;
  }
  return existedVersionTableRes && existedVersionTableRes.rows.length > 0;
};

export const createSchema = async (): Promise<void> => {
  const createSchemaScript = shopModel.createSchema.concat(
    schemaVersionModel.createTable
  );
  const [createSchemaErr, createSchemaRes] = await to(
    db.query(createSchemaScript)
  );
  if (createSchemaErr || !createSchemaRes) {
    error(createSchemaErr);
    throw createSchemaErr;
  }
};

export const dropSchema = async (): Promise<void> => {
  await db.query(shopModel.dropSchema);
};

export const getChangeLogs = async (): Promise<ChangeLog[]> => {
  let files: string[] = [];
  if (CHANGE_LOGS_SCRIPTS_DIR) {
    files = fs.readdirSync(CHANGE_LOGS_SCRIPTS_DIR);
  }
  const sqlFiles = files.filter((f) => f.endsWith('.sql'));
  sqlFiles.sort(
    (f1: string, f2: string) =>
      Number(f1.split('_')[0]) - Number(f2.split('_')[0])
  );
  const changeLogs: ChangeLog[] = [];
  sqlFiles.forEach((file) => {
    const fileNameParts = file.split('_');
    changeLogs.push({
      id: Number(fileNameParts[0]),
      sqlFile: file,
    });
  });
  fs.writeFileSync(
    `${CHANGE_LOGS_DIR}${DB_MIGRATION_FILE}`,
    JSON.stringify(changeLogs, null, 4)
  );
  return changeLogs;
};

export const getAppliedVersions = async (): Promise<
  undefined | MigrationVersion[]
> => {
  const [getDbVersionsErr, appliedVersions] = await to(versionDao.find());
  if (getDbVersionsErr) {
    error(getDbVersionsErr);
    throw getDbVersionsErr;
  }
  return appliedVersions;
};

export const checkMigrationStatus = async (
  appliedVersions: MigrationVersion[],
  changeLogs: ChangeLog[]
): Promise<void> => {
  if (appliedVersions.length > changeLogs.length) {
    error(DB_MIGRATION_FAILED);
    throw Error(DB_MIGRATION_FAILED);
  }
  if (appliedVersions.length > 0) {
    const lastDbVersionIndex = appliedVersions.length - 1;
    const sqlScript = fs.readFileSync(
      `${CHANGE_LOGS_SCRIPTS_DIR}${changeLogs[lastDbVersionIndex].sqlFile}`
    );
    if (checksum(sqlScript) !== appliedVersions[lastDbVersionIndex].checksum) {
      error(DB_MIGRATION_FAILED);
      throw Error(DB_MIGRATION_FAILED);
    }
  }
};

export const migrate = async (
  appliedVersions: MigrationVersion[] | undefined,
  changeLogs: ChangeLog[]
): Promise<void> => {
  await changeLogs.reduce(async (acc: Promise<void>, changeLog: ChangeLog) => {
    await acc;
    const sqlScript = fs.readFileSync(
      `${CHANGE_LOGS_SCRIPTS_DIR}${changeLog.sqlFile}`
    );
    const checkSumSql = checksum(sqlScript);
    let existedVersion = null;
    if (appliedVersions && appliedVersions.length > 0) {
      existedVersion = appliedVersions
        .filter((version) => version.checksum === checkSumSql)
        .filter((version) => version.path === changeLog.sqlFile);
    }
    if (!existedVersion || existedVersion.length === 0) {
      const [updateErr, updateRes] = await to(
        db.query(sqlScript.toString(), [])
      );
      if (updateErr || !updateRes) {
        error(updateErr);
        throw updateErr;
      }
      const [versionCreateErr, versionCreateRes] = await to(
        versionDao.create({
          checksum: checkSumSql,
          path: changeLog.sqlFile,
        })
      );
      if (versionCreateErr || !versionCreateRes) {
        error(versionCreateErr);
        throw versionCreateErr;
      }
    }
  }, Promise.resolve());
};
