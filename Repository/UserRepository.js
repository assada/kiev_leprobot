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
            // Table created
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
}