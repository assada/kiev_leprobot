'use strict';

const User = require("../Model/User");

module.exports = class PidorRepository {
    constructor(Pidor, UserModel) {
        this.Pidor = Pidor.getModel();
        this.UserModel = UserModel;
    }

    /**
     * Store pidor
     * @param chat
     * @param user
     * @returns {boolean}
     */
    store(chat, user) {
        this.Pidor.sync().then(() => {
            return this.Pidor.create({
                chat: chat,
                user: user
            });
        });

        return true;
    }

    get(chat) {
        const p = this.Pidor;

        return new Promise(function (fulfill, reject) {
            p.sync().then(() => {
                let now= new Date().toISOString().slice(0, 19).replace('T', ' ');
                let yesterday = new Date(new Date().getTime() - (24 * 60 * 60 * 1000)).toISOString().slice(0, 19).replace('T', ' ');

                const res = p.findAll({
                    /*include: [{
                     model: User,
                     where: {user: Sequelize.col('pidor.user')}
                     }],*/
                    where: {
                        chat: chat,
                        updatedAt: {$between: [yesterday, now]},
                    },
                    order: [
                        ['id', 'DESC']
                    ],
                    limit: 1
                });
                fulfill(res);
            });
        });
    }
};