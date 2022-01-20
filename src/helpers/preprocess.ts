export interface CourseBaseData {
  Title: string;
  ClassNo: string;
  SerialNo: string;
  Teacher: string;
  ClassTime: string;
  limitCnt: string;
  credit: string;
  ClassTimeAlt: string;
  admitCnt: string;
  waitCnt: string;
  dataTime: string;
  passwordCard: string;
}

export interface CourseExtraData {
  serialNo: string;
  courseType: string;
}

export interface ProcessedCourseBaseData {
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
}

export interface ProcessedCourseExtraData {
  serialNo: number;
  courseType: string;
}

export function preprocessCourseBase(
  $: CourseBaseData,
  departmentId: string,
  collegeId: string,
): ProcessedCourseBaseData {
  return {
    serialNo: Number($.SerialNo),
    classNo: $.ClassNo,
    title: $.Title,

    credit: Number($.credit),
    passwordCard: $.passwordCard,

    teachers: deflateTeachers($.Teacher),
    classTimes: deflateClassTime($.ClassTime),

    limitCnt: Number($.limitCnt),
    admitCnt: Number($.admitCnt),
    waitCnt: Number($.waitCnt),

    collegeId,
    departmentId,
  };
}
export function preprocessCourseExtra(
  $: CourseExtraData,
): ProcessedCourseExtraData {
  return {
    serialNo: Number($.serialNo),
    courseType: normalizeCourseType($.courseType),
  };
}

function normalizeCourseType(courseType: string) {
  if (courseType === '必修') return 'REQUIRED';
  if (courseType === '選修') return 'ELECTIVE';
  throw new Error(`Unknown course type: '${courseType}'`);
}

function deflateTeachers(teachersStr: string) {
  return teachersStr.split(/,\s*/).filter((e) => e.length !== 0);
}
function deflateClassTime(classTimesStr: string) {
  return classTimesStr
    .split(',')
    .filter((e) => e.length !== 0)
    .map(([w, h]) => `${w}-${h}`);
}
