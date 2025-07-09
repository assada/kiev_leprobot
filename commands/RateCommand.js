const BaseCommand = require('./BaseCommand');
const request = require('request');

class RateCommand extends BaseCommand {
    constructor() {
        super('rate', 'Курс валют', '/rate');
    }

    async execute(bot, msg, match) {
        const chatId = msg.chat.id;

        bot.sendChatAction(chatId, 'typing');

        setTimeout(() => {
            request({
                url: 'https://dead.guru/api/rates',
                json: true
            }, function (error, response, body) {

                const message = 'Коротше, мінфін дані по баригам:\n' +
                    '<b>USD:</b> ' + body.bid + '/' + body.ask + '\n'
                    + '\n\n Приходьте за годину!'

                bot.sendMessage(chatId, message, {
                    parse_mode: 'HTML'
                });
            });
        }, 500);
    }
}

module.exports = RateCommand; 