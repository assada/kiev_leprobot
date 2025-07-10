const { Op, QueryTypes } = require('sequelize');
const BaseRepository = require('./BaseRepository');
const logger = require('../utils/logger');

class MessageRepository extends BaseRepository {
    constructor(Message, cache) {
        super(Message.getModel());
        this.cache = cache;
    }

    cleanup(txt) {
        return txt.replace(/(^[\\("']+)|([,:;.?!)"'|\\]+$)/, '').toLowerCase();
    }

    async store(msg) {
        try {
            await this.model.sync();
            
            const result = await this.model.create({
                message: msg.message_id,
                chat: msg.chat.id,
                body: typeof msg.text !== 'undefined' ? msg.text : null,
                user: msg.from.id
            });

            return result;
        } catch (error) {
            logger.error('Error storing message:', error);
            throw error;
        }
    }

    async top(db, chat) {
        try {
            const now = new Date();
            const yesterday = new Date(now.getTime() - (24 * 60 * 60 * 1000));

            const sql = `
                SELECT count(m.id) as c, m.user, u.first_name, u.last_name 
                FROM messages m 
                LEFT JOIN users u ON m.user = u.user 
                WHERE m.chat = :chat 
                AND m.createdAt BETWEEN :yesterday AND :now 
                GROUP BY m.user, u.first_name, u.last_name 
                ORDER BY c DESC 
                LIMIT 5
            `;

            const results = await db.query(sql, {
                replacements: { chat, yesterday, now },
                type: QueryTypes.SELECT
            });

            if (results.length < 1) {
                return 'Усі мовчали =(';
            }

            let result = '<b>Топ 5 письмеців:</b> \n\n';
            results.forEach(function (item) {
                result += item.first_name + (item.last_name !== '' && item.last_name !== null ? ' ' + item.last_name : '') + ' - <b>' + item.c + '</b>\n';
            });

            return result;
        } catch (error) {
            logger.error('Error getting top messages:', error);
            throw error;
        }
    }

    async topByDays(db, chat) {
        try {
            const cacheKey = 'data_' + chat + '-topByDays';
            
            if (this.cache && this.cache.get(cacheKey) !== null) {
                return this.cache.get(cacheKey);
            }

            const sql = `
                SELECT count(id) as count, DAY(createdAt) as day, MONTH(createdAt) as month, YEAR(createdAt) as year 
                FROM messages 
                WHERE chat = :chat 
                GROUP BY day, month, year 
                ORDER BY year DESC, month DESC, day DESC 
                LIMIT 31
            `;

            const result = await db.query(sql, {
                replacements: { chat },
                type: QueryTypes.SELECT
            });

            if (this.cache) {
                this.cache.put(cacheKey, result, 60 * 60 * 1000);
            }

            return result;
        } catch (error) {
            logger.error('Error getting top by days:', error);
            throw error;
        }
    }

    async countUserMessages(db, user) {
        try {
            const cacheKey = `countUserMessages_${user}`;
            
            if (this.cache && this.cache.get(cacheKey) !== null) {
                return this.cache.get(cacheKey);
            }

            const sql = 'SELECT COUNT(id) as count FROM messages WHERE user = :user';

            const result = await db.query(sql, {
                replacements: { user },
                type: QueryTypes.SELECT
            });

            if (this.cache) {
                this.cache.put(cacheKey, result, 10 * 60 * 1000);
            }

            return result;
        } catch (error) {
            logger.error('Error counting user messages:', error);
            throw error;
        }
    }
}

module.exports = MessageRepository; 