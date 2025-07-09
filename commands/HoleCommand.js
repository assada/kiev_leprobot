const BaseCommand = require('./BaseCommand');
const request = require('request');

class HoleCommand extends BaseCommand {
    constructor() {
        super('hole', 'Показати дірку...', '/hole');
    }

    async execute(bot, msg, match) {
        const chatId = msg.chat.id;

        const errors = {
            fetchError: 'Помилка при завантаженні дірки 😢',
            sendError: 'Помилка при відправці дірки 😢',
            notFound: 'Дірка не знайдена 😢',
            processing: 'Помилка при обробці відповіді 😢'
        };

        bot.sendChatAction(chatId, 'upload_photo');
        
        setTimeout(function () {
            try {
                const photo = request('https://dead.guru/api/asshole/random/image');
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

module.exports = HoleCommand; 