import Joi from 'joi';

const productFindByIdValidator = (data: any): Joi.ValidationResult => {
  const id = Joi.number().integer();

  const schema = Joi.object({
    id: id.required(),
  });

  return schema.validate(data);
};

export default productFindByIdValidator;
