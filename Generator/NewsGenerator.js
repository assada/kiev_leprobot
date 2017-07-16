'use strict';

/**
 * News Generator
 *
 * @param {Promise}
 * @param {request} Request
 * @param {winston} Winston
 *
 * @type {NewsGenerator}
 */
module.exports = class NewsGenerator {
    constructor(Promise, Request, winston, googl) {
        this.Promise = Promise;
        this.request = Request;
        this.winston = winston;
        this.googl = googl;
    }

    /**
     *
     * @returns {Promise}
     */
    get() {
        this.winston.info('Loading news');
        let t = this;
        return new t.Promise(function (fulfill) {
            t.request({uri: 'https://www.ukr.net/news/dat/kiev/1/', method: 'GET', encoding: 'binary'},
                function (err, res, page) {
                    let json = JSON.parse(page);
                    let tops = json.tops;
                    t.winston.info('Total news: ' + tops.length);
                    tops = tops.filter(function (top) {
                        return typeof top.Dups !== 'undefined';
                    });
                    t.winston.info('Top news: ' + tops.length);
                    t.Promise.all(tops.map(function (topic) {
                        return new t.Promise(function (resolve) {
                            t.googl.shorten(topic.Url)
                                .then(function (shortUrl) {
                                    resolve({title: topic.Title, link: shortUrl});
                                });
                        });
                    })).then(function (result) {
                        let r = result.slice(0, 10);
                        fulfill(r)
                    });
                });
        });
    }
};