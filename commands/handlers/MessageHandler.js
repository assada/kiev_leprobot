const logger = require('../../utils/logger');
const repositories = require('../../repositories');
const emojiStrip = require('emoji-strip');

class MessageHandler {
    constructor() {
        this.name = 'MessageHandler';
    }

    async execute(bot, msg) {
        const chatId = msg.chat.id;
        const user = msg.from;

        logger.info(`MessageHandler: User ${user.id} in chat ${chatId} sent: "${msg.text}"`);

        try {
            await repositories.UserRepository.store(user);

            if (chatId < 0) {
                await repositories.UserChatRepository.store(user, msg.chat);
            }

            if (typeof msg.text !== 'undefined' && emojiStrip(msg.text).length > 1 && msg.text.charAt(0) !== '/') {
                await repositories.MessageRepository.store(msg);
            } else {
                logger.info(`MessageHandler: Message ${msg.message_id} in chat ${chatId} is not a command`);
            }

            //TODO: store message in database
        } catch (error) {
            logger.error('Error in MessageHandler:', {
                error: error.message,
                stack: error.stack,
                chatId: chatId,
                userId: user.id,
                username: user.username,
                firstName: user.first_name,
                lastName: user.last_name,
                messageText: msg.text
            });
        }
    }
}

module.exports = MessageHandler;