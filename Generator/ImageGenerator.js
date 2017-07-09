const rp = require('request-promise');
const cheerio = require('cheerio');
const Promise = require('promise');

function imageSearch(query) {
    let URL = 'http://images.google.com/search?tbm=isch&q='+encodeURIComponent(query);

    return new Promise(function (fulfill, reject) {
        rp(URL)
            .then(function(html) {
                let $ = cheerio.load(html);
                console.log(html);
                let imgNodes = $('#ires td a img');
                let aNodes = $('#ires td a');
                let urls = [];
                let hrefs = [];
                imgNodes.map(function(imgNodeIdx) {
                    let imgNode = imgNodes[imgNodeIdx];
                    urls.push(imgNode.attribs['src']);
                });
                aNodes.map(function(aNodeIdx) {
                    let aNode = aNodes[aNodeIdx];
                    console.log(aNode.attribs['href']);
                    hrefs.push(aNode.attribs['href']);
                });
                fulfill(urls[Math.floor(Math.random() * urls.length)]);
            });
    });
}

module.exports = imageSearch;