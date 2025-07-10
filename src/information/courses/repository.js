import { connect } from "../../config/database.js";
import { HttpError } from "../../config/error-handle.js";

export async function getAll() {
  try {
    const query = `SELECT * FROM courses WHERE course_id != 'CT'`;
    const client = await connect();
    const courses = await client.query(query);

    const query2 = "SELECT * FROM courses_sections";

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
  const session = Course.session;
  const class_per_week = Course.class_per_week;
  const batch = Course.batch;
  const sections = Course.sections;
  const from = Course.from;
  const to = Course.to;
  const teacher_credit = Course.teacher_credit;
  const level_term = Course.level_term;

  var query =
    "INSERT INTO courses (course_id, name, type, session, class_per_week, 'from', to, teacher_credit, level_term) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9 )";
  var values = [course_id, name, type, session, class_per_week, from, to, teacher_credit, level_term];

  var client = await connect();
  try {
    var resultsIns = await client.query(query, values);

    if (batch !== "") {
      for (let section of sections) {
        query =
          "INSERT INTO courses_sections (course_id, session, batch, section, department) VALUES ($1, $2, $3, $4, $5 )";
        values = [course_id, session, batch, section, to];
        const results = await client.query(query, values);
        if (results.rowCount <= 0) {
          throw new HttpError(400, "Insertion Failed");
        }
      }
    }

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
  const session = Course.session;
  const class_per_week = Course.class_per_week;
  const batch = Course.batch;
  const sections = Course.sections;
  const from = Course.from;
  const to = Course.to;
  const teacher_credit = Course.teacher_credit;
  const level_term = Course.level_term;

  var query = `
  DELETE FROM courses_sections
  WHERE course_id = $1 AND session=$2;
    `;
  var values = [course_id_old, session];

  var client = await connect();
  try {
    var resultsIns = await client.query(query, values);

    query = `UPDATE courses SET 
    course_id=$1,
    name=$2, 
    type=$3, 
    session=$4, 
    class_per_week=$5,
    'from' = $6,
    to = $7,
    teacher_credit = $8,
    level_term = $9
    WHERE
    course_id=$10
     `;
    values = [course_id, name, type, session, class_per_week, from, to, teacher_credit, level_term, course_id_old];
    resultsIns = await client.query(query, values);

    for (let section of sections) {
      query =
        "INSERT INTO courses_sections (course_id, session, batch, section, department) VALUES ($1, $2, $3, $4, $5 )";
      values = [course_id, session, batch, section, to];
      const results = await client.query(query, values);
      if (results.rowCount <= 0) {
        throw new HttpError(400, "Insertion Failed");
      }
    }

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
      DELETE FROM courses
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
    FROM all_courses
    WHERE type = 1
    AND all_courses.to = $1
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
    FROM all_courses
    WHERE type = 0
    AND all_courses.to = $1
    AND level_term = $2
    ORDER BY course_id
    `;
  const values = [department, level_term];
  const client = await connect();
  const results = await client.query(query, values);
  client.release();
  return results.rows;
}
