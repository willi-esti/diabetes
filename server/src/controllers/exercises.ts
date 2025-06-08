import { Request, Response } from 'express';
import { getExercises, getExercisesCount } from '../models/exercise';
import logger from '../utils/logger';

export class ExercisesController {
    async getPaginatedExercises(req: Request, res: Response) {
        try {
            const limit = Math.max(
                1,
                Math.min(parseInt(req.query.limit as string) || 20, 100),
            );
            const page = Math.max(1, parseInt(req.query.page as string) || 1);
            const offset = (page - 1) * limit;

            const [exercises, total] = await Promise.all([
                getExercises(limit, offset),
                getExercisesCount(),
            ]);

            res.json({
                data: exercises,
                pagination: {
                    total,
                    page,
                    limit,
                    totalPages: Math.ceil(total / limit),
                },
            });
        } catch (error) {
            logger.error(
                `Failed to fetch exercises: ${
                    error instanceof Error ? error.message : 'Unknown error'
                }`,
            );
            res.status(500).json({ error: 'Failed to fetch exercises' });
        }
    }
}
