import * as Joi from '@hapi/joi';

export const JoiSchema: Joi.ObjectSchema = Joi.object({
  REDIS_PORT: Joi.number().default(6379),
  REDIS_HOST: Joi.string().default('localhost'),
  DATABASE_TYPE: Joi.string().default('mysql'),
  HOST: Joi.string().default('localhost'),
  DATABASE_HOST: Joi.string().default('localhost'),
  PORT: Joi.number().default(3000),
  DATABASE_PORT: Joi.number().default(3306),
  DATABASE_USERNAME: Joi.string().default('root'),
  DATABASE_PASSWORD: Joi.string().default('rootroot'),
  DATABASE_NAME: Joi.string().default('library'),
  SECRET: Joi.string().default(
    'DO NOT USE THIS VALUE. INSTEAD, CREATE A COMPLEX SECRET AND KEEP IT SAFE OUTSIDE OF THE SOURCE CODE.',
  ),
  EXT: Joi.number().default(604800),
  SALT_ROUNDS: Joi.number().default(10),
  MONGODB_URI: Joi.string().default('mongodb://localhost/short_links'),
});
