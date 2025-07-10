const { sequelize } = require('../database/connection');
const User = require('./User');
const Message = require('./Message');
const Tweet = require('./Tweet');
const Pidor = require('./Pidor');
const UserChat = require('./UserChat');

const models = {
    User: new User(sequelize),
    Message: new Message(sequelize),
    Tweet: new Tweet(sequelize),
    Pidor: new Pidor(sequelize),
    UserChat: new UserChat(sequelize)
};

Object.keys(models).forEach(modelName => {
    if (models[modelName].associate) {
        models[modelName].associate(models);
    }
});

module.exports = models; 