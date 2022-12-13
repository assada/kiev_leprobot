'use strict';
const crypto = require('crypto');

/**
 * Search image by query
 *
 * @param {Promise} Promise
 * @param {imageClient} parser
 *
 * @type {ImageGenerator}
 */
module.exports = class ImageGenerator {
    constructor(Promise, parser, cache) {
        this.Promise = Promise;
        this.Parser = parser;
        this.Cache = cache;
    }

    /**
     * Return random image
     * @param {string} query
     * @returns {Promise}
     */
    get(query) {
        const t = this;
        return new t.Promise(function (fulfill, reject) {
            let cacheKey = crypto.createHash('md5').update(query).digest("hex");
            if (!t.Cache.has(cacheKey)) {
                t.Parser.search(query, {page: 1})
                    .then(images => {
                        let c = t.Cache.set(cacheKey, images, 30 * 24 *60 * 60 * 1000);
                        console.log('Create cache ' + cacheKey);
                        let randomImage = images[Math.floor(Math.random() * images.length)];
                        fulfill(randomImage.url);
                    })
                    .catch(function (e) {
                        reject(e);
                    });
            } else {
                try {
                    console.log('Using cache for image query!');
                    let images = t.Cache.get(cacheKey);
                    let randomImage = images[Math.floor(Math.random() * images.length)];
                    fulfill(randomImage.url);
                } catch (e) {
                    reject(e);
                }

            }
        });
    }
};
