'use strict';

const Promise = require('promise');

module.exports = class PidorGenerator {
    constructor(PidorRepository, UserChatRepository) {
        this.PidorRepository = PidorRepository;
        this.UserChatRepository = UserChatRepository;
    }

    get(msg) {
        const chat = msg.chat.id;
        let pr = this.PidorRepository;
        let ucr = this.UserChatRepository;
        return new Promise(function (fulfill, reject) {
            pr.get(chat).then(function (res) {

                console.log(res);
                if (res.length > 0) {
                    console.log(res);
                    reject('Rej 1');
                    //fulfill(res[0].dataValues);
                } else {
                    ucr.getActiveUser(chat).then(users => {
                        console.log('-----------')
                        console.log(users);
                        console.log('-----------')
                        if (users.length > 0) {
                            let user = users[Math.floor(Math.random() * users.length)];
                            console.log(user);
                            pr.store(msg, user.dataValues.user);
                            fulfill(user.dataValues);
                        } else {
                            reject('Rej 2');
                        }

                    });
                }
            }).catch(function (res) {
                console.log(res);
            });
        });
    }
};