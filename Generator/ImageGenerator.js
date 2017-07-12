const request = require("request");
const Parser = require("google-search-parser2");
const parser = new Parser(request);
const Promise = require('promise');

/**
 *
 * @param query
 * @returns {*|Promise}
 */
function imageSearch(query) {
    const URL = 'http://images.google.com/search?tbm=isch&q=' + encodeURIComponent(query);

    return new Promise(function (fulfill, reject) {
        parser.parseImageUrls(query, function (urls) {
            let url = urls[Math.floor(Math.random() * urls.length)].url;
            console.log(url);
            fulfill(url);
        });
    });
}

module.exports = imageSearch;