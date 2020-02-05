var htmlparser = require("htmlparser2");

var Parser = function (request) {
    this.request = request;
};

Parser.prototype.parseKnowledgeGraphCarousel = function (query, callback) {
    var encodedQuery = encodeURIComponent(query),
        options = {
            url: "https://www.google.com.ua/search?q=" + encodedQuery,
            headers: {
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/55.0.2883.87 Safari/537.36"
            }
        };

    this.request(options, function (error, response, body) {
        if (!error && response.statusCode == 200) {
            callback(parseKnowledgeGraphCarousel(body));
        } else {
            callback([]);
        }
    });
};

function parseKnowledgeGraphCarousel(html) {
    var results = [],
        parser = new htmlparser.Parser({
            onopentag: function (name, attribs) {
                if (name === "a" && attribs.class === "klitem") {
                    var match = attribs["title"].match(/\((\d+)\)/);
                    if (match != null && match.length > 0) {
                        results.push({
                            title: attribs["aria-label"],
                            year: Number(match[1])
                        });
                    } else {
                        results.push({
                            title: attribs["aria-label"]
                        });
                    }
                    match = null;
                }
            },
            ontext: function () {
            },
            onclosetag: function () {
            }
        }, {
            decodeEntities: true
        });
    parser.write(html);
    parser.end();

    return results;
}

Parser.prototype.parseImageUrls = function (query, callback) {
    var encodedQuery = encodeURIComponent(query),
        options = {
            url: "https://www.google.com.ua/search?q=" + encodedQuery + "&tbm=isch",
            headers: {
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/55.0.2883.87 Safari/537.36"
            }
        };

    this.request(options, function (error, response, body) {
        console.log(response.statusCode);
        if (!error && response.statusCode == 200) {
            callback(parseImageUrls(body));
        } else {
            callback([]);
        }
    });
};

function parseImageUrls(html) {
    let results = [],
        isInsideMetaTag = false,
        count = 0,
        i = 0,
        parser = new htmlparser.Parser({
            onopentag: function (name, attribs) {
                if (name === "img" && attribs.class && attribs.class.includes("rg_i")) {
                    isInsideMetaTag = true;
                    console.log(attribs);
                    console.log('[onopentag] isInsideMetaTag: ' + name + ' i: ' + i);
                }
                i++;
            },
            ontext: function (text) {
                console.log('[ontext] isInsideMetaTag: ' + isInsideMetaTag + ' i: ' + i);
                if (isInsideMetaTag && count < 12) {
                    var metaObject = JSON.parse(text);
                    console.log(metaObject);
                    results.push({
                        url: metaObject.ou,
                        caption: metaObject.pt,
                        dimensions: metaObject.ow + "x" + metaObject.oh
                    });
                    count++;
                }
            },
            onclosetag: function (tagname) {
                if (isInsideMetaTag && tagname === "div") {
                    isInsideMetaTag = false;
                }
            }
        }, {
            decodeEntities: true
        });
    parser.write(html);
    parser.end();

    return results;
}

Parser.prototype.parseKnowledgeGraphPanel = function (query, callback) {
    var encodedQuery = encodeURIComponent(query),
        options = {
            url: "https://www.google.com.ua/search?q=" + encodedQuery,
            headers: {
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/55.0.2883.87 Safari/537.36"
            }
        };

    this.request(options, function (error, response, body) {
        if (!error && response.statusCode == 200) {
            callback(parseKnowledgeGraphPanel(body));
        } else {
            callback([]);
        }
    });
};

function parseKnowledgeGraphPanel(html) {
    var result = {},
        isInsideTitleTag = false,
        isInsideContextItemTag = false,
        isInsideKeyTag = false,
        isInsideValueTag = false,
        title = "",
        key = "",
        value = "",
        parser = new htmlparser.Parser({
            onopentag: function (name, attribs) {
                if (name === "div" && attribs.class && attribs.class.includes("kno-ecr-pt") && attribs.class.includes("kno-fb-ctx")) {
                    isInsideTitleTag = true;
                }
                if (name === "div" && attribs.class && attribs.class.includes("kno-fb-ctx")) {
                    isInsideContextItemTag = true;
                }
                if (isInsideContextItemTag && name === "span" && attribs.class && !attribs.class.includes("kno-fv")) {
                    isInsideKeyTag = true;
                }
                if (isInsideContextItemTag && name === "span" && attribs.class && attribs.class.includes("kno-fv")) {
                    isInsideValueTag = true;
                }
            },
            ontext: function (text) {
                if (isInsideTitleTag) {
                    title = text;
                }
                if (isInsideKeyTag) {
                    key = key + text;
                }
                if (isInsideValueTag) {
                    value = value + text;
                }
            },
            onclosetag: function (tagname) {
                if (isInsideTitleTag && tagname === "div") {
                    result.title = title;
                    isInsideTitleTag = false;
                }
                if (isInsideContextItemTag && tagname === "div") {
                    isInsideContextItemTag = false;
                }
                if (isInsideKeyTag && tagname === "span") {
                    isInsideKeyTag = false;
                    key = key.replace(": ", "").toLowerCase();
                }
                if (isInsideValueTag && tagname === "span") {
                    isInsideValueTag = false;

                    if (value.includes(",")) {
                        value = value.replace(/, /g, ",").split(",");
                    }

                    result[key] = value;
                    key = "";
                    value = "";
                }
            }
        }, {
            decodeEntities: true
        });
    parser.write(html);
    parser.end();

    return result;
}

module.exports = Parser;
