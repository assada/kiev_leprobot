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
        return new this.Promise(function (fulfill, reject) {
            try {
                t.request({uri: 'https://coronavirus-19-api.herokuapp.com/all', method: 'GET', encoding: 'binary'},
                    function (err, res, page) {
                        if (err) reject(err);
                        let json = {};
                        try {
                            json = JSON.parse(page);
                        } catch (e) {
                            reject(e);
                        }


                        fulfill(json);
                    });
            } catch (e) {
                reject(e);
            }

        });
    }

    /**
     * @returns {Promise}
     */
    ua() {
        this.winston.info('Loading corona');
        let t = this;
        return new this.Promise(function (fulfill, reject) {
            try {
                t.request({
                        uri: 'https://coronavirus-19-api.herokuapp.com/countries/Ukraine',
                        method: 'GET',
                        encoding: 'binary'
                    },
                    function (err, res, page) {
                        if (err) reject(err);
                        let json = {};
                        try {
                            json = JSON.parse(page);
                        } catch (e) {
                            reject(e);
                        }


                        fulfill(json);
                    });
            } catch (e) {
                reject(e);
            }

        });
    }
};
