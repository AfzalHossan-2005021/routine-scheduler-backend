import { connect } from "../../config/database.js";
import { HttpError } from "../../config/error-handle.js";

export async function getAll(){
    const query = `
        SELECT 
            ltu.department, 
            ltu.level_term, 
            ltu.active,
            ltu.batch,
            COALESCE(COUNT(s.section), 0) AS section_count
        FROM 
            level_term_unique ltu
        LEFT JOIN 
            sections s ON ltu.department = s.department 
                    AND ltu.level_term = s.level_term
                    AND s.type = 0
        GROUP BY 
            ltu.department, 
            ltu.level_term
        ORDER BY 
            ltu.department, 
            ltu.level_term;
    `;
    const client = await connect();
    const result = await client.query(query);
    const level_terms = result.rows;
    // console.log(level_terms);
    client.release();
    return level_terms;
}

export async function updateLevelTerms(levelTerms) {
    const query = `
        UPDATE level_term_unique
        SET 
            active = $1,
            batch = $2
        WHERE 
            level_term = $3 AND department = $4;
    `;

    const client = await connect();

    try {
        await client.query("BEGIN"); 

        const promises = levelTerms.map(levelTerm => {
            const values = [levelTerm.active, parseInt(levelTerm.batch), levelTerm.level_term, levelTerm.department];
            return client.query(query, values);
        });

        await Promise.all(promises); 

        await client.query("COMMIT"); 
    } catch (error) {
        await client.query("ROLLBACK"); 
        throw error;
    } finally {
        client.release();
    }
}


async function clearTables(){
    const query = `
        truncate schedule_assignment, teacher_sessional_assignment, courses_sections, sections, teacher_assignment, courses, lab_room_assignment, forms;
    `;
    const client = await connect();

    try {
        await client.query("BEGIN");

        await client.query(query);

        await client.query("COMMIT");
    } catch (error) {
        await client.query("ROLLBACK");
        throw error;
    } finally {
        client.release();
    }
}

export async function getSession(){
    const query = `
        SELECT value
        FROM configs
        WHERE key = 'CURRENT_SESSION';
    `
    const client = await connect();
    const result = await client.query(query);
    client.release();
    return result.rows[0].value;
}

async function initializeSectionsTable(levelTerms, session){
    const activeLevelTerms = levelTerms.filter((levelTerm) => levelTerm.active);
    const client = await connect();
    try {
        await client.query("BEGIN");
        for (const levelTerm of activeLevelTerms){
            for(let i = 0; i < parseInt(levelTerm.section_count); i++){
                const section = String.fromCharCode(65 + i);
                const query = `
                    INSERT INTO sections (batch, section, "type", session, level_term, department) VALUES ($1, $2, $3,$4, $5, $6);
                `;
                const values = [parseInt(levelTerm.batch), section, 0, session, levelTerm.level_term, levelTerm.department];
                const values1 = [parseInt(levelTerm.batch), `${section}1`, 1, session, levelTerm.level_term, levelTerm.department];
                const values2 = [parseInt(levelTerm.batch), `${section}2`, 1, session, levelTerm.level_term, levelTerm.department];
    
                await client.query(query, values);
                await client.query(query, values1);
                await client.query(query, values2);
            }
        }
        await client.query("COMMIT");
    } catch (error) {
        await client.query("ROLLBACK");
        throw error;
    } finally {
        client.release();
    }
    
}

async function getAllActiveCourses(levelTerms, session){
    const activeLevelTerms = levelTerms.filter((levelTerm) => levelTerm.active);
    const query = `
        select ac.*
        from level_term_unique ltu
        join all_courses ac
        on ac.level_term = ltu.level_term and ac."to" = ltu.department
        where ltu.level_term = $1 and ltu.department = $2;
    `;
    const client = await connect();
    let activeCourses = [];
    for(const levelTerm of activeLevelTerms){
        const values = [levelTerm.level_term, levelTerm.department];
        const result = await client.query(query, values);
        const courses = result.rows.map((c) => {
            return {
                ...c,
                session: session,
                teacher_credit: c.class_per_week * levelTerm.section_count
            }
        });
        activeCourses = activeCourses.concat(courses);
    }
    client.release();
    return activeCourses;
}

async function initializeCoursesTable(activeCourses){
    const query = `
        INSERT INTO courses (course_id, session, "name", "type", class_per_week, "from", "to", teacher_credit, level_term) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9);
    `;
    const client = await connect();
    try {
        await client.query("BEGIN");
        for(const course of activeCourses){
            const values = [course.course_id, course.session, course.name, course.type, course.class_per_week, course.from, course.to, course.teacher_credit, course.level_term];
            await client.query(query, values);
        }
        await client.query("COMMIT");
    } catch (error) {
        await client.query("ROLLBACK");
        throw error;
    } finally {
        client.release();
    }
}

async function initializeCoursesSectionsTable(){
    const query = `
        INSERT INTO courses_sections (course_id, session, batch, section, room_no, department)
        SELECT c.course_id, c.session, s.batch, s.section, s.room, s.department
        FROM courses c
        JOIN sections s 
        ON c.level_term = s.level_term AND c.type = s.type AND c."to" = s.department;
    `;
    const client = await connect();
    try {
        await client.query("BEGIN");
        await client.query(query);
        await client.query("COMMIT");
    } catch (error) {
        await client.query("ROLLBACK");
        throw error;
    } finally {
        client.release();
    }
}

export async function initiateDB(levelTerms){
    await clearTables();
    console.log("Database tables cleared");

    const session = await getSession();
    console.log("Fetched current session: " + session);

    await initializeSectionsTable(levelTerms, session);
    console.log("Sections table initialized");

    const activeCourses = await getAllActiveCourses(levelTerms, session);
    console.log("Fetched all active courses");

    await initializeCoursesTable(activeCourses);
    console.log("Courses table initialized");
    
    await initializeCoursesSectionsTable();
    console.log("Courses_Sections table initialized");
    
}
