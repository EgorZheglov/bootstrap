import Joi from 'joi';

const userRegisterValidator = (data: any): Joi.ValidationResult => {
  const name = Joi.string().min(10).max(100);
  const email = Joi.string().email();
  const password = Joi.string().pattern(new RegExp('^[a-zA-Z0-9]{3,30}$'));
  const confirm_password = Joi.string().valid(Joi.ref('password'));

  const schema = Joi.object({
    name: name.required(),
    email: email.required(),
    password: password.required(),
    confirm_password: confirm_password.required(),
  }).with('password', 'confirm_password');

  return schema.validate(data);
};

export default userRegisterValidator;
