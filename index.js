import Sequelize from "sequelize";

const env = require('dotenv').config();
const TelegramBot = require('node-telegram-bot-api');

const MessageStore = require("./modules/StoreMessage");

const sequelize = new Sequelize(env.parsed.MYSQL_DATABASE, env.parsed.MYSQL_USER, env.parsed.MYSQL_PASSWORD, {
  host: env.parsed.MYSQL_HOST,
  dialect: 'mysql',
});

const bot = new TelegramBot(env.parsed.TOKEN, {polling: true});

const Message = require("./models/Message")(sequelize);


bot.on('message', (msg) => {
  const chatId = msg.chat.id;

  MessageStore.store(msg);

  bot.sendMessage(chatId, 'Received your message');
});