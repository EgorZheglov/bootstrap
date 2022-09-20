import roles from '../../libs/roles';
import restrictRequest from '../../restrictions/restrictions-request';
import { RestrictedResponseRoutes } from '../../types';
/* eslint-disable-next-line @typescript-eslint/no-var-requires */
const sql = require('sql-bricks-postgres');

export default {
  createTable: `
    create table if not exists shop.users (
	id serial primary key,
	name varchar(50) not null,
	role varchar(50),
	isActive boolean,
	email varchar(320) not null UNIQUE,
	password varchar(50)
	);
	`,

  addUser: sql
    .insert('shop.users', {
      name: sql('$1'),
      email: sql('$2'),
      password: sql('$3'),
      role: sql('$4'),
    })
    .toString(),

  createUser: sql
    .insert('shop.users', {
      name: sql('$1'),
      role: sql('$2'),
      is_active: sql('$3'),
      email: sql('$4'),
      password: sql('$5'),
    })
    .returning('*')
    .toString(),

  find: sql.select('*').from('shop.users').toString(),

  findByEmail: (role: string = roles.user) =>
    sql
      .select(restrictRequest(RestrictedResponseRoutes.ME, role))
      .from('shop.users')
      .where('email', sql('$1'))
      .toString(),

  findById: sql
    .select('*')
    .from('shop.users')
    .where('id', sql('$1'))
    .toString(),

  update: sql
    .update('shop.users', {
      name: sql('$2'),
      role: sql('$3'),
      is_active: sql('$4'),
      email: sql('$5'),
      password: sql('$6'),
    })
    .where('id', sql('$1'))
    .returning('*')
    .toString(),

  updateIsActive: sql
    .update('shop.users', { is_active: sql('$2') })
    .where('email', sql('$1'))
    .toString(),

  delete: sql.delete('shop.users').where('id', sql('$1')).toString(),

  softDelete: sql
    .update('shop.users', { soft_delete: true })
    .where('email', sql('$1'))
    .toString(),
};
