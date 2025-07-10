import e from "express";
import { connect } from "../config/database.js";

export async function getSectionCountDB(batch, department) {
    const query = `
        SELECT section_count, subsection_count_per_section
        FROM section_count
        WHERE batch = $1 AND department = $2
    `;
    const values = [batch, department];

    const client = await connect();
    const result = await client.query(query, values);
    client.release();
    return result.rows[0];
}

export async function getAllSectionCountDB() {
    const query = `
        SELECT department, batch, section_count, subsection_count_per_section
        FROM section_count
        ORDER BY department, batch
    `;
    const client = await connect();
    const result = await client.query(query);
    client.release();
    return result.rows;
}

export async function setSectionCountDB(batch, department, section_count, subsection_count_per_section) {
    const query = `
        INSERT INTO section_count (batch, department, section_count, subsection_count_per_section)
        VALUES ($1, $2, $3, $4)
        ON CONFLICT (batch, department) DO UPDATE SET 
            section_count = excluded.section_count,
            subsection_count_per_section = excluded.subsection_count_per_section
    `;
    const values = [batch, department, section_count, subsection_count_per_section];

    const client = await connect();
    const result = await client.query(query, values);
    client.release();
    return result.rowCount > 0;
}

export async function deleteSectionCountDB(batch, department) {
    const query = `
        DELETE FROM section_count
        WHERE batch = $1 AND department = $2
    `;
    const values = [batch, department];

    const client = await connect();
    const result = await client.query(query, values);
    client.release();
    return result.rowCount > 0;
}

export async function getDefaultSectionCountDB(department) {
    const query = `
        SELECT section_count, subsection_count_per_section
        FROM default_section_count
        WHERE department = $1
    `;
    const values = [department];

    const client = await connect();
    const result = await client.query(query, values);
    client.release();
    return result.rows[0];
}

export async function getDefaultAllSectionCountDB() {
    const query = `
        SELECT *
        FROM default_section_count
        ORDER BY department
    `;
    const client = await connect();
    const result = await client.query(query);
    client.release();
    return result.rows;
}

export async function setDefaultSectionCountDB(department, section_count, subsection_count_per_section) {
    const query = `
        INSERT INTO default_section_count (department, section_count, subsection_count_per_section)
        VALUES ($1, $2, $3)
        ON CONFLICT (department) DO UPDATE SET 
            section_count = excluded.section_count,
            subsection_count_per_section = excluded.subsection_count_per_section
    `;
    const values = [department, section_count, subsection_count_per_section];

    const client = await connect();
    const result = await client.query(query, values);
    client.release();
    return result.rowCount > 0;
}

export async function deleteDefaultSectionCountDB(department) {
    const query = `
        DELETE FROM default_section_count
        WHERE department = $1
    `;
    const values = [department];

    const client = await connect();
    const result = await client.query(query, values);
    client.release();
    return result.rowCount > 0;
}

export async function getBatchesDB() {
    const query = `
        SELECT DISTINCT batch
        FROM section_count
        ORDER BY batch
    `;

    const client = await connect();
    const result = await client.query(query);
    client.release();
    return result.rows.map(row => row.batch);
}

export async function addBatchDB(batch) {
    const query = `
        INSERT INTO section_count (batch, department, section_count, subsection_count_per_section)
        SELECT $1, department, section_count, subsection_count_per_section 
        FROM default_section_count 
        ON CONFLICT (batch, department) DO UPDATE SET
            section_count = excluded.section_count,
            subsection_count_per_section = excluded.subsection_count_per_section
    `;
    const values = [batch];

    const client = await connect();
    const result = await client.query(query, values);
    client.release();
    return result.rowCount > 0;
}

export async function deleteBatchDB(batch) {
    const query = `
        DELETE FROM section_count
        WHERE batch = $1
    `;
    const values = [batch];

    const client = await connect();
    const result = await client.query(query, values);
    client.release();
    return result.rowCount > 0;
}