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
    store(msg, user) {
        this.Pidor.sync().then(() => {
            return this.Pidor.create({
                chat: msg.chat.id,
                user: user
            });
        });

        return true;
    }
};