import {
  checkMigrationStatus,
  createSchema,
  dropSchema,
  getAppliedVersions,
  getChangeLogs,
  isSchemaExist,
  isVersionTableExist,
  migrate,
} from '../services/migration.service';

export default {
  update: async (): Promise<boolean> => {
    const schemaExist = await isSchemaExist();
    const versionTableExist = await isVersionTableExist();
    if (!schemaExist) {
      await createSchema();
    } else if (schemaExist && !versionTableExist) {
      await dropSchema();
      await createSchema();
    }
    const changeLogs = await getChangeLogs();
    const appliedVersions = await getAppliedVersions();
    if (appliedVersions) {
      await checkMigrationStatus(appliedVersions, changeLogs);
    }
    await migrate(appliedVersions, changeLogs);
    return Promise.resolve(true);
  },
};
