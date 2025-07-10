// https://api.rule34.xxx/index.php?page=dapi&s=post&q=index&json=1

const BaseCommand = require('./BaseCommand');
const request = require('request');

class Rule34Command extends BaseCommand {
    constructor() {
        super('rule34', 'Показати цицю...', '/rule34');
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
            request.get('https://api.rule34.xxx/index.php?page=dapi&s=post&q=index&json=1&tags=nazi', function (err, res, body) {
                if (err) {
                    console.error('Error fetching photo:', err);
                    bot.sendMessage(chatId, errors.fetchError);
                    return;
                }

                try {
                    let json = JSON.parse(body);
                    if (!json || !Array.isArray(json) || json.length === 0) {
                        bot.sendMessage(chatId, errors.notFound);
                        return;
                    }

                    const randomIndex = Math.floor(Math.random() * json.length);
                    const randomPhoto = json[randomIndex];

                    if (!randomPhoto.file_url) {
                        bot.sendMessage(chatId, errors.notFound);
                        return;
                    }

                    const photo = request(randomPhoto.file_url);
                    
                    let caption = '';
                    if (randomPhoto.tags) {
                        const tags = randomPhoto.tags.split(' ').slice(0, 7);
                        caption = `#${tags.join(' #')}`;
                    }

                    bot.sendPhoto(chatId, photo, {
                        caption: caption || 'Фото'
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

module.exports = Rule34Command; 