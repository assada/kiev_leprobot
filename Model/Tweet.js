'use strict';

const s = require("sequelize");

module.exports = class Tweet {
    constructor(sequelize) {
        this.model = sequelize.define('tweet', {
            id: {
                type: s.INTEGER,
                primaryKey: true,
                autoIncrement: true
            },
            chat: {
                type: s.BIGINT(100)
            },
            user: {
                type: s.BIGINT(100)
            },
            body: {
                type: s.TEXT('middle')
            },
            message: {
                type: s.BIGINT(100)
            }
        });
    }

    getModel() {
        return this.model;
    }
};
