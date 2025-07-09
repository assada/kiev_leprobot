const BaseCommand = require('./BaseCommand');
const repositories = require('../repositories');
const { sequelize } = require('../database/connection');

class TopCommand extends BaseCommand {
    constructor() {
        super('top', 'Топ користувачів', '/top');
    }

    async execute(bot, msg, match) {
        const chatId = msg.chat.id;

        const errorsMessages = {
            onlyForChats: 'Ця команда доступна лише в групових чатах'
        };

        if (chatId > 0) {
            bot.sendMessage(chatId, errorsMessages.onlyForChats);
            return false;
        }
        bot.sendChatAction(chatId, 'typing');
        repositories.MessageRepository.top(sequelize, chatId).then(function (res) {
            bot.sendMessage(chatId, res, {
                parse_mode: 'HTML'
            });
        });
    }
}

module.exports = TopCommand; 