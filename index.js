const Sequelize = require("sequelize");
const env = require('dotenv').config();
const Random = require("random-js");
const TelegramBot = require('node-telegram-bot-api');

const Promise = require('promise');

const MessageStore = require("./modules/StoreMessage");
const UserStore = require("./modules/UserStore");
const MessageGenerator = require("./modules/MessageGenerator");

const sequelize = new Sequelize(process.env.MYSQL_DATABASE, process.env.MYSQL_USER, process.env.MYSQL_PASSWORD, {
    host: process.env.MYSQL_HOST,
    dialect: 'mysql', logging: false
});

const bot = new TelegramBot(process.env.TOKEN, {polling: true});

const Message = require("./models/Message");
const MessageModel = new Message(sequelize);

const User = require("./models/User");
const UserModel = new User(sequelize);


const catP = [
    "Вот тебе котя!",
    "Держи котю",
    "Котя - топчик",
    "СМОТРИ КАКОЙ ЗАБАВНЫЙ!",
    "Всем котю!",
    ":3"
];

const options = {
    maxLength: 140,
    minWords: 2,
    minScore: 1,
    checker: sentence => {
        return sentence.endsWith('.'); // I want my tweets to end with a dot.
    }
};

bot.on('message', (msg) => {
    (new MessageStore(MessageModel)).store(msg);
    (new UserStore(UserModel)).store(msg);

    let m = (new MessageGenerator(MessageModel, msg)).get().then(function (res) {
        console.log('_____________');
        console.log(res);
        console.log('_____________');


        if (Random.bool(3)) {
            console.log('CHANCE!');
            if (res !== false && res.length > 0) {
                bot.sendMessage(msg.chat.id, res, {
                    reply_to_message_id: msg.message_id
                });
            }
        }
    });
});


bot.onText(/\/boobs/, (msg, match) => {
    const request = require('request');
    let r = request.get('http://api.oboobs.ru/boobs/0/1/random', function (err, res, body) {
        var json = JSON.parse(body);
        var photoLink = 'http://media.oboobs.ru/' + json[0].preview;
        const photo = request(photoLink);
        const chatId = msg.chat.id;
        bot.sendPhoto(chatId, photo, {
            caption: json[0].model
        });
    });
});

bot.onText(/\/cat/, (msg, match) => {
    var request = require('request');
    var r = request.get('http://thecatapi.com/api/images/get?format=src', function (err, res, body) {
        const photo = request(this.uri.href);
        const chatId = msg.chat.id;
        var randCat = catP[Math.floor(Math.random() * catP.length)];
        bot.sendPhoto(chatId, photo, {
            caption: randCat
        });
    });
});

