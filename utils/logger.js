const winston = require('winston');
const config = require('../config/config');

const logger = winston.createLogger({
    level: config.app.logLevel,
    format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.errors({ stack: true }),
        winston.format.colorize(),
        winston.format.simple()
    ),
    defaultMeta: { service: 'leprobot' },
    transports: [
        new winston.transports.Console()
    ]
});

module.exports = logger; 