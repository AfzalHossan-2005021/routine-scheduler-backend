import { connect } from "../config/database.js";

export async function getAll() {
  const query = `
    select cs.course_id, cs.section, COALESCE((select string_agg(ta.initial, ', ') from teacher_assignment ta where ta.course_id = cs.course_id), 'No Teacher') as teachers
    from courses_sections cs
    where cs.section like '_'
    and cs.course_id like 'CSE%'
    order by cs.course_id, cs.section
  `;
  const client = await connect();
  const results = await client.query(query);
  client.release();
  console.log(results.rows);
  return results.rows;
}
