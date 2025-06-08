import { Pool } from 'pg';

const pool = new Pool(
    process.env.DATABASE_URL
        ? { connectionString: process.env.DATABASE_URL }
        : {
              user: process.env.DB_USER,
              host: process.env.DB_HOST,
              database: process.env.DB_NAME,
              password: process.env.DB_PASSWORD,
              port: parseInt(process.env.DB_PORT || '5432', 10),
          },
);

export default pool;
