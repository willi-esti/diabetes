import { NextFunction, Request, Response } from 'express';
import logger from '../utils/logger';

export function loggingMiddleware(
    req: Request,
    res: Response,
    next: NextFunction,
) {
    const start = process.hrtime();

    let requestMessage = `[RECEIVED] ${req.method} ${
        req.url
    }, header: ${JSON.stringify(req.headers)}, message: ${JSON.stringify(
        req.body,
    )}`;
    logger.info(requestMessage);

    const originalSend = res.send;
    let responseBody: any;

    res.send = (body) => {
        responseBody = body;
        return originalSend.call(res, body);
    };

    res.on('finish', () => {
        const duration = process.hrtime(start);
        const durationMs = (duration[0] * 1e3 + duration[1] / 1e6).toFixed(2);

        let responseMessage = `[SENT] ${req.method} ${req.url} ${
            res.statusCode
        }, time: ${durationMs}ms, header: ${JSON.stringify(res.getHeaders())}`;

        if (!responseBody) {
            responseMessage += `, body: [Empty response]`;
        } else if (JSON.stringify(responseBody).length < 1000) {
            responseMessage += `, body: ${JSON.stringify(responseBody)}`;
        } else {
            responseMessage += `, body: [Too large data]`;
        }

        if (res.statusCode >= 500) {
            logger.error(responseMessage);
        } else if (res.statusCode >= 400) {
            logger.warn(responseMessage);
        } else {
            logger.info(responseMessage);
        }
    });

    next();
}
