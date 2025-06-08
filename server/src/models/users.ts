import bcrypt from 'bcrypt';
import pool from '../config/db';

export interface User {
    id: number;
    username: string;
    email: string;
    password_hash: string;
    created_at: string;
    updated_at: string;
}

export async function findUserByEmail(email: string): Promise<User | null> {
    const { rows } = await pool.query('SELECT * FROM users WHERE email = $1', [
        email,
    ]);
    return rows[0] || null;
}

export async function findUserById(id: number): Promise<User | null> {
    const { rows } = await pool.query('SELECT * FROM users WHERE id = $1', [
        id,
    ]);
    return rows[0] || null;
}

export async function createUser(
    username: string,
    email: string,
    password: string,
): Promise<User> {
    const password_hash = await bcrypt.hash(password, 10);
    const { rows } = await pool.query(
        'INSERT INTO users (username, email, password_hash) VALUES ($1, $2, $3) RETURNING *',
        [username, email, password_hash],
    );
    return rows[0];
}

export async function validatePassword(
    email: string,
    password: string,
): Promise<User | null> {
    const user = await findUserByEmail(email);
    if (!user) return null;
    const valid = await bcrypt.compare(password, user.password_hash);
    return valid ? user : null;
}
