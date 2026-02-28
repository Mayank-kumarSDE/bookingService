import dotenv from 'dotenv';

dotenv.config();

export const serverConfig = {
  port: process.env.PORT || 3000,
  redis_server_url : process.env.REDIS_SERVER_URL || 'redis://localhost:6379',
  lock_ttl:parseInt(process.env.LOCK_TTL) ||60000
};

export const dbConfig = {
  username: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'test_db',
  host: process.env.DB_HOST || 'localhost',
  dialect: 'mysql',
}
