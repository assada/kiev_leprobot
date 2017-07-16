'use strict';

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
     * @param {string} chat
    * @returns {*}
    */
    get(chat) {
        let pr = this.PidorRepository;
        let ucr = this.UserChatRepository;
        return new this.Promise(function (fulfill, reject) {
            pr.get(chat).then(function (res) {
                if (res.length > 0) {
                    fulfill({status: 'old', user: res[0].dataValues.user});
                } else {
                    ucr.getActiveUser(chat).then(users => {
                        if (users.length > 0) {
                            let user = users[Math.floor(Math.random() * users.length)];
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