'use strict';

const emojiStrip = require('emoji-strip');

const regex = /\@[0-9a-zA-Z_]*/g;

module.exports = class UserChatRepository {
    constructor(UserChat) {
        this.UserChat = UserChat.getModel();
    }

    /**
     * Store UserChat
     * @param user
     * @param chat
     * @returns {boolean}
     */
    store(user, chat) {
        this.UserChat.sync().then(() => {
            return this.UserChat.findOrCreate({
                where: {
                    user: user.id,
                    chat: chat.id
                }
            }).spread((user, created) => {
                if (!created) {
                    console.log('Try to update');
                    this.UserChat.update({updatedAt: new Date()}, {where: {user: user.id, chat: chat.id}});
                }
            });
        });

        return true;
    }

    getActiveUser(chat) {
        let now= new Date().toISOString().slice(0, 19).replace('T', ' ');
        let yesterday = new Date(new Date().getTime() - (24 * 60 * 60 * 1000)).toISOString().slice(0, 19).replace('T', ' ');
        return this.User.findAll({
            where: {
                chat: chat,
                updatedAt: {$between: [yesterday, now]},
            },
        });
    }
};