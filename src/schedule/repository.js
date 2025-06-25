import { connect } from "../config/database.js";

export async function getTheorySchedule(batch, section) {
  // This query gets schedules for both the main section and any subsections
  const query = `
    SELECT course_id, c.type, "day", "time", department, "section"
    FROM schedule_assignment sa
    NATURAL JOIN courses c
    WHERE batch = $1 AND ("section" = $2 OR "section" LIKE $3)
    AND "session" = (SELECT value FROM configs WHERE key='CURRENT_SESSION')
    ORDER BY "section"
  `;
  const values = [batch, section, `${section}%`];
  const client = await connect();
  const results = await client.query(query, values);
  client.release();
  
  // Organize results with subsections grouped under their main section
  const mainSectionSchedules = results.rows.filter(row => row.section === section);
  const subsectionSchedules = {};
  
  // Group subsection schedules
  results.rows.forEach(row => {
    if (row.section !== section) {
      if (!subsectionSchedules[row.section]) {
        subsectionSchedules[row.section] = [];
      }
      subsectionSchedules[row.section].push(row);
    }
  });
  
  return {
    mainSection: mainSectionSchedules,
    subsections: subsectionSchedules
  };
}

export async function setTheorySchedule(batch, section, course, schedule) {
  const query = `INSERT INTO schedule_assignment (batch, "section", "session", course_id, "day", "time", department) VALUES ($1, $2, (SELECT value FROM configs WHERE key='CURRENT_SESSION'), $3, $4, $5, $6)`;
  const removeCourses = `DELETE FROM schedule_assignment WHERE batch = $1 and "section" = $2 and course_id = $3 AND "session" = (SELECT value FROM configs WHERE key='CURRENT_SESSION')`;
  console.log(batch, section, course);
  
  const getQuery = `
    SELECT "to"
    FROM courses
    WHERE course_id = $1
  `;
  const getValues = [course];
  const client = await connect();
  const result = await client.query(getQuery, getValues);
  console.log(result.rows);
  
  const department = result.rows[0].to;
  try {
    await client.query("BEGIN");
    await client.query(removeCourses, [batch, section, course]);
    for (const slot of schedule) {
      const values = [batch, section, course, slot.day, slot.time, department];
      await client.query(query, values);
    }
    await client.query("COMMIT");
    return true;
  } catch (e) {
    console.log(e);
    await client.query("ROLLBACK");
    return false;
  } finally {
    client.release();
  }
}

export async function getSessionalSchedule(batch, section) {
  const query = `
    SELECT course_id, "day", "time", department, "section"
    FROM schedule_assignment sa
    NATURAL JOIN courses c
    WHERE batch = $1 AND "section" = $2 AND type = 1
    AND "session" = (SELECT value FROM configs WHERE key='CURRENT_SESSION')
  `;
  const values = [batch, section];
  const client = await connect();
  const results = await client.query(query, values);
  client.release();
  return results.rows;
}

export async function setSessionalSchedule(batch, section, department, schedule) {
  const query = `INSERT INTO schedule_assignment (batch, "section", "session", course_id, "day", "time", department) VALUES ($1, $2, (SELECT value FROM configs WHERE key='CURRENT_SESSION'), $3, $4, $5, $6)`;
  const removeCourses = `DELETE FROM schedule_assignment WHERE batch = $1 and "section" = $2 AND department = $3 AND "session" = (SELECT value FROM configs WHERE key='CURRENT_SESSION')`;

  const client = await connect();
  try {
    await client.query("BEGIN");

    await client.query(removeCourses, [batch, section, department]);
    for (const slot of schedule) {
      const getQuery2 = `
        SELECT "to"
        FROM courses
        WHERE course_id = $1
      `;
      let dept = await client.query(getQuery2, [slot.course_id])
      dept = dept.rows[0].to;
      const values = [batch, section, slot.course_id, slot.day, slot.time, dept];
      await client.query(query, values);
    }
    await client.query("COMMIT");
    return true;
  } catch (e) {
    console.log(e);
    await client.query("ROLLBACK");
    return false;
  } finally {
    client.release();
  }
}

export async function getTheoryScheduleForms() {
  const query = `
    SELECT response, teachers.initial, teachers.name, teachers.email, teachers.seniority_rank
    FROM forms
    INNER JOIN teachers ON forms.initial = teachers.initial
    WHERE type = 'theory-sched'
    `;

  const client = await connect();
  const results = (await client.query(query)).rows;
  client.release();
  return results;
}

export async function getTheoryScheduleTeachers() {
  const query = `
  select DISTINCT initial, cs.batch  from teacher_assignment ta join courses_sections cs using (course_id, "session")
  `;
  const client = await connect();
  const results = (await client.query(query)).rows;
  client.release();
  return results;
}

export async function nextInSeniority() {
  const query = `
  select distinct on (batch) id, course_id, batch, t.initial, t."name", t.email, t.surname from forms f join teacher_assignment ta using (initial) 
  join courses_sections cs using (course_id) natural join teachers t 
  where f."type" = 'theory-sched' and response is null order by batch, seniority_rank`;
  const client = await connect();
  const results = (await client.query(query)).rows;
  client.release();
  return results;
}

export async function getAllScheduleDB() {
  const query = `
  select * from schedule_assignment sa
  `;
  const client = await connect();
  const results = (await client.query(query)).rows;
  client.release();
  return results;
}

export async function getDepartmentalSessionalSchedule(){
  const query = `
    SELECT course_id, batch, "section", "day", "time"
    FROM schedule_assignment
    WHERE course_id LIKe 'CSE%'
    AND LENGTH("section") = 2
    AND "session" = (SELECT value FROM configs WHERE key='CURRENT_SESSION')
    ORDER BY course_id, "section"
  `;
  const client = await connect();
  const results = await client.query(query);
  client.release();
  return results.rows;
}

export async function roomContradictionDB(batch, section, course_id) {
  const roomQuery = `
  select room from lab_room_assignment lra where batch = $1 and "section" = $2 and course_id = $3 and session = (SELECT value FROM configs WHERE key='CURRENT_SESSION')
  `;

  const contradictionQuery = `
  select * from lab_room_assignment lra natural join schedule_assignment sa where room = $1 and session = (SELECT value FROM configs WHERE key='CURRENT_SESSION')
  `;

  const client = await connect();
  let results = (await client.query(roomQuery, [batch, section, course_id]))
    .rows;
  const room = results[0]?.room;
  results = (await client.query(contradictionQuery, [room])).rows;
  client.release();
  return results;
}

export async function teacherContradictionDB(batch, section, course_id) {
  const teacherQuery = `
  select initial from teacher_sessional_assignment ta where batch = $1 and "section" = $2 and course_id = $3 and session = (SELECT value FROM configs WHERE key='CURRENT_SESSION')
  `;

  const contradictionQuery = `
  select ta.initial, sa.* from teacher_assignment ta join courses_sections cs using (course_id, "session") natural join schedule_assignment sa where initial = $1 and session = (SELECT value FROM configs WHERE key='CURRENT_SESSION')
  union
  select ta.initial, sa.* from teacher_sessional_assignment ta join schedule_assignment sa using (course_id, "session", batch, "section") where initial = $1 and session = (SELECT value FROM configs WHERE key='CURRENT_SESSION')
  `;

  const client = await connect();
  let teachers = (await client.query(teacherQuery, [batch, section, course_id]))
    .rows;
  const results = [];
  for (const teacher of teachers) {
    const initial = teacher.initial;
    const result = {
      initial,
      schedule: (await client.query(contradictionQuery, [initial])).rows,
    };
    results.push(result);
  }
  client.release();
  return results;
}

export async function ensureEmailTemplateExists(type) {
  const client = await connect();
  
  try {
    // Check if the template exists
    const checkQuery = "SELECT * FROM configs WHERE key= $1";
    const checkResult = await client.query(checkQuery);
    
    // If the template doesn't exist or has no value, create it
    if (checkResult.rows.length === 0) {
      if(type == "SCHEDULE_EMAIL") {
        const insertQuery = "INSERT INTO configs (key, value) VALUES ('SCHEDULE_EMAIL', 'Please fill out your theory schedule preferences. Click the link below to access the form.')";
        await client.query(insertQuery);
      } else if (type == "THEORY_EMAIL") {
        const insertQuery = "INSERT INTO configs (key, value) VALUES ('THEORY_EMAIL', 'Please fill out your theory course preferences. Click the link below to access the form.')";
        await client.query(insertQuery);
      } else if (type == "SESSIONAL_EMAIL") {
        const insertQuery = "INSERT INTO configs (key, value) VALUES ('SESSIONAL_EMAIL', 'Please fill out your sessional course preferences. Click the link below to access the form.')";
        await client.query(insertQuery);
      } else {
        return false;
      }
      return true;
    } else if (!checkResult.rows[0].value) {
      if(type == "SCHEDULE_EMAIL") {
        const updateQuery = "UPDATE configs SET value = 'Please fill out your theory schedule preferences. Click the link below to access the form.' WHERE key = 'SCHEDULE_EMAIL'";
        await client.query(updateQuery);
      } else if (type == "THEORY_EMAIL") {
        const updateQuery = "UPDATE configs SET value = 'Please fill out your theory course preferences. Click the link below to access the form.' WHERE key = 'THEORY_EMAIL'";
        await client.query(updateQuery);
      } else if (type == "SESSIONAL_EMAIL") {
        const updateQuery = "UPDATE configs SET value = 'Please fill out your sessional course preferences. Click the link below to access the form.' WHERE key = 'SESSIONAL_EMAIL'";
        await client.query(updateQuery);
      } else {
        return false;
      }
      return true;
    } else {
      return true;
    }
  } catch (error) {
    console.error("Error ensuring schedule email template exists:", error);
    throw error;
  } finally {
    client.release();
  }
}

export async function getCourseAllSchedule(course_id) {
  const query = `
    SELECT course_id, "day", "time"
    FROM schedule_assignment
    WHERE course_id = $1
    AND "session" = (SELECT value FROM configs WHERE key='CURRENT_SESSION')
  `;
  const client = await connect();
  const results = await client.query(query, [course_id]);
  client.release();
  return results.rows;
}

export async function getCourseSectionalSchedule(course_id, section) {
  const query = `
    SELECT course_id, section, "day", "time"
    FROM schedule_assignment
    WHERE course_id = $1 
    AND "section" = $2
    AND "session" = (SELECT value FROM configs WHERE key='CURRENT_SESSION')
  `;
  const client = await connect();
  const results = await client.query(query, [course_id, section]);
  client.release();
  return results.rows;
}