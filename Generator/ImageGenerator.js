const rp = require('request-promise');
const cheerio = require('cheerio');
const Promise = require('Promise');

function imageSearch(query) {
    let URL = 'http://images.google.com/search?tbm=isch&q='+encodeURIComponent(query);

    return new Promise(function (fulfill, reject) {
        rp(URL)
            .then(function(html) {
                let $ = cheerio.load(html);
                let imgNodes = $('#ires td a img');
                let urls = [];
                imgNodes.map(function(imgNodeIdx) {
                    let imgNode = imgNodes[imgNodeIdx];
                    urls.push(imgNode.attribs['src']);
                });
                fulfill(urls[Math.floor(Math.random() * urls.length)]);
            });
    });
}

module.exports = imageSearch;