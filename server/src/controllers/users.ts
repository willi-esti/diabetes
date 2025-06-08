import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import {
    createUser,
    findUserByEmail,
    findUserById,
    validatePassword,
} from '../models/users';
import logger from '../utils/logger';

const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET || 'access_secret';
const REFRESH_TOKEN_SECRET =
    process.env.REFRESH_TOKEN_SECRET || 'refresh_secret';
const ACCESS_TOKEN_EXPIRES_IN = '15m';
const REFRESH_TOKEN_EXPIRES_IN = '7d';

const refreshTokens: string[] = [];

function generateAccessToken(user: { id: number; email: string }) {
    return jwt.sign(
        { userId: user.id, email: user.email },
        ACCESS_TOKEN_SECRET,
        { expiresIn: ACCESS_TOKEN_EXPIRES_IN },
    );
}

function generateRefreshToken(user: { id: number; email: string }) {
    return jwt.sign(
        { userId: user.id, email: user.email },
        REFRESH_TOKEN_SECRET,
        { expiresIn: REFRESH_TOKEN_EXPIRES_IN },
    );
}

export class AuthController {
    async register(req: Request, res: Response) {
        try {
            const { username, email, password } = req.body;
            if (!username || !email || !password) {
                return res
                    .status(400)
                    .json({ error: 'All fields are required' });
            }
            const existing = await findUserByEmail(email);
            if (existing) {
                return res
                    .status(409)
                    .json({ error: 'Email already registered' });
            }
            const user = await createUser(username, email, password);
            res.status(201).json({
                id: user.id,
                username: user.username,
                email: user.email,
            });
        } catch (error) {
            logger.error('Register error', error);
            res.status(500).json({ error: 'Registration failed' });
        }
    }

    async login(req: Request, res: Response) {
        try {
            const { email, password } = req.body;
            if (!email || !password) {
                return res
                    .status(400)
                    .json({ error: 'Email and password required' });
            }
            const user = await validatePassword(email, password);
            if (!user) {
                return res.status(401).json({ error: 'Invalid credentials' });
            }
            const accessToken = generateAccessToken(user);
            const refreshToken = generateRefreshToken(user);
            refreshTokens.push(refreshToken);
            res.json({ accessToken, refreshToken });
        } catch (error) {
            logger.error('Login error', error);
            res.status(500).json({ error: 'Login failed' });
        }
    }

    async refreshToken(req: Request, res: Response) {
        const { refreshToken } = req.body;
        if (!refreshToken)
            return res.status(400).json({ error: 'Refresh token required' });
        if (!refreshTokens.includes(refreshToken))
            return res.status(403).json({ error: 'Invalid refresh token' });
        try {
            const payload = jwt.verify(
                refreshToken,
                REFRESH_TOKEN_SECRET,
            ) as any;
            const user = await findUserById(payload.userId);
            if (!user) return res.status(404).json({ error: 'User not found' });
            const newAccessToken = generateAccessToken(user);
            res.json({ accessToken: newAccessToken });
        } catch (error) {
            logger.error('Refresh token error', error);
            res.status(403).json({ error: 'Invalid refresh token' });
        }
    }

    async logout(req: Request, res: Response) {
        const { refreshToken } = req.body;
        const idx = refreshTokens.indexOf(refreshToken);
        if (idx > -1) refreshTokens.splice(idx, 1);
        res.json({ message: 'Logged out' });
    }
}
