import dotenv from 'dotenv'
dotenv.config()
import pkg from 'pg';
const { Pool } = pkg;

const pool = new Pool({
    connectionString: process.env.CONNECTION_URL,
    ssl: {
        rejectUnauthorized: false
    },
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 10000,
})

const connect = async (retries = 5, delay = 2000) => {
    for (let i = 0; i < retries; i++) {
        try {
            const client = await pool.connect();
            console.log(`Database connected successfully on attempt ${i + 1}`);
            return client;
        } catch (error) {
            console.log(`Database connection attempt ${i + 1} failed:`, error.message);
            if (i === retries - 1) {
                throw error;
            }
            console.log(`Retrying in ${delay}ms...`);
            await new Promise(resolve => setTimeout(resolve, delay));
        }
    }
}

export { connect }
