/* eslint-disable-next-line @typescript-eslint/no-var-requires */
const sql = require('sql-bricks-postgres');

export default {
  selectExistedSchema: sql
    .select('schema_name')
    .from('information_schema.schemata')
    .where('schema_name', 'shop')
    .toString(),

  createSchema: `
    create schema shop;
    `,

  dropSchema: `
    drop schema shop cascade;
    `,
};
