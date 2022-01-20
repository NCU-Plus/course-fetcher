import { Model, DataTypes } from 'sequelize';
import { CourseDB } from '../CourseDB';

export class College extends Model {
  collegeId: string;
  collegeName: string;
}

export function init(courseDB: CourseDB) {
  College.init(
    {
      collegeId: {
        type: DataTypes.STRING,
        unique: true,
        primaryKey: true,
      },
      collegeName: {
        type: DataTypes.STRING,
        allowNull: false,
      },
    },
    {
      sequelize: courseDB.sequelize,
    },
  );
}
