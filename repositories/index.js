const models = require('../Model');
const UserRepository = require('./UserRepository');
const UserChatRepository = require('./UserChatRepository');
const MessageRepository = require('./MessageRepository');
const PidorRepository = require('./PidorRepository');
const cache = require('memory-cache');

const repositories = {
    UserRepository: new UserRepository(models.User),
    UserChatRepository: new UserChatRepository(models.UserChat),
    MessageRepository: new MessageRepository(models.Message, cache),
    PidorRepository: new PidorRepository(models.Pidor)
};

module.exports = repositories; 