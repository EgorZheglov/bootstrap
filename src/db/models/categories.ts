/* eslint-disable-next-line @typescript-eslint/no-var-requires */
const sql = require('sql-bricks-postgres');

export default {
  createTable: `
		create table if not exists shop.categories (
		id serial primary key,
		name varchar(50) not null UNIQUE,
		slug varchar(320) not null UNIQUE
		);
	`,

  add: sql
    .insert('shop.categories', { name: sql('$1'), slug: sql('$2') })
    .returning('*')
    .toString(),

  findAll: sql.select('*').from('shop.categories').toString(),

  findByName: sql
    .select('*')
    .from('shop.categories')
    .where('name', sql('$1'))
    .toString(),

  findBySlug: sql
    .select('*')
    .from('shop.categories')
    .where('slug', sql('$1'))
    .toString(),

  findById: sql
    .select('*')
    .from('shop.categories')
    .where('id', sql('$1'))
    .toString(),

  update: sql
    .update('shop.categories', { name: sql('$2'), slug: sql('$3') })
    .where('id', sql('$1'))
    .toString(),

  delete: sql.delete('shop.categories').where('id', sql('$1')).toString(),
};
