'use strict';

const s = require("sequelize");

module.exports = class Message {
    constructor(sequelize) {
        this.model = sequelize.define('message', {
            id: {
                type: s.INTEGER
            },
            chat: {
                type: s.INTEGER
            },
            body: {
                type: s.STRING
            },
            user: {
                type: s.INTEGER
            }
        });
    }

    getModel() {
        return this.model;
    }
}
