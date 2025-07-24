import { connect } from "../config/database.js";

export async function getAllTheoryRoomAssignmentDB() {
    
    const query = `
        SELECT course_id, section, day, time, room_no
        FROM schedule_assignment
        WHERE course_id ~ '[13579]$'
        ORDER BY course_id, section, day, time
    `;
    const client = await connect();
    const results = await client.query(query);
    client.release();
    return results.rows;
}

export async function updateTheoryRoomAssignmentDB(course_id, section, day, time, room_no) {
    const query = `
        UPDATE schedule_assignment
        SET room_no = $5
        WHERE course_id = $1 AND section = $2 AND day = $3 AND time = $4
    `;
    const values = [course_id, section, day, time, room_no];

    const client = await connect();
    const result = await client.query(query, values);
    client.release();
    return result.rowCount > 0;
}

export async function getAllSectionRoomAllocationDB() {
  const query = `
    SELECT ltu.level_term, cs.department, cs.section, cs.room_no
    FROM courses_sections cs
    JOIN level_term_unique ltu ON ltu.department = cs.department AND ltu.batch = cs.batch
    WHERE cs.section LIKE '_'
    GROUP BY ltu.level_term, cs.department, cs.section, cs.room_no
    ORDER BY cs.department, ltu.level_term, cs.section;
  `;

  const client = await connect();
  const results = await client.query(query);
  client.release();

  return results.rows;
}

export async function updateSectionRoomAllocationDB(levelTerm, department, section, roomNo) {
  const update_section_room_query = `
    UPDATE courses_sections
    SET room_no = $4
    WHERE section = $3 AND department = $2 AND batch = (
      SELECT batch FROM level_term_unique WHERE level_term = $1 AND department = $2
    )
  `;

  const updated_course_id_query = `
    SELECT course_id FROM courses_sections
    WHERE section = $3 AND department = $2 AND batch = (
      SELECT batch FROM level_term_unique WHERE level_term = $1 AND department = $2
    ) AND room_no = $4
  `;

  const update_course_room_query = `
    UPDATE schedule_assignment
    SET room_no = $3
    WHERE course_id = ANY($1) AND section = $2
  `;

  const client = await connect();
  const values = [levelTerm, department, section, roomNo];
  const update_section_room_result = await client.query(update_section_room_query, values);
  if (update_section_room_result.rowCount === 0) {
    client.release();
    return false;
  }
  const updated_course_id_results = await client.query(updated_course_id_query, values);
  if (updated_course_id_results.rowCount === 0) {
    client.release();
    return true;
  }
  const updated_course_ids = updated_course_id_results.rows.map(row => row.course_id);
  const update_course_room_result =  await client.query(update_course_room_query, [updated_course_ids, section, roomNo]);

  if (update_course_room_result.rowCount === 0) {
    client.release();
    return false;
  }
  client.release();
  return true;
}

export async function getAllNonDepartmentalLabRoomAssignmentDB() {
    const query = `
        SELECT course_id, section, room_no
        FROM schedule_assignment
        WHERE course_id ~ '[02468]$'
        AND course_id NOT LIKE 'CSE%'
        ORDER BY course_id, section, room_no
    `;
    const client = await connect();
    const results = await client.query(query);
    client.release();
    return results.rows;
}

export async function updateNonDepartmentalLabRoomAssignmentDB(course_id, section, room_no) {
    const query = `
        UPDATE schedule_assignment
        SET room_no = $3
        WHERE course_id = $1 AND section = $2
    `;
    const values = [course_id, section, room_no];

    const client = await connect();
    const result = await client.query(query, values);
    client.release();
    return result.rowCount > 0;
}