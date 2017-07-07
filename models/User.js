'use strict';

const s = require("sequelize");

module.exports = class User {
    constructor(sequelize) {
        this.model = sequelize.define('user', {
            id: {
                type: s.INTEGER,
                primaryKey: true,
                autoIncrement: true
            },
            user: {
                type: s.BIGINT(100)
            },
            first_name: {
                type: s.STRING,
                allowNull: true,
                defaultValue: null,
            },
            last_name: {
                type: s.STRING,
                allowNull: true,
                defaultValue: null,
            },
            username: {
                type: s.STRING,
                allowNull: true,
                defaultValue: null,
            },
            language_code: {
                type: s.STRING,
                allowNull: true,
                defaultValue: null,
            }
        });
    }

    getModel() {
        return this.model;
    }
}
