/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-call */

import * as Joi from 'joi';

// eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
export const envValidationSchema = Joi.object({
  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
  DATABASE_URL: Joi.string().uri().required(),
  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
  // JWT_SECRET: Joi.string().required(),
  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
  PORT: Joi.number().default(3000),
  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
  // NODE_ENV: Joi.string()
  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
  // .valid('development', 'production', 'test')
  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
  // .default('development'),
});
