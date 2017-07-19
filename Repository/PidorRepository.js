'use strict';

const User = require("../Model/User");
const Promise = require("promise");

module.exports = class PidorRepository {
    constructor(Pidor) {
        this.Pidor = Pidor.getModel();
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

    /**
     *
     * @param chat
     * @returns {*|Promise}
     */
    get(chat) {
        const p = this.Pidor;

        return new Promise(function (fulfill, reject) {
            p.sync().then(() => {
                let now = new Date(new Date().getTime() + (60 * 1000)).toISOString().slice(0, 19).replace('T', ' ');
                let yesterday = new Date(new Date().getTime() - (24 * 60 * 60 * 1000)).toISOString().slice(0, 19).replace('T', ' ');

                const res = p.findAll({
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

    /**
     *
     * @param db
     * @param chat
     * @returns {*|Promise}
     */
    top(db, chat) {
        return new Promise(function (fulfill, reject) {
            db.query('SELECT count(p.id) c, p.user, u.first_name, u.last_name, u.username FROM pidors p LEFT JOIN users u ON p.user = u.user WHERE p.chat = ' + chat + ' GROUP BY p.user, u.first_name, u.last_name, u.username ORDER BY c DESC LIMIT 10').spread((results, metadata) => {
                fulfill(results);
            })
        });
    }

    pidorCount(db, user) {
        const sql = 'SELECT COUNT(id) as count FROM pidors WHERE user = :user: LIMIT 1'.replace(':user:', user);
        return new Promise(function (fulfill) {
            db.query(sql).spread((results, metadata) => {
                fulfill(results.count);
            })
        });
    }
};