import { connect } from "../../config/database.js";
import { HttpError } from "../../config/error-handle.js";

export async function getAll() {
  try {
    const query = `
      SELECT * 
      FROM all_courses
      WHERE course_id != 'CT'
      ORDER BY "to", level_term, course_id
    `;
    const client = await connect();
    const courses = await client.query(query);

    const query2 = `
      SELECT * 
      FROM courses_sections
    `;

    const courses_section = await client.query(query2);
    client.release();

    const course_list = courses.rows;
    const courses_section_list = courses_section.rows;

    for (const sectionInfo of courses_section_list) {
      const matchingCourse = course_list.find(
        (course) =>
          course.course_id === sectionInfo.course_id &&
          course.session === sectionInfo.session
      );

      if (matchingCourse) {
        if (!matchingCourse.sections) {
          matchingCourse.sections = [];
        }
        matchingCourse.sections.push(sectionInfo.section);
        matchingCourse.batch = sectionInfo.batch;
      }
    }
    return course_list;
  } catch (err) {
    next(err);
  }
}

export async function saveCourse(Course) {
  const course_id = Course.course_id;
  const name = Course.name;
  const type = Course.type;
  const class_per_week = Course.class_per_week;
  const from = Course.from;
  const to = Course.to;
  const level_term = Course.level_term;

  const query =`
    INSERT INTO all_courses (course_id, name, type, class_per_week, \"from\", \"to\", level_term)
    VALUES ($1, $2, $3, $4, $5, $6, $7)
    ON CONFLICT (course_id, level_term) DO UPDATE
    SET name = EXCLUDED.name,
        type = EXCLUDED.type,
        class_per_week = EXCLUDED.class_per_week,
        "from" = EXCLUDED."from",
        "to" = EXCLUDED."to",
        level_term = EXCLUDED.level_term
  `;
  const values = [course_id, name, type, class_per_week, from, to, level_term];

  const client = await connect();
  try {
    const resultsIns = await client.query(query, values);

    if (resultsIns.rowCount <= 0) {
      next(new Error("Insertion Failed"));
    } else {
      return resultsIns.rowCount;
    }
  } finally {
    client.release();
  }
}

export async function updateCourse(Course) {
  const course_id_old = Course.course_id_old;
  const course_id = Course.course_id;
  const name = Course.name;
  const type = Course.type;
  const class_per_week = Course.class_per_week;
  const from = Course.from;
  const to = Course.to;
  const teacher_credit = Course.teacher_credit;
  const level_term = Course.level_term;

  const client = await connect();
  try {
    const query = `
      UPDATE all_courses
      SET course_id=$1, name=$2, type=$3, session=(SELECT value from configs where key = 'CURRENT_SESSION'), class_per_week=$4, \"from\" = $5, \"to\" = $6, level_term = $7
      WHERE course_id=$8
    `;
    const values = [course_id, name, type, class_per_week, from, to, level_term, course_id_old];
    const resultsIns = await client.query(query, values);

    if (resultsIns.rowCount <= 0) {
      throw new HttpError(400, "Update Failed");
    } else {
      return resultsIns.rowCount; // Return the first found admin
    }
  } finally {
    client.release();
  }
}

export async function removeCourse(course_id) {
  const query = `
      DELETE FROM all_courses
      WHERE course_id = $1
    `;
  const values = [course_id];
  const client = await connect();
  const results = await client.query(query, values);
  client.release();

  if (results.rowCount <= 0) {
    throw new HttpError(404, "Course not found");
  } else {
    return results.rowCount; // Return the first found admin
  }
}

export async function getAllLab() {
  const query =`
    SELECT cs.course_id, cs.section, cs.batch , c.name, s.level_term, s.department
    FROM courses_sections cs
    JOIN courses c ON cs.course_id = c.course_id
    join sections s using (batch, section, department)
    WHERE cs.course_id LIKE 'CSE%' and c.type=1
    ORDER BY cs.course_id, cs.section`;
  const client = await connect();
  const results = await client.query(query);
  client.release();
  return results.rows;
}

export async function getNonDeptLabs() {
  const query =
    "SELECT cs.course_id, cs.section, cs.batch , c.name, s.level_term, s.department \
    FROM courses_sections cs\
    JOIN courses c ON cs.course_id = c.course_id\
    join sections s using (batch, section, department)\
    WHERE cs.course_id NOT LIKE 'CSE%' and c.type=1";
  const client = await connect();
  const results = await client.query(query);
  client.release();
  return results.rows;
}

export async function getNonDeptTheories() {
  const query =
    "SELECT cs.course_id, cs.section, cs.batch , c.name, s.level_term, s.department \
    FROM courses_sections cs\
    JOIN courses c ON cs.course_id = c.course_id\
    join sections s using (batch, section, department)\
    WHERE cs.course_id NOT LIKE 'CSE%' and c.type=0";
  const client = await connect();
  const results = await client.query(query);
  client.release();
  return results.rows;
}

export async function getSessionalCoursesByDeptLevelTerm(department, level_term) {
  const query = `
    SELECT course_id, name, class_per_week
    FROM courses
    WHERE type = 1
    AND courses.to = $1
    AND level_term = $2
    ORDER BY course_id
    `;
  const values = [department, level_term];
  const client = await connect();
  const results = await client.query(query, values);
  client.release();
  return results.rows;
}

export async function getTheoryCoursesByDeptLevelTerm(department, level_term) {
  const query = `
    SELECT course_id, name, class_per_week
    FROM courses
    WHERE type = 0
    AND courses.to = $1
    AND level_term = $2
    ORDER BY course_id
    `;
  const values = [department, level_term];
  const client = await connect();
  const results = await client.query(query, values);
  client.release();
  return results.rows;
}
