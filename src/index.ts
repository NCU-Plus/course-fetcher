import { DatabaseConfig, CourseDB } from './core/CourseDB';
import dotenv from 'dotenv';

dotenv.config();

const config: DatabaseConfig = {
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  name: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
};

(async () => {
  // update database file
  const courseDB = new CourseDB(config);
  await courseDB.sync();
  await courseDB.updateAll();
  await courseDB.sequelize.close();
})();
