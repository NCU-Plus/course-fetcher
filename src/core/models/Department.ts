import { Model, DataTypes } from 'sequelize';
import { CourseDB } from '../CourseDB';

export class Department extends Model {
  departmentId: string;
  departmentName: string;
  collegeId: string;
}

export function init(courseDB: CourseDB) {
  Department.init(
    {
      departmentId: {
        type: DataTypes.STRING,
        unique: true,
        primaryKey: true,
      },
      departmentName: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      collegeId: {
        type: DataTypes.STRING,
        allowNull: false,
      },
    },
    {
      sequelize: courseDB.sequelize,
    },
  );
}
