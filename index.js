const Sequelize = require("sequelize");
const env = require('dotenv').config();
const TelegramBot = require('node-telegram-bot-api');

const MessageStore = require("./modules/StoreMessage");
const UserStore = require("./modules/UserStore");

const sequelize = new Sequelize(process.env.MYSQL_DATABASE, process.env.MYSQL_USER, process.env.MYSQL_PASSWORD, {
  host: process.env.MYSQL_HOST,
  dialect: 'mysql',
});

const bot = new TelegramBot(process.env.TOKEN, {polling: true});

const Message = require("./models/Message");
const MessageModel = new Message(sequelize);

const User = require("./models/User");
const UserModel = new User(sequelize);


bot.on('message', (msg) => {
  const chatId = msg.chat.id;

  (new MessageStore(MessageModel)).store(msg);
  (new UserStore(UserModel)).store(msg);

  console.log(msg.from);
});