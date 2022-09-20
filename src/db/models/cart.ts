/* eslint-disable-next-line @typescript-eslint/no-var-requires */
const sql = require('sql-bricks-postgres');

export default {
  createTable: `
    create table if not exists shop.cart (
    id serial primary key,
    owner_id varchar(50) not null references shop.users(email),
    product_id serial not null references shop.products(id),
    name varchar(50) not null, 
    price decimal, 
    count decimal
    );
  `,

  findAll: sql.select('*').from('shop.cart').toString(),

  findByOwnerId: sql
    .select('*')
    .from('shop.cart')
    .where('owner_id', sql('$1'))
    .toString(),

  findByOwnerEmail: sql
    .select(sql('cart.*'))
    .from('shop.cart as cart')
    .join('shop.users as users')
    .on('cart.owner_id', 'users.id')
    .where('users.email', sql('$1'))
    .toString(),

  delete: sql
    .delete('shop.cart')
    .where('owner_id', sql(`(SELECT id FROM shop.users WHERE email = $1)`))
    .toString(),

  removeProduct: sql
    .delete('shop.cart')
    .where({
      owner_id: sql(`(SELECT id FROM shop.users WHERE email = $1)`),
      product_id: sql('$2'),
    })
    .toString(),

  addCart: sql
    .insert('shop.cart', {
      owner_id: sql(`(SELECT id FROM shop.users WHERE email = $1)`),
      product_id: sql('$2'),
      name: sql(`(SELECT name FROM shop.products WHERE id = $2)`),
      price: sql(`(SELECT price FROM shop.products WHERE id = $2)`),
      count: sql('$3'),
    })
    .returning('*')
    .toString(),

  updateCart: sql
    .update('shop.cart', { count: sql('$2') })
    .where('id', sql('$1'))
    .returning('*')
    .toString(),

  checkCartByProduct: sql
    .select('*')
    .from('shop.cart')
    .where({
      owner_id: sql(`(SELECT id FROM shop.users WHERE email = $1)`),
      product_id: sql('$2'),
    })
    .toString(),

  decrementCountOfProducts: sql
    .update('shop.cart', { count: sql('count - $3') })
    .where({
      product_id: sql('$2'),
      owner_id: sql(`(SELECT id FROM shop.users WHERE email = $1)`),
    })
    .returning('*')
    .toString(),
};
