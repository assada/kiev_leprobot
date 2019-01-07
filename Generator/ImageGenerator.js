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
            try {
                t.Parser.parseImageUrls(query, function (urls) {
                    let randomImage = urls[Math.floor(Math.random() * urls.length)];
                    if(typeof randomImage !== 'undefined' && 'url' in randomImage) {
                        fulfill(randomImage.url);
                    } else {
                        reject('Url not found in images list for query: ' + query)
                    }
                });
            } catch (e) {
                console.log('IMAGE GENERATOR ERROR!');
            }

        });
    }
};