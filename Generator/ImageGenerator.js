'use strict';

/**
 * Search image by query
 *
 * @param {Promise} Promise
 * @param {GoogleSearchParser} parser
 *
 * @type {ImageGenerator}
 */
module.exports = class ImageGenerator {
    constructor(Promise, parser) {
        this.Promise = Promise;
        this.Parser = parser;
    }

    /**
     * Return random image
     * @param {string} query
     * @returns {Promise}
     */
    get(query) {
        return new this.Promise(function (fulfill, reject) {
            this.Parser.parseImageUrls(query, function (urls) {
                let url = urls[Math.floor(Math.random() * urls.length)].url;
                fulfill(url);
            });
        });
    }
};