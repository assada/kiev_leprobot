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
                    first_name: emojiStrip(msg.from.first_name),
                    last_name: emojiStrip(msg.from.last_name),
                    username: emojiStrip(msg.from.username)
                }
            });
        });

        return true;
    }
}