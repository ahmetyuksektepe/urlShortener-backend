import dotenv from 'dotenv';
import { Pool } from 'pg';
dotenv.config();    


const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

pool.connect()
  .then(() => {
    console.log('PostgreSQL  başarıyla bağlandı');
  })
  .catch(err => {
    console.error('Database bağlantı hatası:', err.message);
    process.exit(1);
  });

process.on('SIGINT', () => {
  pool.end(() => {
    console.log('Database connection pool has ended');
    process.exit(0);
  });
});

export default pool;
