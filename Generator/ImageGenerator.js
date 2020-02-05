'use strict';

/**
 * Search image by query
 *
 * @param {Promise} Promise
 * @param {imageClient} parser
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
        return new t.Promise(function (fulfill, reject) {
            t.Parser.search(query, {page: 1})
                .then(images => {
                    let randomImage = images[Math.floor(Math.random() * images.length)];
                    fulfill(randomImage.url);
                })
                .catch(function (e) {
                    reject(e);
                });
        });
    }
};
