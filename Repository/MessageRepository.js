'use strict';

const emojiStrip = require('emoji-strip');

const regex = /\@[0-9a-zA-Z_]*/g;

module.exports = class MessageRepository {
    constructor(Message) {
        this.Message = Message.getModel();
    }

    /**
     * Store message
     * @param msg
     * @returns {boolean}
     */
    store(msg) {
        this.Message.sync().then(() => {
            return this.Message.create({
                message: msg.message_id,
                chat: msg.chat.id,
                body: typeof msg.text !== 'undefined' ? emojiStrip(msg.text.replace(regex, '').trim()) : null,
                user: msg.from.id
            });
        });


        return true;
    }
};