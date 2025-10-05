const logger = require('../utils/logger');
const repositories = require('../repositories');

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
            const chatId = msg.chat.id;
            const user = msg.from;

            if (chatId < 0) {
                await repositories.UserChatRepository.store(user, msg.chat);
            }

            await repositories.UserRepository.store(user);

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