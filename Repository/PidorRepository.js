'use strict';

module.exports = class PidorRepository {
    constructor(Pidor, UserModel) {
        this.Pidor = Pidor.getModel();
        this.UserModel = UserModel;
    }

    /**
     * Store pidor
     * @param msg
     * @param user
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

    get(chat) {
        return this.Pidor.findAll({
            include: [{
                model: this.UserModel,
                where: {user: 'pidor.user'}
            }],
            where: {
                chat: chat
            },
            order: [
                ['id', 'DESC']
            ],
            limit: 1
        });
    }
};