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
        const t = this;
        return new t.Promise(function (fulfill) {
            t.Parser.parseImageUrls(query, function (urls) {
                let url = urls[Math.floor(Math.random() * urls.length)].url;
                console.log(url);
                fulfill(url);
            });
        });
    }
};