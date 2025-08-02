import { connect } from "../config/database.js";

export async function routineForLvl(lvlTerm) {
    const query = `
    SELECT 
        sa.course_id,
        sa.session,
        sa.batch,
        sa.section,
        sa.day,
        sa.time,
        sa.department,
        COALESCE(sa.room_no, lra.room) as room,
        s.level_term,
        c.type,
        t.initial,
        t.seniority_rank,
        sa.teachers
    FROM schedule_assignment sa
    JOIN sections s ON (sa.department = s.department AND sa.batch = s.batch AND sa.section = s.section)
    JOIN courses c ON (sa.course_id = c.course_id AND sa.session = c.session)
    LEFT JOIN LATERAL (
        SELECT t.initial, t.seniority_rank
        FROM unnest(sa.teachers) AS teacher_initial
        JOIN teachers t ON teacher_initial = t.initial
        ORDER BY t.seniority_rank ASC NULLS LAST
        LIMIT 1
    ) t ON true
    LEFT JOIN lab_room_assignment lra ON (sa.course_id = lra.course_id AND sa.session = lra.session AND sa.batch = lra.batch AND sa.section = lra.section)
    WHERE s.level_term = $1 
      AND sa.session = (SELECT value FROM configs WHERE key='CURRENT_SESSION')
    ORDER BY sa.section, sa.day, sa.time, sa.course_id, t.seniority_rank NULLS LAST
    `
    const values = [lvlTerm];
    const client = await connect();
    const results = await client.query(query, values);
    client.release();
    return results.rows;
}

export async function routineForTeacher(initial) {

    const query = `
    SELECT 
        sa.*,
        s.level_term,
        c.type,
        t.seniority_rank,
        COALESCE(sa.room_no, lra.room) as room
    FROM schedule_assignment sa
    JOIN sections s ON (sa.department = s.department AND sa.batch = s.batch AND sa.section = s.section)
    JOIN courses c ON (sa.course_id = c.course_id AND sa.session = c.session)
    LEFT JOIN teachers t ON t.initial = $1
    LEFT JOIN lab_room_assignment lra ON (sa.course_id = lra.course_id AND sa.session = lra.session AND sa.batch = lra.batch AND sa.section = lra.section)
    WHERE $1 = ANY(sa.teachers)
    AND sa.session = (SELECT value FROM configs WHERE key='CURRENT_SESSION')
    ORDER BY sa.day, sa.time, sa.course_id
    `

    const values = [initial];
    const client = await connect();
    const results = await client.query(query, values);
    client.release();
    return results.rows;
}

export async function routineForRoom(room) {

    const query = `
    SELECT 
        sa.*,
        s.level_term,
        c.type,
        t.initial,
        t.seniority_rank,
        COALESCE(sa.room_no, lra.room) as room
    FROM schedule_assignment sa
    JOIN sections s ON (sa.department = s.department AND sa.batch = s.batch AND sa.section = s.section)
    JOIN courses c ON (sa.course_id = c.course_id AND sa.session = c.session)
    LEFT JOIN LATERAL (
        SELECT t.initial, t.seniority_rank
        FROM unnest(sa.teachers) AS teacher_initial
        JOIN teachers t ON teacher_initial = t.initial
        ORDER BY t.seniority_rank ASC NULLS LAST
        LIMIT 1
    ) t ON true
    LEFT JOIN lab_room_assignment lra ON (sa.course_id = lra.course_id AND sa.session = lra.session AND sa.batch = lra.batch AND sa.section = lra.section)
    WHERE COALESCE(sa.room_no, lra.room) = $1
    AND sa.session = (SELECT value FROM configs WHERE key='CURRENT_SESSION')
    ORDER BY sa.day, sa.time, sa.course_id, t.seniority_rank NULLS LAST
    `

    const values = [room];
    const client = await connect();
    const results = await client.query(query, values);
    client.release();
    return results.rows;
}

export async function getInitials(){
    const query = `
        SELECT initial, seniority_rank
        FROM teachers
        WHERE active = 1
        ORDER BY seniority_rank ASC NULLS LAST;
        `
        const client = await connect();
        const results = await client.query(query);
        client.release();
        return results.rows
}

export async function getRooms(){
    const query = `
        SELECT room
        FROM rooms
        WHERE active = true;
        `
        const client = await connect();
        const results = await client.query(query);
        client.release();
        return results.rows
}

export async function getRoutine(type, key) {
    const query = `
    select url
    from routine_pdf
    where type = $1 and key = $2
    `
    const values = [type, key];
    const client = await connect();
    const results = await client.query(query, values);
    client.release();
    return results.rows[0];
}

export async function routineForDepartment(department) {
    const query = `
    SELECT 
        sa.*,
        s.level_term,
        c.type,
        c.name as course_name,
        COALESCE(sa.room_no, lra.room) as room,
        sa.teachers
    FROM schedule_assignment sa
    JOIN sections s ON (sa.department = s.department AND sa.batch = s.batch AND sa.section = s.section)
    JOIN courses c ON (sa.course_id = c.course_id AND sa.session = c.session)
    LEFT JOIN lab_room_assignment lra ON (sa.course_id = lra.course_id AND sa.session = lra.session AND sa.batch = lra.batch AND sa.section = lra.section)
    WHERE c."from" = $1
    AND sa.session = (SELECT value FROM configs WHERE key='CURRENT_SESSION')
    ORDER BY sa.day, sa.time, sa.course_id, sa.section
    `;

    const values = [department];
    const client = await connect();
    const results = await client.query(query, values);
    client.release();
    return results.rows;
}

export async function getDepartments() {
    const query = `
        SELECT DISTINCT department
        FROM hosted_departments
        ORDER BY department
    `;
    const client = await connect();
    const results = await client.query(query);
    client.release();
    return results.rows;
}

export async function saveRoutine(type, key, url) {
    const insertQuery = `
    insert into routine_pdf (type, key, url)
    values ($1, $2, $3)
    `
    const values = [type, key, url];
    const client = await connect();
    const results = await client.query(insertQuery, values);
    client.release();
    return results.rowCount > 0;
}

export async function getLevelTerms() {
    const query = `
        SELECT DISTINCT level_term
        FROM level_term_unique
        WHERE active = TRUE
    `
    const client = await connect();
    const results = await client.query(query);
    client.release();
    return results.rows;
}

export async function getCurrentSession() {
    const query = `
    SELECT value
    FROM configs
    WHERE key='CURRENT_SESSION'
    `;
    const client = await connect();
    const results = await client.query(query);
    client.release();
    return results.rows.length > 0 ? results.rows[0].value : 'January 2025';
}

export async function getSectionsByLevelTerm(level_term) {
    const query = `
    SELECT DISTINCT section
    FROM sections
    WHERE level_term = $1
    ORDER BY section
    `;
    const values = [level_term];
    
    const client = await connect();
    const results = await client.query(query, values);
    client.release();
    
    // Filter to only include main sections (A, B, C, etc.) and not subsections (A1, A2, etc.)
    const mainSections = results.rows.filter(row => {
        // Keep only sections that are single letters or have no digits
        const section = row.section;
        return section && (section.length === 1 || !/\d/.test(section));
    });
    
    return mainSections;
}