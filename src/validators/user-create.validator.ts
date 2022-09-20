import Joi from 'joi';

const userCreateValidator = (data: any): Joi.ValidationResult => {
  const name = Joi.string().min(10).max(100);
  const role = Joi.string();
  const isActive = Joi.boolean();
  const email = Joi.string().email();
  const password = Joi.string().pattern(new RegExp('^[a-zA-Z0-9]{3,30}$'));

  const schema = Joi.object({
    name: name.required(),
    role: role.required(),
    is_active: isActive.required(),
    email: email.required(),
    password: password.required(),
  });

  return schema.validate(data);
};

export default userCreateValidator;
