const BaseCommand = require('./BaseCommand');
const request = require('request');

class CatCommand extends BaseCommand {
    constructor() {
        super('cat', 'Показати котика...', '/cat');
    }

    async execute(bot, msg, match) {
        const chatId = msg.chat.id;

        const errors = {
            fetchError: 'Помилка при завантаженні котика 😢',
            sendError: 'Помилка при відправці котика 😢',
            notFound: 'Котик не знайдений 😢',
            processing: 'Помилка при обробці котика 😢'
        };

        const catPhrases = [
            'Ось тобі котя!',
            'Тримай котю',
            'Котя - топчик',
            'ДИВИСЬ ЯКИЙ КЛАСНИЙ!',
            'Всім котю!',
            ':3',
            'Ой! Який мілаш!',
            'Котики, точно кращі!'
        ];

        bot.sendChatAction(chatId, 'upload_photo');
        
        setTimeout(function () {
            request.get('http://thecatapi.com/api/images/get?format=src', function (err, res, body) {
                if (err) {
                    console.error('Error fetching cat photo:', err);
                    bot.sendMessage(chatId, errors.fetchError);
                    return;
                }

                try {
                    const photoUrl = this.uri.href;
                    if (!photoUrl) {
                        bot.sendMessage(chatId, errors.notFound);
                        return;
                    }

                    const photo = request(photoUrl);
                    const randomCaption = catPhrases[Math.floor(Math.random() * catPhrases.length)];
                    
                    if (photoUrl.indexOf('.gif') !== -1) {
                        bot.sendDocument(chatId, photo, {
                            caption: randomCaption
                        }).catch(error => {
                            console.error('Error sending cat GIF:', error);
                            bot.sendMessage(chatId, errors.sendError);
                        });
                    } else {
                        bot.sendPhoto(chatId, photo, {
                            caption: randomCaption
                        }).catch(error => {
                            console.error('Error sending cat photo:', error);
                            bot.sendMessage(chatId, errors.sendError);
                        });
                    }
                } catch (error) {
                    console.error('Error processing cat response:', error);
                    bot.sendMessage(chatId, errors.processing);
                }
            });
        }, 500);
    }
}

module.exports = CatCommand; 