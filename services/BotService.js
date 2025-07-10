const TelegramBot = require('node-telegram-bot-api');
const config = require('../config/config');
const logger = require('../utils/logger');
const CommandRouter = require('../routes/CommandRouter');

class BotService {
    constructor() {
        this.bot = null;
        this.router = new CommandRouter();
    }

    async initialize() {
        if (!config.bot.token) {
            throw new Error('Bot token not found in configuration');
        }

        this.bot = new TelegramBot(config.bot.token, { polling: true });
        
        this.setupErrorHandling();
        await this.router.setupRoutes(this.bot);
        
        logger.info('Bot service initialized successfully');
    }

    setupErrorHandling() {
        this.bot.on('polling_error', (error) => {
            logger.error('Polling error:', error);
        });

        this.bot.on('error', (error) => {
            logger.error('Bot error:', error);
        });

        process.on('SIGINT', () => {
            logger.info('Received SIGINT, stopping bot...');
            this.stop();
        });

        process.on('SIGTERM', () => {
            logger.info('Received SIGTERM, stopping bot...');
            this.stop();
        });
    }

    async start() {
        try {
            await this.initialize();
            
            const botInfo = await this.bot.getMe();
            logger.info(`Bot started: @${botInfo.username}`);
            
            return this.bot;
        } catch (error) {
            logger.error('Failed to start bot:', error);
            throw error;
        }
    }

    stop() {
        if (this.bot) {
            this.bot.stopPolling();
            logger.info('Bot stopped');
        }
        process.exit(0);
    }

    getBot() {
        return this.bot;
    }
}

module.exports = BotService; 