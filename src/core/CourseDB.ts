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
import * as department from './models/Department';
import * as college from './models/College';
import * as course from './models/Course';

export interface DatabaseConfig {
  host: string;
  port: number;
  name: string;
  user: string;
  password: string;
}

export class CourseDB {
  public readonly sequelize: Sequelize;

  constructor(config: DatabaseConfig) {
    this.sequelize = new Sequelize(config.name, config.user, config.password, {
      host: config.host,
      port: config.port,
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
    department.init(this);
    college.init(this);
    course.init(this);
  }

  async sync() {
    await this.sequelize.sync();
    DatabaseLogger.info('Database initialized!');
  }

  async updateAll() {
    const collegesToInsert: CollegeData[] = [];
    const departmentsToInsert: Department[] = [];
    const coursesBaseData: ProcessedCourseBaseData[] = [];
    const courseExtrasData: ProcessedCourseExtraData[] = [];

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

          coursesBaseData.push(...courses);
        }
      }

      Logger.info(`Start fetching course extras...`);
      const courseExtras = await fetchAllCourseExtras();
      Logger.info(`${courseExtras.length} course extras fetched.`);

      courseExtrasData.push(...courseExtras);
    } catch (e) {
      Logger.error('Encounter an error while fetching data:', e);
      process.exit(-1);
    }
    Logger.info('Fetch data completed!');

    Logger.info('Start merging course data...');
    const coursesToInsert: course.CourseData[] = coursesBaseData.map(
      (courseBase) => {
        const courseExtra = courseExtrasData.find(
          (extra) => extra.serialNo === courseBase.serialNo,
        );
        return {
          year: Number(process.env.YEAR),
          semester: course.Semester[process.env.SEMESTER] as number,
          ...courseExtra,
          ...courseBase,
        } as course.CourseData;
      },
    );

    Logger.info('Merge course data completed!');

    Logger.info('Start updating database...');
    Logger.info('Start updating colleges...');
    for (const collegeData of collegesToInsert) {
      const [collegeInstance, created] = await college.College.findOrCreate({
        where: { collegeId: collegeData.collegeId },
        defaults: {
          collegeName: collegeData.collegeName,
        },
      });
      if (created) Logger.info(`College created: ${collegeData.collegeId}`);
    }
    Logger.info('Update colleges completed!');
    Logger.info('Start updating departments...');
    for (const departmentData of departmentsToInsert) {
      const [departmentInstance, created] =
        await department.Department.findOrCreate({
          where: { departmentId: departmentData.departmentId },
          defaults: {
            departmentName: departmentData.departmentName,
            collegeId: departmentData.collegeId,
          },
        });
      if (created)
        Logger.info(`Department created: ${departmentData.departmentId}`);
    }
    Logger.info('Update departments completed!');
    Logger.info(
      `Start updating courses of ${process.env.YEAR}-${process.env.SEMESTER}...`,
    );
    for (const courseData of coursesToInsert) {
      const [courseInstance, created] = await course.Course.findOrCreate({
        where: {
          year: courseData.year,
          semester: courseData.semester,
          serialNo: courseData.serialNo,
        },
        defaults: {
          classNo: courseData.classNo,
          title: courseData.title,
          credit: courseData.credit,
          passwordCard: courseData.passwordCard,
          teachers: JSON.stringify(courseData.teachers),
          classTimes: JSON.stringify(courseData.classTimes),
          limitCnt: courseData.limitCnt,
          admitCnt: courseData.admitCnt,
          waitCnt: courseData.waitCnt,
          collegeId: courseData.collegeId,
          departmentId: courseData.departmentId,
          courseType: courseData.courseType,
        },
      });
      if (created) Logger.info(`Course created: ${courseData.serialNo}`);
    }
    Logger.info(
      `Update courses of ${process.env.YEAR}-${process.env.SEMESTER}completed!`,
    );
    Logger.info('Update database completed!');
  }
}
