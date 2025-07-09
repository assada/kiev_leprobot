const BaseCommand = require('./BaseCommand');
const request = require('request');

class BoobsCommand extends BaseCommand {
    constructor() {
        super('boobs', 'Показати цицю...', '/boobs');
    }

    async execute(bot, msg, match) {
        const chatId = msg.chat.id;

        const errors = {
            fetchError: 'Помилка при завантаженні фото 😢',
            sendError: 'Помилка при відправці фото 😢',
            notFound: 'Фото не знайдено 😢',
            processing: 'Помилка при обробці відповіді 😢'
        };

        bot.sendChatAction(chatId, 'upload_photo');
        
        setTimeout(function () {
            request.get('http://api.oboobs.ru/boobs/0/1/random', function (err, res, body) {
                if (err) {
                    console.error('Error fetching photo:', err);
                    bot.sendMessage(chatId, errors.fetchError);
                    return;
                }

                try {
                    let json = JSON.parse(body);
                    if (!json || !json[0] || !json[0].preview) {
                        bot.sendMessage(chatId, errors.notFound);
                        return;
                    }

                    let photoLink = 'http://media.oboobs.ru/' + json[0].preview;
                    const photo = request(photoLink);
                    bot.sendPhoto(chatId, photo, {
                        caption: json[0].model || 'Фото'
                    }).catch(error => {
                        console.error('Error sending photo:', error);
                        bot.sendMessage(chatId, errors.sendError);
                    });
                } catch (parseError) {
                    console.error('Error parsing response:', parseError);
                    bot.sendMessage(chatId, errors.processing);
                }
            });
        }, 500);
    }
}

module.exports = BoobsCommand; 