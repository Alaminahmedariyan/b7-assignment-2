import dotenv from 'dotenv';
import path from 'path';

dotenv.config({
  path: path.join(process.cwd(), '.env'),
});

const config = {
 connection_string: process.env.CONNECTIONSTRING as string,
  port: process.env['PORT'] || 5000,
  node_env: process.env['NODE_ENV'] || 'development',
  database_url: process.env['DATABASE_URL'] as string,
  jwt_secret: process.env['JWT_SECRET'] as string,
  jwt_expires_in: process.env['JWT_EXPIRES_IN'] || '7d',
};

export default config;