var request = require("request");
var Parser = require("google-search-parser2");
var parser = new Parser(request);
const Promise = require('promise');

function imageSearch(query) {
    let URL = 'http://images.google.com/search?tbm=isch&q='+encodeURIComponent(query);

    return new Promise(function (fulfill, reject) {
        parser.parseImageUrls(searchTerm, function (urls) {
            // console.log(urls); // [ { url: "https://upload.wikimedia.org/wikipedia/en/f/f4/Supermarioworld.jpg", caption: "foo" }, { url: "http ...
            let url = urls[Math.floor(Math.random() * urls.length)].url;
            console.log(url);
            fulfill(url);
        });
        // fulfill(urls[Math.floor(Math.random() * urls.length)]);
    });
}

module.exports = imageSearch;