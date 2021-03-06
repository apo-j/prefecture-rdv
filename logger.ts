import winston from 'winston';
import fs from 'fs';

const outputPath = '.';
try {
    fs.unlinkSync(`${outputPath}/error.log`);
    fs.unlinkSync(`${outputPath}/combined.log`);
    //file removed
} catch(err) {
    console.error(err);
}

const logger = winston.createLogger({
    level: 'info',
    format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json()
       ),
    defaultMeta: { service: 'user-service' },
    transports: [
        //
        // - Write all logs with level `error` and below to `error.log`
        // - Write all logs with level `info` and below to `combined.log`
        //
        new winston.transports.File({ filename: `${outputPath}/error.log`, level: 'error' }),
        new winston.transports.File({ filename: `${outputPath}/combined.log` }),
    ],
});
  
//
// If we're not in production then log to the `console` with the format:
// `${info.level}: ${info.message} JSON.stringify({ ...rest }) `
//
if (process.env.NODE_ENV !== 'production') {
    logger.add(new winston.transports.Console({
        format: winston.format.simple(),
    }));
}

export default logger;