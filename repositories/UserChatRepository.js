const { Op } = require('sequelize');
const BaseRepository = require('./BaseRepository');
const logger = require('../utils/logger');

class UserChatRepository extends BaseRepository {
    constructor(UserChat) {
        super(UserChat.getModel());
    }

    async store(user, chat) {
        try {
            await this.model.sync();
            
            const [userChat, created] = await this.model.findOrCreate({
                where: {
                    user: user.id,
                    chat: chat.id
                }
            });

            if (!created) {
                await this.model.update(
                    { updatedAt: new Date() },
                    { where: { user: user.id, chat: chat.id } }
                );
            }

            return userChat;
        } catch (error) {
            logger.error('Error storing user chat:', error);
            throw error;
        }
    }

    async destroy(user, chat) {
        try {
            await this.model.sync();
            
            const result = await this.model.destroy({
                where: {
                    user: user.id,
                    chat: chat.id
                }
            });

            return result > 0;
        } catch (error) {
            logger.error('Error destroying user chat:', error);
            throw error;
        }
    }

    async getActiveUser(chat, user) {
        try {
            const now = new Date();
            const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);

            return await this.model.findAll({
                where: {
                    chat: chat,
                    updatedAt: {
                        [Op.between]: [yesterday, now]
                    },
                    user: {
                        [Op.ne]: user
                    }
                }
            });
        } catch (error) {
            logger.error('Error getting active users:', error);
            throw error;
        }
    }

    async getChats() {
        try {
            return await this.model.findAll({
                group: 'chat',
                attributes: ['chat']
            });
        } catch (error) {
            logger.error('Error getting chats:', error);
            throw error;
        }
    }
}

module.exports = UserChatRepository; 