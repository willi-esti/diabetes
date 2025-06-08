import { NextFunction, Request, Response } from 'express';

export function corsMiddleware(
    req: Request,
    res: Response,
    next: NextFunction,
): void {
    res.header('Access-Control-Allow-Origin', '*');
    res.header(
        'Access-Control-Allow-Headers',
        'Origin, X-Requested-With, Content-Type, Accept, Authorization',
    );
    if (req.method === 'OPTIONS') {
        res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
        res.status(200).json({});
        return;
    }
    next();
}
