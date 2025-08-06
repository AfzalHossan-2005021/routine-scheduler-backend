import { connect } from "../../config/database.js";
import { getCurrentSession } from "../../pdfgenerator/repository.js";
import { HttpError } from "../../config/error-handle.js";

export async function getAll() {
  try {
    const query = `
      SELECT * 
      FROM all_courses
      WHERE course_id != 'CT'
      ORDER BY course_id
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

export async function getActiveCourseIds() {
  try {
    const query = `
      SELECT DISTINCT course_id
      FROM courses
      WHERE course_id != 'CT'
      ORDER BY course_id
    `;
    const client = await connect();
    const results = await client.query(query);
    client.release();
    console.log('getActiveCourseIds result:', results.rows);
    return results.rows;
  } catch (err) {
    console.error('Error in getActiveCourseIds:', err);
    throw err;
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
  const assignedSections = Course.assignedSections || [];

  const client = await connect();
  try {
    // Get current session
    const currentSession = await getCurrentSession();

    // Start transaction
    await client.query('BEGIN');

    // 1. Insert into all_courses table (existing logic)
    const allCoursesQuery = `
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
    const allCoursesValues = [course_id, name, type, class_per_week, from, to, level_term];
    const allCoursesResult = await client.query(allCoursesQuery, allCoursesValues);

    // 2. Insert into courses table
    const coursesQuery = `
      INSERT INTO courses (course_id, name, type, session, class_per_week, \"from\", \"to\", level_term)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      ON CONFLICT (course_id, session) DO UPDATE
      SET name = EXCLUDED.name,
          type = EXCLUDED.type,
          class_per_week = EXCLUDED.class_per_week,
          "from" = EXCLUDED."from",
          "to" = EXCLUDED."to",
          level_term = EXCLUDED.level_term
    `;
    const coursesValues = [course_id, name, type, currentSession, class_per_week, from, to, level_term];
    await client.query(coursesQuery, coursesValues);

    // 3. Insert into courses_sections table for assigned sections (for both Theory and Sessional courses)
    console.log('DEBUG saveCourse: type =', type, 'assignedSections =', assignedSections);
    if (assignedSections.length > 0) {
      console.log('DEBUG saveCourse: Processing course sections for', type === 0 ? 'Theory' : 'Sessional', 'course');
      // First, delete existing course-section assignments for this course and session
      const deleteQuery = `DELETE FROM courses_sections WHERE course_id = $1 AND session = $2`;
      await client.query(deleteQuery, [course_id, currentSession]);

      // Then insert new assignments
      for (const sectionData of assignedSections) {
        const [batch, section] = sectionData.split('-');
        console.log('DEBUG saveCourse: Inserting section data -', { course_id, currentSession, batch: parseInt(batch), section, to });
        const coursesSectionsQuery = `
          INSERT INTO courses_sections (course_id, session, batch, section, department)
          VALUES ($1, $2, $3, $4, $5)
          ON CONFLICT (course_id, session, batch, section) DO NOTHING
        `;
        const coursesSectionsValues = [course_id, currentSession, parseInt(batch), section, to];
        const sectionsResult = await client.query(coursesSectionsQuery, coursesSectionsValues);
        console.log('DEBUG saveCourse: Section insertion result rowCount =', sectionsResult.rowCount);
      }
    } else {
      console.log('DEBUG saveCourse: No sections assigned - skipping section assignments');
    }

    // Commit transaction
    await client.query('COMMIT');

    return allCoursesResult.rowCount;
  } catch (error) {
    // Rollback transaction on error
    await client.query('ROLLBACK');
    throw error;
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
  const assignedSections = Course.assignedSections || [];

  // Get current session
  const currentSession = await getCurrentSession();

  const client = await connect();
  try {
    // Start transaction
    await client.query('BEGIN');

    // 1. Update all_courses table
    const allCoursesQuery = `
      UPDATE all_courses
      SET course_id=$1, name=$2, type=$3, class_per_week=$4, \"from\" = $5, \"to\" = $6, level_term = $7
      WHERE course_id=$8
    `;
    const allCoursesValues = [
      course_id,
      name,
      type,
      class_per_week,
      from,
      to,
      level_term,
      course_id_old,
    ];
    const allCoursesResult = await client.query(allCoursesQuery, allCoursesValues);

    if (allCoursesResult.rowCount <= 0) {
      await client.query('ROLLBACK');
      throw new HttpError(400, "Update Failed - Course not found in all_courses");
    }

    // 2. Update courses table
    const coursesUpdateQuery = `
      UPDATE courses
      SET course_id=$1, name=$2, type=$3, class_per_week=$4, \"from\" = $5, \"to\" = $6, level_term = $7
      WHERE course_id=$8 AND session = $9
    `;
    const coursesUpdateValues = [
      course_id,
      name,
      type,
      class_per_week,
      from,
      to,
      level_term,
      course_id_old,
      currentSession
    ];
    const coursesUpdateResult = await client.query(coursesUpdateQuery, coursesUpdateValues);

    // If course doesn't exist in courses table, insert it
    if (coursesUpdateResult.rowCount === 0) {
      const coursesInsertQuery = `
        INSERT INTO courses (course_id, name, type, session, class_per_week, \"from\", \"to\", level_term)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      `;
      const coursesInsertValues = [course_id, name, type, currentSession, class_per_week, from, to, level_term];
      await client.query(coursesInsertQuery, coursesInsertValues);
    }

    // 3. Handle courses_sections table updates
    // First, delete existing course-section assignments for the old course_id
    const deleteQuery = `DELETE FROM courses_sections WHERE course_id = $1 AND session = $2`;
    await client.query(deleteQuery, [course_id_old, currentSession]);

    // If course_id changed, also delete for new course_id
    if (course_id !== course_id_old) {
      await client.query(deleteQuery, [course_id, currentSession]);
    }

    // Insert new assignments for both Theory and Sessional courses
    console.log('DEBUG updateCourse: type =', type, 'assignedSections =', assignedSections);
    if (assignedSections.length > 0) {
      console.log('DEBUG updateCourse: Processing course sections for', type === 0 ? 'Theory' : 'Sessional', 'course');
      for (const sectionData of assignedSections) {
        const [batch, section] = sectionData.split('-');
        console.log('DEBUG updateCourse: Inserting section data -', { course_id, currentSession, batch: parseInt(batch), section, to });
        const coursesSectionsQuery = `
          INSERT INTO courses_sections (course_id, session, batch, section, department)
          VALUES ($1, $2, $3, $4, $5)
          ON CONFLICT (course_id, session, batch, section) DO NOTHING
        `;
        const coursesSectionsValues = [course_id, currentSession, parseInt(batch), section, to];
        const sectionsResult = await client.query(coursesSectionsQuery, coursesSectionsValues);
        console.log('DEBUG updateCourse: Section insertion result rowCount =', sectionsResult.rowCount);
      }
    } else {
      console.log('DEBUG updateCourse: No sections assigned - skipping section assignments');
    }

    // Commit transaction
    await client.query('COMMIT');
    return allCoursesResult.rowCount;

  } catch (error) {
    // Rollback transaction on error
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

export async function removeCourse(course_id) {
  const client = await connect();
  try {
    // Start transaction
    await client.query('BEGIN');

    console.log('DEBUG removeCourse: Deleting course_id =', course_id);

    // Get current session for proper deletion
    const currentSession = await getCurrentSession();

    // 1. Delete from courses_sections table first (foreign key constraint)
    const deleteCoursesSection = `DELETE FROM courses_sections WHERE course_id = $1`;
    const courseSectionResult = await client.query(deleteCoursesSection, [course_id]);
    console.log('DEBUG removeCourse: Deleted from courses_sections, rowCount =', courseSectionResult.rowCount);

    // 2. Delete from schedule_assignment table (foreign key constraint to courses table)
    const deleteScheduleAssignment = `DELETE FROM schedule_assignment WHERE course_id = $1 AND session = $2`;
    const scheduleAssignmentResult = await client.query(deleteScheduleAssignment, [course_id, currentSession]);
    console.log('DEBUG removeCourse: Deleted from schedule_assignment, rowCount =', scheduleAssignmentResult.rowCount);

    // 3. Delete from courses table
    const deleteCourses = `DELETE FROM courses WHERE course_id = $1`;
    const coursesResult = await client.query(deleteCourses, [course_id]);
    console.log('DEBUG removeCourse: Deleted from courses, rowCount =', coursesResult.rowCount);

    // 4. Delete from all_courses table
    const deleteAllCourses = `DELETE FROM all_courses WHERE course_id = $1`;
    const allCoursesResult = await client.query(deleteAllCourses, [course_id]);
    console.log('DEBUG removeCourse: Deleted from all_courses, rowCount =', allCoursesResult.rowCount);

    if (allCoursesResult.rowCount <= 0) {
      await client.query('ROLLBACK');
      throw new HttpError(404, "Course not found");
    }

    // Commit transaction
    await client.query('COMMIT');
    return allCoursesResult.rowCount;

  } catch (error) {
    // Rollback transaction on error
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

export async function getAllLab() {
  const query =`
    SELECT cs.course_id, cs.section, cs.batch , c.name, s.level_term, s.department,c.class_per_week
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
    "SELECT cs.course_id, cs.section, cs.batch , c.name, s.level_term, s.department, c.class_per_week \
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

export async function getSessionalCoursesByDeptLevelTerm(
  department,
  level_term
) {
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
  console.log(`Fetching theory courses for department: ${department}, level_term: ${level_term}`);
  
  // First, let's see what courses exist in the courses table
  const debugQuery = `SELECT course_id, name, type, "to", level_term FROM courses ORDER BY course_id`;
  const client = await connect();
  const debugResults = await client.query(debugQuery);
  console.log(`All courses in database:`);
  console.log(JSON.stringify(debugResults.rows, null, 2));
  
  const query = `
    SELECT course_id, name, class_per_week, "to", level_term
    FROM courses
    WHERE type = 0
    AND "to" = $1
    AND level_term = $2
    ORDER BY course_id
    `;
  const values = [department, level_term];
  
  console.log(`Query: ${query}`);
  console.log(`Values: ${JSON.stringify(values)}`);
  
  const results = await client.query(query, values);
  
  console.log(`Found ${results.rows.length} theory courses:`);
  console.log(JSON.stringify(results.rows, null, 2));
  
  client.release();
  return results.rows;
}
