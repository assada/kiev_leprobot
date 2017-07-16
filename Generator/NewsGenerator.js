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
        return new this.Promise(function (fulfill) {
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
                        t.winston.info('Try shorting url: ' + topic.Url);
                        return new t.Promise(function (resolve, fail) {
                            t.winston.info('processing...');
                            t.googl.shorten(topic.Url)
                                .then(function (shortUrl) {
                                    t.winston.info('Done: ' + shortUrl);
                                    resolve({title: topic.Title, link: shortUrl});
                                }).catch(function (err) {
                                fail(err);
                            });
                        });
                    })).then(function (result) {
                        let r = result.slice(0, 10);
                        t.winston.info('After slice: ' + r.length);
                        fulfill(r)
                    });
                });
        });
    }
};