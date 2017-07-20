'use strict';

const random = require("random-js");
const randomizer = new random(random.engines.mt19937().autoSeed());

/**
 * Pidor functionality
 *
 * @param {Promise} Promise
 * @param {PidorRepository} PidorRepository
 * @param {UserChatRepository} UserChatRepository
 *
 * @type {PidorGenerator}
 */
module.exports = class PidorGenerator {
    constructor(Promise, PidorRepository, UserChatRepository) {
        this.PidorRepository = PidorRepository;
        this.UserChatRepository = UserChatRepository;
        this.Promise = Promise;
    }

    /**
     * Get pidor for chat
     * @param {Message} msg
     * @returns {*}
     */
    get(msg) {
        const chat = msg.chat.id;
        let pr = this.PidorRepository;
        let ucr = this.UserChatRepository;
        return new this.Promise(function (fulfill, reject) {
            pr.get(chat).then(function (res) {
                if (res.length > 0) {
                    fulfill({status: 'old', user: res[0].dataValues.user});
                } else {
                    ucr.getActiveUser(chat, msg.from.id).then(users => {
                        if (users.length > 0) {
                            let user = randomizer.pick(users);
                            pr.store(chat, user.dataValues.user);
                            fulfill({status: 'new', user: user.dataValues.user});
                        } else {
                            reject('Users not found');
                        }
                    });
                }
            }).catch(function (res) {
                reject(res);
            });
        });
    }
};