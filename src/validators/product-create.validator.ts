import Joi from 'joi';

const productCreateValidator = (data: any): Joi.ValidationResult => {
  const name = Joi.string();
  const slug = Joi.string();
  const price = Joi.number().positive().greater(0);
  const description = Joi.string();

  const schema = Joi.object({
    name: name.required(),
    slug: slug.required(),
    price: price.required(),
    description: description.required(),
  });

  return schema.validate(data);
};

export default productCreateValidator;
