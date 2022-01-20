import { Sequelize } from 'sequelize';
import { DatabaseLogger, Logger } from '../utils/Logger';
import {
  fetchCollegesWithDepartments,
  fetchCourseBases,
  fetchAllCourseExtras,
  CollegeData,
  Department,
} from '../helpers/fetcher';
import {
  ProcessedCourseBaseData,
  ProcessedCourseExtraData,
} from '../helpers/preprocess';

export interface DatabaseConfig {
  host: string;
  name: string;
  user: string;
  password: string;
}

export class CourseDB {
  private readonly db: Sequelize;

  constructor(config: DatabaseConfig) {
    this.db = new Sequelize(config.name, config.user, config.password, {
      host: config.host,
      dialect: 'mariadb',
      timezone: '+08:00',
      logging: (sql: string) => DatabaseLogger.info(sql),
      pool: {
        max: 10,
        min: 2,
        acquire: 300000,
        idle: 10000,
      },
    });
  }

  async updateAll() {
    const collegesToInsert: CollegeData[] = [];
    const departmentsToInsert: Department[] = [];
    const coursesToInsert: ProcessedCourseBaseData[] = [];
    const courseExtrasToInsert: ProcessedCourseExtraData[] = [];

    try {
      Logger.info('Start fetching all colleges...');
      const colleges = await fetchCollegesWithDepartments();
      Logger.info(`${colleges.length} colleges fetched.`);

      for (const [collegeIndex, college] of colleges.entries()) {
        Logger.info(
          `College ${college.collegeId} (${collegeIndex + 1}/${
            colleges.length
          }):`,
        );
        collegesToInsert.push(college);

        Logger.info(`Start fetching departments of ${college.collegeId}...`);
        const departments = college.departments;
        Logger.info(`${departments.length} departments fetched.`);

        for (const [departmentIndex, department] of departments.entries()) {
          Logger.info(
            `Department ${department.departmentId} (${departmentIndex + 1}/${
              departments.length
            }):`,
          );
          departmentsToInsert.push(department);

          Logger.info(
            `Start fetching courses of ${department.departmentId}...`,
          );
          const courses = await fetchCourseBases(
            department.departmentId,
            college.collegeId,
          );
          Logger.info(`${courses.length} courses fetched.`);

          coursesToInsert.push(...courses);
        }
      }

      Logger.info(`Start fetching course extras...`);
      const courseExtras = await fetchAllCourseExtras();
      Logger.info(`${courseExtras.length} course extras fetched.`);

      courseExtrasToInsert.push(...courseExtras);
    } catch (e) {
      Logger.error('Encounter an error while fetching data:', e);
      process.exit(-1);
    }
    Logger.info('Done!');
  }
}
