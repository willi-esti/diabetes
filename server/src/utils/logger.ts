import { createLogger, format, transports } from 'winston';
import 'winston-daily-rotate-file';

const { combine, timestamp, printf } = format;

const logFormat = printf(({ level, message, timestamp }) => {
    if (process.env.INSTANCE_ID) {
        return `${timestamp} [${process.env.INSTANCE_ID}] [${level}]: ${message}`;
    }
    return `${timestamp} [${level}]: ${message}`;
});

const logPath = process.env.LOG_PATH || 'logs';

const dailyRotateFileTransport = new transports.DailyRotateFile({
    filename: `${logPath}/application-%DATE%.log`,
    datePattern: 'YYYY-MM-DD',
    zippedArchive: true,
    maxSize: '100m',
    maxFiles: '30d',
});

const logger = createLogger({
    level: process.env.DEBUG_LEVEL || 'info',
    format: combine(timestamp(), logFormat),
    transports: [
        new transports.File({
            filename: `${logPath}/error.log`,
            level: 'error',
        }),
        new transports.File({ filename: `${logPath}/combined.log` }),
        dailyRotateFileTransport,
    ],
});

if (process.env.NODE_ENV !== 'prod') {
    logger.add(
        new transports.Console({
            format: combine(format.colorize(), logFormat),
        }),
    );
}

export default logger;
