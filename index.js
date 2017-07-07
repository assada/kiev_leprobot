const Sequelize = require("sequelize");
const env = require('dotenv').config();
const TelegramBot = require('node-telegram-bot-api');

const MessageStore = require("./modules/StoreMessage");
const UserStore = require("./modules/UserStore");

const Markov = require('markov-strings');

const sequelize = new Sequelize(process.env.MYSQL_DATABASE, process.env.MYSQL_USER, process.env.MYSQL_PASSWORD, {
    host: process.env.MYSQL_HOST,
    dialect: 'mysql',
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

    var Message = MessageModel.getModel();

    var m = [];

    Message.findAll({where: {body: {$like: '%топ%'}}, limit: 10, attributes: ['body']}).then(Messages => {
        Messages.forEach(function (item) {
            m.push(item.body)
        });
        const markov = new Markov(m, options);
        console.log('-------------');
        markov.buildCorpusSync();
        const result = markov.generateSentenceSync();
        console.log(result);
        console.log('-------------');
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

