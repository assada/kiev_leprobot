'use strict';

module.exports = class PidorRepository {
    constructor(Pidor) {
        this.Pidor = Pidor.getModel();
    }

    /**
     * Store pidor
     * @param msg
     * @returns {boolean}
     */
    store(msg) {
        this.Pidor.sync().then(() => {
            return this.Pidor.create({
                message: msg.message_id,
                chat: msg.chat.id,
                user: msg.from.id
            });
        });

        return true;
    }
};