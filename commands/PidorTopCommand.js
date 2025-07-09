const BaseCommand = require('./BaseCommand');
const repositories = require('../repositories');
const { sequelize } = require('../database/connection');
const { htmlEntities } = require('../utils/utils');

const errorsMessages = {
    onlyForChats: 'Ця команда працює тільки в чатах!'
};

class PidorTopCommand extends BaseCommand {
    constructor() {
        super('pidor_top', 'Топ підорів', '/pidor_top');
    }

    async execute(bot, msg, match) {
        const chatId = msg.chat.id;

        if (chatId > 0) {
            bot.sendMessage(chatId, errorsMessages.onlyForChats);
            return false;
        }
        bot.sendChatAction(chatId, 'typing');

        repositories.PidorRepository.top(sequelize, chatId).then(function (res) {
            if (res.length < 1) {
                bot.sendMessage(chatId, '_У вас всі не підори... Поки що..._', {
                    parse_mode: 'Markdown'
                });
    
                return false;
            }
            let message = 'Наші <b>мжвячні</b> підорочки: \n\n';
            let i = 1;
            res.forEach(function (pidor) {
                message += i + ') ' + (pidor.username !== '' ? pidor.username : '');
                message += ' <i>(' + htmlEntities(pidor.first_name) + ')' + '</i> - <b>' + pidor.c + '</b>\n';
                i++;
            });
            console.log(message);
            setTimeout(function () {
                bot.sendMessage(chatId, message.replace(/\n$/, ""), {
                    parse_mode: 'HTML'
                });
            }, 1500);
        }).catch(function (err) {
            logger.error('PidorTopCommand: Error in execute:', err);
        });
    }
}

module.exports = PidorTopCommand; 