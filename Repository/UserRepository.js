'use strict';

const emojiStrip = require('emoji-strip');

module.exports = class UserRepository {
    constructor(User) {
        this.User = User.getModel();
    }

    /**
     * Find or create user
     * @param user
     * @returns {boolean}
     */
    store(user) {
        let oUser = user;
        this.User.sync().then(() => {
            return this.User.findOrCreate({
                where: {
                    user: user.id,
                },
                defaults: {
                    //TODO: Fuck this checks
                    first_name: typeof user.first_name !== 'undefined' ? emojiStrip(user.first_name) : '',
                    last_name: typeof user.last_name !== 'undefined' ? emojiStrip(user.last_name) : '',
                    username: typeof user.username !== 'undefined' ? emojiStrip(user.username) : ''
                }
            }).spread((user, created) => {
                if (!created) {
                    this.User.update({
                        first_name: typeof oUser.first_name !== 'undefined' ? emojiStrip(oUser.first_name) : '',
                        last_name: typeof oUser.last_name !== 'undefined' ? emojiStrip(oUser.last_name) : '',
                        username: typeof oUser.username !== 'undefined' ? emojiStrip(oUser.username) : '',
                        updatedAt: new Date()
                    }, {where: {user: user.user}});
                }
            });
        });

        return true;
    }


    getActiveUser() {
        let now = new Date( new Date().getTime() + 2 * 3600 * 1000).toISOString().slice(0, 19).replace('T', ' ');
        let yesterday = new Date(new Date().getTime() + (2 * 3600 * 1000) - (24 * 60 * 60 * 1000)).toISOString().slice(0, 19).replace('T', ' ');
        return this.User.findAll({
            where: {
                updatedAt: {$between: [yesterday, now]},
            },
        });
    }
}
