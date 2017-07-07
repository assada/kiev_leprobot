'use strict';

const emojiStrip = require('emoji-strip');

module.exports = class UserStore {
    constructor(User) {
        this.User = User.getModel();
    }

    store(msg) {
        this.User.sync().then(() => {
            // Table created
            return this.User.findOrCreate({
                where: {
                    user: msg.from.id,
                },
                defaults: {
                    //TODO: Fuck this checks
                    first_name: typeof msg.from.first_name !== 'undefined' ? emojiStrip(msg.from.first_name) : '',
                    last_name: typeof msg.from.last_name !== 'undefined' ? emojiStrip(msg.from.last_name) : '',
                    username: typeof msg.from.username !== 'undefined' ? emojiStrip(msg.from.username) : ''
                }
            }).spread((user, created) => {
                if (!created) {
                    let user = user.get();
                    user.updatedAt = new Date();
                    user.save();
                }
            });
        });

        return true;
    }
}