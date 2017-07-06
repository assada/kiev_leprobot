const Sequelize = require("sequelize");
const env = require('dotenv').config();
const TelegramBot = require('node-telegram-bot-api');

const MessageStore = require("./modules/StoreMessage");

const sequelize = new Sequelize(process.env.MYSQL_DATABASE, process.env.MYSQL_USER, process.env.MYSQL_PASSWORD, {
  host: process.env.MYSQL_HOST,
  dialect: 'mysql',
});

const bot = new TelegramBot(process.env.TOKEN, {polling: true});

const Message = require("./models/Message");
const MessageModel = new Message(sequelize);


bot.on('message', (msg) => {
  const chatId = msg.chat.id;

  (new MessageStore(MessageModel)).store(msg);

  console.log(msg.from);

  bot.sendMessage(chatId, 'Received your message');
});