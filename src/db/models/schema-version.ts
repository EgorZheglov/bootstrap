/* eslint-disable-next-line @typescript-eslint/no-var-requires */
const sql = require('sql-bricks-postgres');

export default {
  createTable: `create table if not exists shop.schema_version (
    id serial primary key,
    path varchar (100) not null,
    checksum varchar (100) not null
    );
    `,

  selectExistedTable: sql
    .select('*')
    .from('information_schema.tables')
    .where({ table_schema: 'shop', table_name: 'schema_version' })
    .toString(),

  find: sql.select('*').from('shop.schema_version').toString(),

  create: sql
    .insert('shop.schema_version', { checksum: sql('$1'), path: sql('$2') })
    .returning('*')
    .toString(),
};
