const logger = require('../../utils/logger');
const repositories = require('../../repositories');

class LeftChatParticipantHandler {
    constructor() {
        this.name = 'LeftChatParticipantHandler';
    }

    async execute(bot, msg) {
        const chatId = msg.chat.id;

        if (repositories.UserChatRepository.destroy(msg.from, msg.chat)) {
            bot.sendChatAction(chatId, 'typing');
            setTimeout(function () {
                bot.sendMessage(chatId, 'Слабак!', {
                    reply_to_message_id: msg.message_id
                });
            }, 2000);
        } else {
            logger.error('Error removing row from UserChat');
        }

        logger.info(`LeftChatParticipantHandler: User ${msg.from.id} (@${msg.from.username}) left chat ${chatId}`);
    }
}

module.exports = LeftChatParticipantHandler;