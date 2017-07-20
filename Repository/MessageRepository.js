'use strict';

const emojiStrip = require('emoji-strip');
const Promise = require('promise');

const regex = /\@[0-9a-zA-Z_]*/g;

module.exports = class MessageRepository {
    constructor(Message, cache) {
        this.Message = Message.getModel();
        this.cache = cache;
    }

    cleanup(txt) {
        return txt.replace(/(^[\\("']+)|([,:;.?!)"'|\\]+$)/, '').toLowerCase();
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

    top(db, chat) {
        let now = new Date().toISOString().slice(0, 19).replace('T', ' ');
        let yesterday = new Date(new Date().getTime() - (24 * 60 * 60 * 1000)).toISOString().slice(0, 19).replace('T', ' ');
        let sql = 'SELECT count(m.id) c, m.user, u.first_name, u.last_name from messages m LEFT JOIN users u ON m.user = u.user WHERE m.chat = ' + chat + ' AND m.createdAt BETWEEN \'' + yesterday + '\' AND \'' + now + '\' GROUP by m.user, u.first_name, u.last_name ORDER BY c DESC LIMIT 5';

        return new Promise(function (fulfill, reject) {
            db.query(sql).spread((results, metadata) => {
                let result = '<b>Топ 5 пейсателей:</b> \n\n';
                results.forEach(function (item) {
                    result += item.first_name + (item.last_name !== '' && item.last_name !== null ? ' ' + item.last_name : '') + ' - <b>' + item.c + '</b>\n';
                });
                if (results.length < 1) {
                    result = 'Все молчали =('
                }

                fulfill(result);
            });
        });
    }

    topByDays(db, chat) {
        const t = this;
        return new Promise(function (fulfill) {
            if (t.cache.get('topByDays') === null) {
                const sql = 'SELECT count(id) as count, DAY(createdAt) as day, MONTH(createdAt) as month, YEAR(createdAt) as year FROM messages WHERE chat = ' + chat + ' GROUP BY day, month, year ORDER BY day DESC, month DESC, year DESC LIMIT 10';
                db.query(sql).spread((result, metadata) => {
                    t.cache.put('topByDays', result, 60 * 60 * 1000);
                    fulfill(result);
                })
            } else {
                fulfill(t.cache.get('topByDays'));
            }
        });
    }

    countUserMessages(db, user) {
        const t = this;
        return new Promise(function (fulfill) {
                if (t.cache.get('countUserMessages') === null) {
                    const sql = 'SELECT COUNT(id) as count FROM messages WHERE user=:user:'.replace(':user:', user);
                    db.query(sql).spread((result, metadata) => {
                        t.cache.put('countUserMessages', result, 10 * 60 * 1000);
                        fulfill(result);
                    })
                } else {
                    fulfill(t.cache.get('countUserMessages'));
                }
            }
        );
    }
};