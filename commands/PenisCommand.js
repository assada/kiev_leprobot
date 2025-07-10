const BaseCommand = require('./BaseCommand');
const request = require('request');

class PenisCommand extends BaseCommand {
    constructor() {
        super('penis', 'Показати член...', '/penis');
    }

    async execute(bot, msg, match) {
        const chatId = msg.chat.id;

        const errors = {
            fetchError: 'Помилка при завантаженні прутня 😢',
            sendError: 'Помилка при відправці прутня 😢',
            notFound: 'Прутень не знайдений 😢',
            processing: 'Помилка при обробці відповіді 😢'
        };

        bot.sendChatAction(chatId, 'upload_photo');
        
        setTimeout(function () {
            try {
                const photo = request('https://dead.guru/api/penis/random/image');
                bot.sendPhoto(chatId, photo, {
                    reply_to_message_id: msg.message_id
                }).catch(error => {
                    console.error('Error sending photo:', error);
                    bot.sendMessage(chatId, errors.sendError);
                });
            } catch (error) {
                console.error('Error fetching photo:', error);
                bot.sendMessage(chatId, errors.fetchError);
            }
        }, 500);
    }
}

module.exports = PenisCommand; 