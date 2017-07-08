'use strict';

const Promise = require('promise');

module.exports = class PidorGenerator {
    constructor(PidorRepository, UserChatRepository) {
        this.PidorRepository = PidorRepository;
        this.UserChatRepository = UserChatRepository;
    }

    get(msg) {
        const chat = msg.chat.id;
        return new Promise(function (fulfill, reject) {
            this.PidorRepository.get(chat).then(function (res) {
                if (res.length > 0) {
                    console.log(res);
                    reject('Rej 1');
                    //fulfill(res[0].dataValues);
                } else {
                    this.UserChatRepository.getActiveUser(chat).then(users => {
                        if (users.length > 0) {
                            let user = users[Math.floor(Math.random() * users.length)];
                            console.log(user);
                            this.PidorRepository.store(msg, user.dataValues.id);
                            fulfill(user.dataValues);
                        } else {
                            reject('Rej 2');
                        }

                    });
                }
            });
        });
    }
};