import roles from '../libs/roles';

export function restrictProductData(role: string) {
  switch (role) {
    case roles.user:
      return 'name, price, id, author_id, category_id, slug, created_date, number_of_views, price, description, images, soft_delete ';
    default:
      // default: admin
      return '*';
  }
}

export function restrictMeData(role: string) {
  switch (role) {
    case roles.user:
      return 'name, id, email, password';
    default:
      // default: admin
      return '*';
  }
}
