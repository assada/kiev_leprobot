const { Sequelize } = require('sequelize');
const config = require('../config/config');
const logger = require('../utils/logger');

const sequelize = new Sequelize(config.database);

const connectDatabase = async () => {
    try {
        await sequelize.authenticate();
        logger.info('Database connection established successfully');
        
        await sequelize.sync({ force: false });
        logger.info('Database synchronized successfully');
    } catch (error) {
        logger.error('Unable to connect to database:', error);
        process.exit(1);
    }
};

module.exports = { sequelize, connectDatabase }; 