const dotenv = require('dotenv');

dotenv.config();

const config = {
    bot: {
        token: process.env.BOT_TOKEN,
        webhook: {
            port: process.env.PORT || 3000,
            host: process.env.HOST || 'localhost'
        }
    },
    database: {
        host: process.env.DB_HOST || 'localhost',
        port: process.env.DB_PORT || 3306,
        database: process.env.DB_NAME || 'leprobot',
        username: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
        dialect: 'mysql',
        dialectOptions: {
            charset: 'UTF8MB4_GENERAL_CI',
        },
        logging: process.env.NODE_ENV === 'development',
        pool: {
            max: 5,
            min: 0,
            acquire: 30000,
            idle: 10000
        }
    },
    app: {
        env: process.env.NODE_ENV || 'development',
        logLevel: process.env.LOG_LEVEL || 'info'
    }
};

module.exports = config; 