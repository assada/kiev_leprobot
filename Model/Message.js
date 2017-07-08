'use strict';

const s = require("sequelize");

module.exports = class Message {
    constructor(sequelize) {
        this.model = sequelize.define('message', {
            id: {
                type: s.INTEGER,
                primaryKey: true,
                autoIncrement: true
            },
            message: {
                type: s.BIGINT(100)
            },
            chat: {
                type: s.BIGINT(100)
            },
            body: {
                type: s.TEXT('middle')
            },
            user: {
                type: s.BIGINT(100)
            }
        });
    }

    getModel() {
        return this.model;
    }
}
