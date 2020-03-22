'use strict';

/**
 * News Generator
 *
 * @param {Promise}
 * @param {request} Request
 * @param {winston} Winston
 *
 * @type {CoronaGenerator}
 */
module.exports = class CoronaGenerator {
    constructor(Promise, Request, winston) {
        this.Promise = Promise;
        this.request = Request;
        this.winston = winston;
    }

    /**
     * @returns {Promise}
     */
    all() {
        this.winston.info('Loading corona');
        let t = this;
        return new this.Promise(function (fulfill) {
            t.request({uri: 'https://coronavirus-19-api.herokuapp.com/all', method: 'GET', encoding: 'binary'},
                function (err, res, page) {
                    let json = JSON.parse(page);

                    fulfill(json);
                });
        });
    }

    /**
     * @returns {Promise}
     */
    ua() {
        this.winston.info('Loading corona');
        let t = this;
        return new this.Promise(function (fulfill) {
            t.request({uri: 'https://coronavirus-19-api.herokuapp.com/countries/Ukraine', method: 'GET', encoding: 'binary'},
                function (err, res, page) {
                    let json = JSON.parse(page);

                    fulfill(json);
                });
        });
    }
};
