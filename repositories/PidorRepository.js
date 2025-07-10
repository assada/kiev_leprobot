const { Op, QueryTypes } = require('sequelize');
const BaseRepository = require('./BaseRepository');
const logger = require('../utils/logger');

class PidorRepository extends BaseRepository {
    constructor(Pidor) {
        super(Pidor.getModel());
    }

    async store(chat, user) {
        try {
            await this.model.sync();
            
            const result = await this.model.create({
                chat: chat,
                user: user
            });

            return result;
        } catch (error) {
            logger.error('Error storing pidor:', error);
            throw error;
        }
    }

    async get(chat) {
        try {
            await this.model.sync();
            
            const now = new Date();
            const end = new Date(now.setHours(23, 59, 59, 999));
            const start = new Date(now.setHours(0, 0, 0, 0));

            const result = await this.model.findAll({
                where: {
                    chat: chat,
                    updatedAt: {
                        [Op.between]: [start, end]
                    }
                },
                order: [
                    ['id', 'DESC']
                ],
                limit: 1
            });

            return result;
        } catch (error) {
            logger.error('Error getting pidor:', error);
            throw error;
        }
    }

    async top(db, chat) {
        try {
            const year = (new Date()).getFullYear();
            
            const sql = `
                SELECT count(p.id) as c, p.user, u.first_name, u.last_name, u.username 
                FROM pidors p 
                LEFT JOIN users u ON p.user = u.user 
                WHERE p.chat = :chat 
                AND YEAR(p.updatedAt) = :year 
                GROUP BY p.user, u.first_name, u.last_name, u.username 
                ORDER BY c DESC 
                LIMIT 10
            `;

            const results = await db.query(sql, {
                replacements: { chat, year },
                type: QueryTypes.SELECT
            });

            return results;
        } catch (error) {
            logger.error('Error getting pidor top:', error);
            throw error;
        }
    }

    async pidorCount(db, user, chat) {
        try {
            const sql = 'SELECT COUNT(id) as count FROM pidors WHERE user = :user AND chat = :chat LIMIT 1';

            const results = await db.query(sql, {
                replacements: { user, chat },
                type: QueryTypes.SELECT
            });

            const count = results.length > 0 ? results[0].count : 0;
            return count;
        } catch (error) {
            logger.error('Error counting pidors:', error);
            throw error;
        }
    }
}

module.exports = PidorRepository; 