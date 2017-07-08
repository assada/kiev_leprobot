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
                    this.User.update({updatedAt: new Date()}, {where: {user: user.id}});
                }
            });
        });

        return true;
    }


    getActiveUser() {
        let now= new Date().toISOString().slice(0, 19).replace('T', ' ');
        let yesterday = new Date(new Date().getTime() - (24 * 60 * 60 * 1000)).toISOString().slice(0, 19).replace('T', ' ');
        this.User.sync().then(() => {
            return this.User.findAll({
                where: {
                    updatedAt: {$between: [yesterday, now]},
                },
            });
        });
    }
}