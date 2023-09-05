import { DBName } from '@intake24-dietician/common/types/database';
import { z, TypeOf } from 'zod';

const withDevDefault = <T extends z.ZodTypeAny>(schema: T, val: TypeOf<T>) =>
  process.env['NODE_ENV'] !== 'production' ? schema.default(val) : schema;

const schema = z.object({
  POSTGRES_USER: withDevDefault(z.string(), 'postgres'),
  POSTGRES_PASSWORD: withDevDefault(z.string(), 'postgres'),
  AUTH_DB: withDevDefault(z.string(), 'intake24-dietician-auth'),
});

const parsed = schema.safeParse(process.env);
if (!parsed.success) {
  console.error('❌ Invalid environment variables:', JSON.stringify(parsed.error.format(), null, 4));
  process.exit(1);
}

const env = parsed.data;
const getDBUrl = (dbName: DBName) => {
  const { POSTGRES_USER, POSTGRES_PASSWORD } = env;
  return `postgresql://${POSTGRES_USER}:${POSTGRES_PASSWORD}@localhost:5432/${dbName}`;
};

export { env, getDBUrl };
