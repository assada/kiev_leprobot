const Sequelize = require("sequelize");
const env = require('dotenv').config();
const Random = require("random-js");
const TelegramBot = require('node-telegram-bot-api');
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

bot.on('message', (msg) => {
    UserRepository.store(msg.from);
    if (msg.chat.id < 0) {
        UserChatRepository.store(msg.from, msg.chat);
    }
    if (typeof msg.text !== 'undefined' && emojiStrip(msg.text).length > 1 && msg.text.charAt(0) !== '/') {
        let mention = new RegExp(names.join("|")).test(msg.text);
        let chance = randomizer.bool(0.2);
        MessageRepository.store(msg, names);
        if (chance || mention) {
            bot.sendChatAction(msg.chat.id, 'typing');
            (new MessageGenerator(MessageModel, msg)).get(names).then(function (res) {
                console.log(res);
                if (res !== false && res.length > 0) {
                    let options = {};
                    if (mention) {
                        options = {
                            reply_to_message_id: msg.message_id
                        };
                    }
                    setTimeout(function () {
                        bot.sendMessage(msg.chat.id, res, options);
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

    let now = new Date().toISOString().slice(0, 19).replace('T', ' ');
    let yesterday = new Date(new Date().getTime() - (24 * 60 * 60 * 1000)).toISOString().slice(0, 19).replace('T', ' ');
    let sql = 'SELECT count(m.id) c, m.user, u.first_name, u.last_name from messages m LEFT JOIN users u ON m.user = u.user WHERE m.chat = ' + msg.chat.id + ' AND m.createdAt BETWEEN \'' + yesterday + '\' AND \'' + now + '\' GROUP by m.user, u.first_name, u.last_name ORDER BY c DESC LIMIT 5';

    db.query(sql).spread((results, metadata) => {
        let result = '*Топ 5 пейсателей:* \n\n';
        results.forEach(function (item) {
            result += item.first_name + (item.last_name !== '' && item.last_name !== null ? ' ' + item.last_name : '') + ' - *' + item.c + '*\n';
        });
        if (results.length < 1) {
            result = 'Все молчали =('
        }
        bot.sendMessage(msg.chat.id, result, {
            parse_mode: 'Markdown'
        });
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

bot.onText(/\/new_pidor_top/, (msg, match) => {
    if (msg.chat.id > 0) {
        bot.sendMessage(msg.chat.id, "Не-не. Только в чатиках топчик работает");
        return false;
    }
    bot.sendChatAction(msg.chat.id, 'typing');

    db.query('SELECT count(p.id) c, p.user, u.first_name, u.last_name, u.username FROM pidors p LEFT JOIN users u ON p.user = u.user WHERE p.chat = ' + msg.chat.id + ' GROUP BY p.user, u.first_name, u.last_name, u.username').spread((results, metadata) => {

        if (results < 1) {
            bot.sendMessage(msg.chat.id, '_У вас все не пидоры... Пока.._', {
                parse_mode: 'Markdown'
            });
        }

        let message = 'Наши *лучшие* пидоры: \n\n';
        let i = 1;
        results.forEach(function (pidor) {
            message += i + ') _' + pidor.username + '_ - *' + pidor.c + '*\n';
            i++;
        });
        setTimeout(function () {
            bot.sendMessage(msg.chat.id, message, {
                parse_mode: 'Markdown'
            });
        }, 1500);
    })
});

http.createServer(function (req, response) {
    console.log(req.connection.remoteAddress);
    console.log(req.url);
    if(req.url.indexOf('favicon') > -1) {
        response.writeHead(404, {'Content-Type': 'text/plain'});
        response.end('Ну ты и пидор...');
        return false;
    }
    response.writeHead(200, {'Content-Type': 'text/plain'});
    UserChatRepository.getChats().then(function(chats) {
        chats.forEach(function (chat) {
            getPidor(chat.chat)
        })
    });
    response.end('Done');
}).listen(9615);

function getPidor(chat) {
    PidorGenerator.get(chat).then(function (res) {
        UserModel.getModel().findOne({where: {user: res.user}}).then(function (user) {
            let message = '';
            if (res.status === 'old') {
                message = 'Пидор дня - *' + user.first_name + ' ' + user.last_name + '*';
            } else if (res.status === 'new') {
                setTimeout(function () {
                    bot.sendMessage(chat, '_Вызываю бога пидоров..._', {
                        parse_mode: 'Markdown'
                    });
                }, 1000);
                message = 'TI PIDOR @' + user.username + ' (' + user.first_name + ' ' + user.last_name + ')!'
            }
            setTimeout(function () {
                console.log('Pidor message to ' + chat + ' chat');
                bot.sendMessage(chat, message, {
                    parse_mode: 'Markdown'
                });
            }, 2000);
        });
    }).catch(function (rej) {
        console.log(rej)
    });
}