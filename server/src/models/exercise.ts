import pool from '../config/db';
import { Exercise } from '../types/exercises';

export async function getAllExercises(): Promise<Exercise[]> {
    const result = await pool.query('SELECT * FROM exercise_library');
    return result.rows;
}

export async function getExercises(
    limit: number,
    offset: number,
): Promise<Exercise[]> {
    const query = `
        SELECT * FROM exercise_library
        ORDER BY created_at DESC
        LIMIT $1 OFFSET $2
    `;
    const { rows } = await pool.query(query, [limit, offset]);
    return rows;
}

export async function getExercisesCount(): Promise<number> {
    const query = 'SELECT COUNT(*) FROM exercise_library';
    const { rows } = await pool.query(query);
    return parseInt(rows[0].count, 10);
}
