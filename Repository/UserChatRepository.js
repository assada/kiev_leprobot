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
            }).spread((u, created) => {
                if (!created) {
                    this.UserChat.update({updatedAt: new Date()}, {where: {user: user.id, chat: chat.id}});
                }
            });
        });

        return true;
    }

    /**
     * destroy UserChat
     * @param user
     * @param chat
     * @returns {boolean}
     */
    destroy(user, chat) {
        this.UserChat.sync().then(() => {
            return this.UserChat.destroy({
                where: {
                    user: user.id,
                    chat: chat.id
                }
            });
        });

        return true;
    }

    /**
     * FOR PIDOR
     * @param chat
     * @param user
     * @returns {Promise.<Array.<Model>>}
     */
    getActiveUser(chat, user) {
        let end = new Date(new Date() + 2 * 3600 * 1000).toISOString().slice(0, 19).replace('T', ' ');
        let start = new Date(new Date() - 24 * 60 * 60 * 1000 + 2 * 3600 * 1000).toISOString().slice(0, 19).replace('T', ' ');
        return this.UserChat.findAll({
            where: {
                chat: chat,
                updatedAt: {$between: [start, end]},
            },
        });
    }

    getChats() {
        return this.UserChat.findAll({group: 'chat', attributes: ['chat']});
    }
};
