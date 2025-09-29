import dotenv from 'dotenv';
dotenv.config();

export default {
  client: 'mysql2',
  connection: {
    host: process.env.MYSQL_HOST || '127.0.0.1',
    port: Number(process.env.MYSQL_PORT || 3306),
    user: process.env.MYSQL_USER || 'root',
    password: process.env.MYSQL_PASSWORD || '',
    database: process.env.MYSQL_DATABASE || 'mydb',
    timezone: 'Z'
  },
  pool: { min: 0, max: 10 }
};



