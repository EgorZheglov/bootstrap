/* eslint-disable-next-line @typescript-eslint/no-var-requires */
const sql = require('sql-bricks-postgres');

export default {
  createTable: `
      create table if not exists shop.activation_tokens (
      id serial primary key,
      email varchar(320) not null UNIQUE,
      activation_token varchar(100) not null,
      expires_in timestamp not null
      );
  `,

  addToken: sql
    .insert('shop.activation_tokens', {
      email: sql('$1'),
      activation_token: sql('$2'),
      expires_in: sql('$3'),
    })
    .returning('*')
    .toString(),

  findByActivationToken: sql
    .select('email', 'expires_in')
    .from('shop.activation_tokens')
    .where('activation_token', sql('$1'))
    .toString(),

  removeByEmail: sql
    .delete('shop.activation_tokens')
    .where('email', sql('$1'))
    .toString(),
};
