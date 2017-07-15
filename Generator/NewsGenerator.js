const Promise = require('promise');
const request = require('request');
const winston = require('winston');

module.exports = class NewsGenerator {
    get() {
        winston.info('Loading news');
        return new Promise(function (fulfill, reject) {
            request({uri: 'https://www.ukr.net/news/dat/kiev/1/', method: 'GET', encoding: 'binary'},
                function (err, res, page) {
                    let result = [];
                    let json = JSON.parse(page);
                    let tops = json.tops;
                    tops.filter(function (top) {
                        return typeof top.Dops !== 'undefined';
                    });
                    tops.forEach(function (topic) {
                        result.push({title: topic.Title, link: topic.Url})
                    });
                    if(result.length > 10) {
                        result.slice(0,10);
                    }
                    fulfill(result);
                });
        });
    }
};