'use strict';

const s = require("sequelize");

module.exports = class UserChat {
    constructor(sequelize) {
        this.model = sequelize.define('user_chat', {
            id: {
                type: s.INTEGER,
                primaryKey: true,
                autoIncrement: true
            },
            user: {
                type: s.BIGINT(100)
            },
            chat: {
                type: s.BIGINT(100)
            }
        });
    }

    getModel() {
        return this.model;
    }
};