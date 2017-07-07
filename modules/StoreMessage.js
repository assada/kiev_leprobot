'use strict';

const emojiStrip = require('emoji-strip');

module.exports = class StoreMessage {
    constructor(Message) {
        this.Message = Message.getModel();
    }

    store(msg) {

        if (msg.text !== '') {
            this.Message.sync().then(() => {
                // Table created
                return this.Message.create({
                    message: msg.message_id,
                    chat: msg.chat.id,
                    body: typeof msg.text !== 'undefined' ? emojiStrip(msg.text) : '',
                    user: msg.from.id
                });
            });
        }


        return true;
    }
};