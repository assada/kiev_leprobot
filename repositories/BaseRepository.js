const logger = require('../utils/logger');

class BaseRepository {
    constructor(model) {
        this.model = model;
    }

    async findById(id) {
        try {
            return await this.model.findByPk(id);
        } catch (error) {
            logger.error(`Error finding by ID in ${this.constructor.name}:`, error);
            throw error;
        }
    }

    async findAll(options = {}) {
        try {
            return await this.model.findAll(options);
        } catch (error) {
            logger.error(`Error finding all in ${this.constructor.name}:`, error);
            throw error;
        }
    }

    async create(data) {
        try {
            return await this.model.create(data);
        } catch (error) {
            logger.error(`Error creating in ${this.constructor.name}:`, error);
            throw error;
        }
    }

    async update(data, options) {
        try {
            return await this.model.update(data, options);
        } catch (error) {
            logger.error(`Error updating in ${this.constructor.name}:`, error);
            throw error;
        }
    }

    async delete(options) {
        try {
            return await this.model.destroy(options);
        } catch (error) {
            logger.error(`Error deleting in ${this.constructor.name}:`, error);
            throw error;
        }
    }
}

module.exports = BaseRepository; 