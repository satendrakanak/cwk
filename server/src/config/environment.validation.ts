import * as Joi from 'joi';

export default Joi.object({
  NODE_ENV: Joi.string()
    .valid('development', 'production', 'test', 'staging')
    .default('development'),
  APP_URL: Joi.string().required(),
  APP_PORT: Joi.number().port().default(8000),
  FRONT_END_URL: Joi.string().required(),
  API_VERSION: Joi.string().required(),
  DATABASE_HOST: Joi.string().required(),
  DATABASE_PORT: Joi.number().port().default(5432),
  DATABASE_USER: Joi.string().required(),
  DATABASE_PASSWORD: Joi.string().required(),
  DATABASE_NAME: Joi.string().required(),
  DATABASE_SYNC: Joi.string().valid('true', 'false').default('false'),
  DATABASE_AUTO_LOAD: Joi.string().valid('true', 'false').default('false'),
  JWT_SECRET: Joi.string().required(),
  JWT_TOKEN_AUDIENCE: Joi.string().required(),
  JWT_TOKEN_ISSUER: Joi.string().required(),
  JWT_ACCESS_TOKEN_TTL: Joi.number().default(3600),
  JWT_REFRESH_TOKEN_TTL: Joi.number().default(86400),
  REDIS_HOST: Joi.string().required(),
  REDIS_PORT: Joi.number().port().default(6379),
  APP_ENCRYPTION_KEY: Joi.string().required(),
  LICENSE_PORTAL_URL: Joi.string().uri().optional(),
  LICENSE_PRODUCT_SLUG: Joi.string().default('codewithkasa'),
  LICENSE_PRODUCT_SLUG_ALIASES: Joi.string().allow('').optional(),
  ALLOW_LOCAL_LICENSE_KEYS: Joi.string().valid('true', 'false').default('false'),
});
