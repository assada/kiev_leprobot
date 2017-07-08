'use strict';

const s = require("sequelize");

const User = require("../Model/User");

module.exports = class Pidor {
    constructor(sequelize) {
        this.model = sequelize.define('pidor', {
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
            }
        });

        this.model.belongsTo(new User);
    }

    getModel() {
        return this.model;
    }
}