const logger = require('../../utils/logger');
const repositories = require('../../repositories');

class LeftChatParticipantHandler {
    constructor() {
        this.name = 'LeftChatParticipantHandler';
    }

    async execute(bot, msg) {
        const chatId = msg.chat.id;

        try {
            const deleted = await repositories.UserChatRepository.destroy(msg.from, msg.chat);
            
            if (deleted) {
                logger.info(`LeftChatParticipantHandler: User ${msg.from.id} (@${msg.from.username}) removed from chat ${chatId}`);
                bot.sendChatAction(chatId, 'typing');
                setTimeout(function () {
                    bot.sendMessage(chatId, 'Слабак!', {
                        reply_to_message_id: msg.message_id
                    });
                }, 2000);
            } else {
                logger.error(`LeftChatParticipantHandler: Failed to remove user ${msg.from.id} from UserChat`);
            }
        } catch (error) {
            logger.error('LeftChatParticipantHandler: Error removing user from UserChat:', {
                error: error.message,
                userId: msg.from.id,
                chatId: chatId
            });
        }
    }
}

module.exports = LeftChatParticipantHandler;