const { connectDatabase } = require('./database/connection');
const BotService = require('./services/BotService');
const logger = require('./utils/logger');

class Application {
    constructor() {
        this.botService = null;
    }

    async initialize() {
        try {
            await connectDatabase();
            this.botService = new BotService();
            await this.botService.start();
            
            logger.info('Application started successfully');
        } catch (error) {
            logger.error('Failed to start application:', error);
            process.exit(1);
        }
    }

    async shutdown() {
        logger.info('Shutting down application...');
        if (this.botService) {
            this.botService.stop();
        }
    }
}

const app = new Application();

process.on('unhandledRejection', (reason, promise) => {
    logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

process.on('uncaughtException', (error) => {
    logger.error('Uncaught Exception:', error);
    process.exit(1);
});

app.initialize();
