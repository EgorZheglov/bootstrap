import roles from '../../libs/roles';
import restrictRequest from '../../restrictions/restrictions-request';
import { ProductSearchRequest, RestrictedResponseRoutes } from '../../types';
/* eslint-disable-next-line @typescript-eslint/no-var-requires */
const sql = require('sql-bricks-postgres');

function conditions(params: ProductSearchRequest, role: string) {
  return `
    price between ${params.minPrice} and ${params.maxPrice} 
    and created_date 
    between '${params.minCreatedAt?.toISOString()}' and '${params.maxCreatedAt?.toISOString()}'
    ${
      role === roles.user
        ? 'and draft = false'
        : `${params.draft?.toString() ? `and draft = ${params.draft}` : ''}`
    }
    order by ${params.orderBy} ${params.order}
    limit ${params.perPage} 
    offset ${params.page * params.perPage - params.perPage}
  `;
}

export default {
  createTable: `
    create table if not exists shop.products (
    id serial primary key,
    author_id integer not null references shop.users(id) ON DELETE CASCADE ON UPDATE CASCADE,
    category_id integer not null references shop.categories(id) ON DELETE CASCADE ON UPDATE CASCADE,
    name varchar(320) not null,
    slug varchar(320),
    created_date timestamp default current_timestamp not null,
    number_of_views integer,
    price decimal,
    description varchar(320),
    images varchar[],
    soft_delete boolean,
    draft boolean        
    );
  `,

  create: sql
    .insert('shop.products', {
      author_id: sql('$1'),
      category_id: sql('$2'),
      name: sql('$3'),
      slug: sql('$4'),
      created_date: sql('$5'),
      number_of_views: sql('$6'),
      price: sql('$7'),
      description: sql('$8'),
      images: sql('$9'),
      draft: sql('$10'),
    })
    .returning('*')
    .toString(),

  delete: sql.delete('shop.products').where('id', sql('$1')).toString(),

  find: sql.select('*').from('shop.products').toString(),

  findById: sql
    .select('*')
    .from('shop.products')
    .where('id', sql('$1'))
    .toString(),

  // With Increment 'number_of_views'
  findByIdWI: sql
    .update('shop.products', { number_of_views: sql('number_of_views + 1') })
    .where('id', sql('$1'))
    .returning('*')
    .toString(),

  // With Increment 'number_of_views'
  findByNameWI: sql
    .update('shop.products', { number_of_views: sql('number_of_views + 1') })
    .where('name', sql('$1'))
    .returning('*')
    .toString(),

  findDefaultProducts: (
    params: ProductSearchRequest,
    role: string = roles.user
  ) =>
    sql
      .select(restrictRequest(RestrictedResponseRoutes.PRODUCTS, role))
      .from('shop.products')
      .where(sql(`${conditions(params, role)}`))
      .toString(),

  findByNameLike: (params: ProductSearchRequest, role: string = roles.user) =>
    sql
      .select(restrictRequest(RestrictedResponseRoutes.PRODUCTS, role))
      .from('shop.products')
      .where(sql.like('name', `%${params.name}%`))
      .and(sql(`${conditions(params, role)}`))
      .toString(),

  findByCategory: (params: ProductSearchRequest, role: string = roles.user) =>
    sql
      .select(restrictRequest(RestrictedResponseRoutes.PRODUCTS, role))
      .from('shop.products')
      .join('shop.categories')
      .on('shop.products.category_id', 'shop.categories.id')
      .where({ 'shop.categories.name': `${params.category}` })
      .and(sql(`${conditions(params, role)}`))
      .toString(),

  findBySlug: sql
    .select('*')
    .from('shop.products')
    .where('slug', sql('$1'))
    .toString(),

  update: sql
    .update('shop.products', {
      name: sql('$2'),
      slug: sql('$3'),
      price: sql('$4'),
      description: sql('$5'),
      images: sql('$6'),
      draft: sql('$7'),
    })
    .where('id', sql('$1'))
    .returning('*')
    .toString(),
};

// findById: `
//     select * from shop.products where id = $1;
// 	`,
//   // With Increment 'number_of_views'
//   findByIdWI: `
//     update shop.products set number_of_views = number_of_views + 1
//     where id = $1 returning *;
//   `,
//   findByNameWI: `
//     update shop.products set number_of_views = number_of_views + 1
//     where name = $1 returning *;
//   `,
