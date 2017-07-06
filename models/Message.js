'use strict';

module.exports = class Message {
    constructor(sequelize) {
        this.model = sequelize.define('message', {
            id: {
                type: sequelize.INTEGER
            },
            chat: {
                type: sequelize.INTEGER
            },
            body: {
                type: sequelize.STRING
            },
            user: {
                type: sequelize.INTEGER
            }
        });
    }

    getModel() {
        return this.model;
    }
}
