const Sequelize = require("sequelize");
const env = require('dotenv').config();
const Random = require("random-js");
const TelegramBot = require('node-telegram-bot-api');
const winston = require('winston');
const request = require('request');
const emojiStrip = require('emoji-strip');
const http = require('http');
const db = new Sequelize(process.env.MYSQL_DATABASE, process.env.MYSQL_USER, process.env.MYSQL_PASSWORD, {
    host: process.env.MYSQL_HOST,
    dialect: 'mysql', logging: false
});
const bot = new TelegramBot(process.env.TOKEN, {polling: true});
const randomizer = new Random(Random.engines.mt19937().seed('fsdfbk' + Math.random()));

//Model
const Message = require("./Model/Message");
const MessageModel = new Message(db);

const User = require("./Model/User");
const UserModel = new User(db);

const Pidor = require("./Model/Pidor");
const PidorModel = new Pidor(db);

const UserChat = require("./Model/UserChat");
const UserChatModel = new UserChat(db);

//Repository
const MRepository = require("./Repository/MessageRepository");
const MessageRepository = new MRepository(MessageModel);
const URepository = require("./Repository/UserRepository");
const UserRepository = new URepository(UserModel);
const PRepository = require("./Repository/PidorRepository");
const PidorRepository = new PRepository(PidorModel, User);
const UCRepository = require("./Repository/UserChatRepository");
const UserChatRepository = new UCRepository(UserChatModel);


//Generators
const MessageGenerator = require("./Generator/MessageGenerator");
const PGenerator = require("./Generator/PidorGenerator");
const ImageGenerator = require("./Generator/ImageGenerator");
const PidorGenerator = new PGenerator(PidorRepository, UserChatRepository);


//Strings
const catP = [
    "Вот тебе котя!",
    "Держи котю",
    "Котя - топчик",
    "СМОТРИ КАКОЙ ЗАБАВНЫЙ!",
    "Всем котю!",
    ":3"
];
const names = [
    "антон",
    "Антон",
    "антоха",
    "Антоха",
    "Тох ",
    "тох ",
    "тоха ",
    "Тоха ",
    "антонио",
    "Антонио",
];
const pidorLoading = [
    'Вызываю бога пидоров...',
    'Запускаю пидор-машину...',
    'Пидорок, приди... Я призываю тебя!',
    'Сча пидора рожу!',
    'Где-же он, наш пидор?'
];

bot.on('message', (msg) => {
    const chat = msg.chat.id;
    winston.info(chat);
    UserRepository.store(msg.from);
    if (chat < 0) {
        UserChatRepository.store(msg.from, msg.chat);
    }
    if (typeof msg.text !== 'undefined' && emojiStrip(msg.text).length > 1 && msg.text.charAt(0) !== '/') {
        let mention = new RegExp(names.join("|")).test(msg.text);
        let chance = randomizer.bool(0.1);
        MessageRepository.store(msg, names);
        if ((chance || mention) && chat !== -1001048609359) {
            bot.sendChatAction(chat, 'typing');
            (new MessageGenerator(MessageModel, msg)).get(names).then(function (res) {
                winston.info(res);
                if (res !== false && res.length > 0) {
                    let options = {};
                    if (mention) {
                        options = {
                            reply_to_message_id: msg.message_id
                        };
                    }
                    setTimeout(function () {
                        bot.sendMessage(chat, res, options);
                    }, 2000);
                }
            });
        }
    }
});

bot.onText(/\/boobs/, (msg, match) => {
    bot.sendChatAction(msg.chat.id, 'upload_photo');
    setTimeout(function () {
        request.get('http://api.oboobs.ru/boobs/0/1/random', function (err, res, body) {
            let json = JSON.parse(body);
            let photoLink = 'http://media.oboobs.ru/' + json[0].preview;
            const photo = request(photoLink);
            const chatId = msg.chat.id;
            bot.sendPhoto(chatId, photo, {
                caption: json[0].model
            });
        });
    }, 500);
});

bot.onText(/\/cat/, (msg, match) => {
    bot.sendChatAction(msg.chat.id, 'upload_photo');
    setTimeout(function () {
        request.get('http://thecatapi.com/api/images/get?format=src', function (err, res, body) {
            const photo = request(this.uri.href);
            const chatId = msg.chat.id;
            bot.sendPhoto(chatId, photo, {
                caption: catP[Math.floor(Math.random() * catP.length)]
            });
        });
    }, 500);
});

bot.onText(/\/top/, (msg, match) => {
    if (msg.chat.id > 0) {
        bot.sendMessage(msg.chat.id, "Не-не. Только в чатиках топчик работает");
        return false;
    }
    bot.sendChatAction(msg.chat.id, 'typing');
    MessageRepository.top(db, msg.chat.id).then(function (res) {
        bot.sendMessage(msg.chat.id, res, {
            parse_mode: 'HTML'
        });
    });
});

bot.onText(/\/img (.+)/, (msg, match) => {
    bot.sendChatAction(msg.chat.id, 'upload_photo');
    setTimeout(function () {
        ImageGenerator(match[1] || 'Трактор').then(function (url) {
            request.get(url, function (err, res, body) {
                const photo = request(this.uri.href);
                const chatId = msg.chat.id;
                bot.sendPhoto(chatId, photo, {
                    reply_to_message_id: msg.message_id
                });
            });
        });
    }, 500);
});

bot.onText(/\/pidor_top/, (msg, match) => {
    if (msg.chat.id > 0) {
        bot.sendMessage(msg.chat.id, "Не-не. Только в чатиках топчик работает");
        return false;
    }
    bot.sendChatAction(msg.chat.id, 'typing');

    PidorRepository.top(db, msg.chat.id).then(function (results) {
        if (results < 1) {
            bot.sendMessage(msg.chat.id, '_У вас все не пидоры... Пока.._', {
                parse_mode: 'Markdown'
            });
        }

        let message = 'Наши <b>лучшие</b> пидоры: \n\n';
        let i = 1;
        results.forEach(function (pidor) {
            message += i + ') <i>' + pidor.username + '</i> - <b>' + pidor.c + '</b>\n';
            i++;
        });
        setTimeout(function () {
            console.log(message.replace(/\n$/, ""));
            bot.sendMessage(msg.chat.id, message.replace(/\n$/, ""), {
                parse_mode: 'HTML'
            });
        }, 1500);
    })

});

bot.onText(/\/new_pidor/, (msg, match) => {
    if (msg.chat.id > 0) {
        bot.sendMessage(msg.chat.id, "Не-не. Только в чатиках топчик работает");
        return false;
    }
    bot.sendChatAction(msg.chat.id, 'typing');
    getPidor(msg.chat.id);
});

http.createServer(function (req, response) {
    winston.info(req.connection.remoteAddress);
    if (req.url.indexOf('favicon') > -1 || req.connection.remoteAddress.indexOf('127.0.0.1') === -1) {
        response.writeHead(404, {'Content-Type': 'text/html; charset=utf-8'});
        response.end('Ну ты и пидор...');
        return false;
    }
    response.writeHead(200, {'Content-Type': 'text/html; charset=utf-8'});
    UserChatRepository.getChats().then(function (chats) {
        chats.forEach(function (chat) {
            if (chat.chat !== -1001048609359) {
                getPidor(chat.chat)
            }
        })
    });
    response.end('Done');
}).listen(process.env.SERVER_PORT);

function getPidor(chat) {
    PidorGenerator.get(chat).then(function (res) {
        UserModel.getModel().findOne({where: {user: res.user}}).then(function (user) {
            let message = '';
            winston.info('Pidor status: ' + res.status);
            if (res.status === 'old') {
                message = 'Пидор дня - *' + user.first_name + ' ' + user.last_name + '*';
            } else if (res.status === 'new') {
                setTimeout(function () {
                    bot.sendMessage(chat, '_' + pidorLoading[Math.floor(Math.random() * pidorLoading.length)] + '_', {
                        parse_mode: 'Markdown'
                    });
                }, 1000);
                setTimeout(function () {
                    bot.sendMessage(chat, 'Люблю же я этого пидора!');
                }, 2000);
                message = 'Теперь ты наш пидор, @' + user.username + ' (' + user.first_name + ' ' + user.last_name + ')!'
            }
            setTimeout(function () {
                winston.info('Pidor message to ' + chat + ' chat');
                bot.sendMessage(chat, message, {
                    parse_mode: 'Markdown'
                });
            }, 2000);
        });
    }).catch(function (rej) {
        console.log(rej)
    });
}