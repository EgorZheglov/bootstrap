import Joi from 'joi';

export const productFindByIdValidator = (data: any): Joi.ValidationResult => {
  const id = Joi.number().integer();

  const schema = Joi.object({
    id: id.required(),
  });

  return schema.validate(data);
};

export const productUpdateValidator = (data: any): Joi.ValidationResult => {
  const name = Joi.string();
  const slug = Joi.string();
  const price = Joi.number().positive().greater(0);
  const description = Joi.string();
  const id = Joi.number().integer();
  const created_date = Joi.string();
  const number_of_views = Joi.number().positive().greater(0);
  const images = Joi.array().items(Joi.string());
  const draft = Joi.boolean();

  const schema = Joi.object({
    name,
    slug,
    price,
    description,
    id,
    created_date,
    number_of_views,
    images,
    draft,
  });

  return schema.validate(data);
};
