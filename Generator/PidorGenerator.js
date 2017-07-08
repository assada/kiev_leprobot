'use strict';

const Promise = require('promise');

module.exports = class PidorGenerator {
    constructor(PidorRepository, UserRepository) {
        this.PidorRepository = PidorRepository;
        this.UserRepository = UserRepository;
    }

    get(msg) {
        const chat = msg.chat.id;
        return new Promise(function (fulfill, reject) {
            this.UserRepository.getActiveUser().then(users => {
                let user = users[Math.floor(Math.random() * users.length)];
                console.log(user.dataValues.username);
                PidorRepository.store(msg, user.dataValues.id);
                fulfill(user.dataValues);
            });
        });
    }
};