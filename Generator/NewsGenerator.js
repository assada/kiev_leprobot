const Promise = require('promise');
const request = require('request');
const winston = require('winston');
const googl = require('goo.gl');
googl.setKey('AIzaSyA9i1EFuezxTxIb_AfFHK_nk4mmjQJ0bUo');

module.exports = class NewsGenerator {
    get() {
        winston.info('Loading news');
        let t = this;
        return new Promise(function (fulfill, reject) {
            request({uri: 'https://www.ukr.net/news/dat/kiev/1/', method: 'GET', encoding: 'binary'},
                function (err, res, page) {

                    let json = JSON.parse(page);
                    let tops = json.tops;
                    winston.info('Start: ' + tops.length);
                    tops = tops.filter(function (top) {
                        return typeof top.Dups !== 'undefined';
                    });
                    winston.info('End: ' + tops.length);

                    t.fetchResult(tops).then(function (result) {
                        result = result.slice(0,10);
                        winston.info(result.length);
                        fulfill(result);
                    })
                });
        });
    }

    fetchResult(tops) {
        return new Promise(function (fulfill, reject) {
            let result = [];
            tops.forEach(function (topic) {
                googl.shorten(topic.Url)
                    .then(function (shortUrl) {
                        result.push({title: topic.Title, link: shortUrl})
                    })
                    .catch(function (err) {
                        console.error(err.message);
                    });
            });

            Promise.all(result).then(function(results) {
                fulfill(results)
            }).catch(function(err){
                winston.error(err);
            });
        });

    }
};