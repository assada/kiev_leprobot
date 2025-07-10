const { Op } = require('sequelize');
const BaseRepository = require('./BaseRepository');
const logger = require('../utils/logger');

class UserRepository extends BaseRepository {
    constructor(User) {
        super(User.getModel());
    }

    async store(user) {
        try {
            await this.model.sync();
            
            const [userRecord, created] = await this.model.findOrCreate({
                where: {
                    user: user.id,
                },
                defaults: {
                    first_name: user.first_name || '',
                    last_name: user.last_name || '',
                    username: user.username || '',
                    language_code: user.language_code || null
                }
            });

            if (!created) {
                await this.model.update({
                    first_name: user.first_name || '',
                    last_name: user.last_name || '',
                    username: user.username || '',
                    language_code: user.language_code || null,
                    updatedAt: new Date()
                }, {
                    where: { user: user.id }
                });
                
                logger.info(`User ${user.id} updated`);
            } else {
                logger.info(`User ${user.id} created`);
            }

            return userRecord;
        } catch (error) {
            logger.error('Error storing user:', error);
            throw error;
        }
    }

    async getActiveUser() {
        try {
            const now = new Date();
            const yesterday = new Date(now.getTime() - (24 * 60 * 60 * 1000));

            return await this.model.findAll({
                where: {
                    updatedAt: {
                        [Op.between]: [yesterday, now]
                    }
                }
            });
        } catch (error) {
            logger.error('Error getting active users:', error);
            throw error;
        }
    }

    async findByUserId(userId) {
        try {
            return await this.model.findOne({
                where: { user: userId }
            });
        } catch (error) {
            logger.error('Error finding user by userId:', error);
            throw error;
        }
    }

    async getUserStats() {
        try {
            const totalUsers = await this.model.count();
            const activeUsers = await this.getActiveUser();
            
            return {
                total: totalUsers,
                active: activeUsers.length
            };
        } catch (error) {
            logger.error('Error getting user stats:', error);
            throw error;
        }
    }
}

module.exports = UserRepository; 