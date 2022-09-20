import faker from 'faker';
import roles from './roles';

export const createUser = () => {
  const name = faker.name.findName();
  const role = roles.user;
  const isActive = faker.datatype.boolean();
  const email = faker.internet.email().toLowerCase();
  const password = faker.internet.password();

  return [name, role, isActive, email, password];
};

export const createProduct = (idUser: number, idCategory: number) => {
  const authorId = faker.datatype.number({ min: 1, max: idUser });
  const categoryId = faker.datatype.number({ min: 1, max: idCategory });
  const name = faker.commerce.productName();
  const slug = faker.lorem.slug();
  const createdDate = faker.date.past();
  const numberOfViews = faker.datatype.number({ min: 10, max: 1500 });
  const price = faker.commerce.price();
  const description = faker.lorem.words();
  const images = `{${faker.image.image()}, ${faker.image.image()}, ${faker.image.image()}}`;
  const draft = Math.random() > 0.5;

  return [
    authorId,
    categoryId,
    name,
    slug,
    createdDate,
    numberOfViews,
    price,
    description,
    images,
    draft,
  ];
};

export const createCategory = () => {
  const name = faker.commerce.product();
  const slug = faker.lorem.slug();

  return [name, slug];
};
