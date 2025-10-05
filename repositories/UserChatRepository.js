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
            
            logger.info('UserChatRepository: Storing user-chat relation:', {
                userId: user.id,
                username: user.username,
                chatId: chat.id,
                chatTitle: chat.title
            });
            
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
                logger.info(`UserChatRepository: User ${user.id} (@${user.username}) in chat ${chat.id} updated`);
            } else {
                logger.info(`UserChatRepository: User ${user.id} (@${user.username}) in chat ${chat.id} created`);
            }

            return userChat;
        } catch (error) {
            logger.error('UserChatRepository: Error storing user chat:', {
                error: error.message,
                stack: error.stack,
                userId: user.id,
                username: user.username,
                chatId: chat.id,
                chatTitle: chat.title
            });
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