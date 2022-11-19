import axios from 'axios';
import xml2js from 'xml2js';
import cheerio from 'cheerio';
import {
  CourseBaseData,
  CourseExtraData,
  preprocessCourseBase,
  preprocessCourseExtra,
  ProcessedCourseExtraData,
} from './preprocess';

const course_remote_url =
  'https://cis.ncu.edu.tw/Course/main/support/course.xml';
const course_header = {
  'Accept-Language': 'zh-TW',
};

export interface Department {
  departmentId: string;
  departmentName: string;
  collegeId: string;
}

export interface CollegeData {
  collegeId: string;
  collegeName: string;
  departments: Department[];
}

export async function fetchCollegesWithDepartments(): Promise<CollegeData[]> {
  const response = await axios.get(
    'https://cis.ncu.edu.tw/Course/main/query/byUnion',
  );
  const $ = cheerio.load(response.data);

  const colleges = $('#byUnion_table table > tbody')
    .get()
    .map((table, i) => {
      const collegeId = `collegeI${i}`;
      const collegeName = $(table)
        .find('tr:nth-child(1) th')
        .contents()
        .eq(0)
        .text();
      const departments = $(table)
        .find('tr:nth-child(2) td ul li a')
        .get()
        .map((anchor) => {
          const departmentId = $(anchor)
            .attr('href')
            .replace('/Course/main/query/byUnion?dept=', '');
          const departmentName = $(anchor)
            .text()
            .replace(/\(\d+\)$/, '');
          return { departmentId, departmentName, collegeId };
        });
      return { collegeId, collegeName, departments };
    });

  return colleges;
}

export async function fetchCourseBases(
  departmentId: string,
  collegeId: string,
) {
  // fetch through NCU Course Schedule Planning System internal API
  const resp = await axios.get(course_remote_url, {
    headers: course_header,
    params: {
      id: departmentId,
    },
  });
  const data = await xml2js.parseStringPromise(resp.data);
  return ((data.Courses.Course as { $: CourseBaseData }[]) || []).map(({ $ }) =>
    preprocessCourseBase($, departmentId, collegeId),
  );
}

export async function fetchAllCourseExtras(): Promise<
  ProcessedCourseExtraData[]
> {
  const result: CourseExtraData[] = [];

  for (let pageNo = 1; true; pageNo++) {
    const response = await axios.get(
      `https://cis.ncu.edu.tw/Course/main/query/byKeywords`,
      {
        params: {
          'd-49489-p': pageNo,
          query: true,
        },
      },
    );
    const $ = cheerio.load(response.data);

    const courseExtras = $('#item tbody tr')
      .get()
      .map((tr) => {
        const serialNo = $(tr).find('td:nth-child(1)').html().split('<br>')[0];
        const courseType = $(tr).find('td:nth-child(6)').text().trim();
        return { serialNo, courseType };
      });
    result.push(...courseExtras);

    // break if no next page
    const hasNextPage = $('.pagelinks > :last-child').is('a');
    if (!hasNextPage) break;
  }

  return result.map(preprocessCourseExtra);
}
