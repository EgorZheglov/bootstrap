import Joi from 'joi';

const userDeleteByIdValidator = (data: any): Joi.ValidationResult => {
  const id = Joi.number().integer();

  const schema = Joi.object({
    id: id.required(),
  });

  return schema.validate(data);
};

export default userDeleteByIdValidator;
