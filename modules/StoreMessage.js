'use strict';

const emojiStrip = require('emoji-strip');

module.exports = class StoreMessage {
    constructor(Message) {
        this.Message = Message.getModel();
    }

    store(msg) {

        this.Message.sync().then(() => {
            // Table created
            return this.Message.create({
                message: msg.message_id,
                chat: msg.chat.id,
                body: emojiStrip(msg.text),
                user: msg.from.id
            });
        });

        return true;
    }
}