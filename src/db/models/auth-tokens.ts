/* eslint-disable-next-line @typescript-eslint/no-var-requires */
const sql = require('sql-bricks-postgres');

export default {
  createTable: `
      create table if not exists shop.auth_tokens (
      id serial primary key,
      email varchar(320) not null UNIQUE,
      token json
      );
  `,

  updateOrCreateToken: sql
    .insert('shop.auth_tokens', { email: sql('$1'), token: sql('$2') })
    .onConflict('email')
    .doUpdate(['token'])
    .toString(),

  getAllTokens: sql
    .select('email', 'token')
    .from('shop.auth_tokens')
    .toString(),

  removeByEmail: sql
    .delete('shop.auth_tokens')
    .where('email', sql('$1'))
    .toString(),
};
