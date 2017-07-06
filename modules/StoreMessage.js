'use strict';

module.exports = class StoreMessage {
    constructor(Message){
        this.Message = Message.getModel();
    }

    store(msg) {

        this.Message.sync({force: true}).then(() => {
            // Table created
            return this.Message.create({
                id: msg.message_id,
                chat:  msg.chat.id,
                body: msg.text,
                user: msg.from.id
            });
        });

        return true;
    }
}