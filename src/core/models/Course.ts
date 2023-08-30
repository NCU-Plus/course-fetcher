import { Model, DataTypes } from 'sequelize';
import { CourseDB } from '../CourseDB';

export enum Semester {
  FALL = 0,
  SPRING = 1,
}

export interface CourseData {
  year: number;
  semester: Semester;
  serialNo: number;
  classNo: string;
  title: string;
  credit: number;
  passwordCard: string;
  teachers: string[];
  classTimes: string[];
  limitCnt: number;
  admitCnt: number;
  waitCnt: number;
  collegeId: string;
  departmentId: string;
  courseType: string;
}

export class Course extends Model {
  year: number;
  semester: Semester;
  serialNo: number;
  classNo: string;
  title: string;
  credit: number;
  passwordCard: string;
  // should be json string of a string array
  teachers: string;
  // should be json string of a string array
  classTimes: string;
  limitCnt: number;
  admitCnt: number;
  waitCnt: number;
  collegeId: string;
  departmentId: string;
  courseType: string;
}

export function init(courseDB: CourseDB) {
  Course.init(
    {
      year: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      semester: {
        type: DataTypes.TINYINT,
        allowNull: false,
      },
      serialNo: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      classNo: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      title: { type: DataTypes.STRING, allowNull: false },
      credit: {
        type: DataTypes.TINYINT,
        allowNull: false,
      },
      passwordCard: { type: DataTypes.STRING, allowNull: false },
      teachers: { type: DataTypes.JSON, allowNull: false },
      classTimes: { type: DataTypes.JSON, allowNull: false },
      limitCnt: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      admitCnt: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      waitCnt: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      collegeId: { type: DataTypes.STRING, allowNull: false },
      departmentId: { type: DataTypes.STRING, allowNull: false },
      courseType: { type: DataTypes.STRING, allowNull: true },
    },
    {
      sequelize: courseDB.sequelize,
    },
  );
}
