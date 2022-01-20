import { DatabaseConfig, CourseDB } from './core/CourseDB';
import dotenv from 'dotenv';

dotenv.config();

const config: DatabaseConfig = {
  host: process.env.HOST,
  name: process.env.DATABASE,
  user: process.env.USER,
  password: process.env.PASSWORD,
};

(async () => {
  // update database file
  const courseDB = new CourseDB(config);
  await courseDB.updateAll();
})();
