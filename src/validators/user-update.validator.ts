import Joi from 'joi';

export const userFindByIdValidator = (data: any): Joi.ValidationResult => {
  const id = Joi.number().integer();

  const schema = Joi.object({
    id: id.required(),
  });

  return schema.validate(data);
};

export const userUpdateValidator = (data: any): Joi.ValidationResult => {
  const id = Joi.number().integer();
  const name = Joi.string().min(10).max(100);
  const email = Joi.string().email();
  const password = Joi.string().pattern(new RegExp('^[a-zA-Z0-9]{3,30}$'));
  const role = Joi.string();
  const isActive = Joi.boolean();

  const schema = Joi.object({
    id: id.required(),
    name: name.required(),
    email: email.required(),
    password: password.required(),
    role: role.required(),
    is_active: isActive.required(),
  });

  return schema.validate(data);
};

export const meUpdateValidator = (data: any): Joi.ValidationResult => {
  const name = Joi.string().min(10).max(100);
  const email = Joi.string().email();
  const password = Joi.string().pattern(new RegExp('^[a-zA-Z0-9]{3,30}$'));

  const schema = Joi.object({
    name: name.required(),
    email: email.required(),
    password: password.required(),
  });

  return schema.validate(data);
};
