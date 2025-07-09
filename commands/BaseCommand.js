const logger = require('../utils/logger');

class BaseCommand {
    constructor(name, description, usage) {
        this.name = name;
        this.description = description;
        this.usage = usage;
        this.middlewares = [];
    }

    addMiddleware(middleware) {
        this.middlewares.push(middleware);
    }

    async handle(bot, msg, match) {
        try {
            for (const middleware of this.middlewares) {
                await middleware(msg);
            }
            
            await this.execute(bot, msg, match);
        } catch (error) {
            logger.error(`Error in command ${this.name}:`, error);
            await bot.sendMessage(msg.chat.id, 'Сталася помилка при виконанні команди');
        }
    }

    async execute(bot, msg, match) {
        throw new Error('Execute method must be implemented');
    }
}

module.exports = BaseCommand; 