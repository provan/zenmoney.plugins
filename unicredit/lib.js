function getTags(tagName) {
}

// var GET_ATTRIBUTES_REGEX = /<node((\s+\w+=\"[^\"]+\")+)><\/node>/im;
// var GET_ATTRIBUTES_REGEX = /<(\w+)(?:(\s+(\w+)=\"([^\"]*)\")+)\s*\/?>/igm;

var GET_TAG_REGEX = /<(\w+)[^>]*\/?\s?>/igm;
var GET_ATTRIBUTE_REGEX = /\s+(\w+)=\"([^\"]*)\"/igm;

function xml2json(xml) {
    var tagMatch;
    var objArray = [];
    try {
        while (tagMatch = GET_TAG_REGEX.exec(xml)) {
            var tagString = tagMatch[0];
            var tagType = tagMatch[1];
            var jsonObject = {
                name: tagType,
                properties: {}
            };

            while (attrMatch = GET_ATTRIBUTE_REGEX.exec(tagString)) {
                var key = attrMatch[1];
                var value = attrMatch[2];

                jsonObject.properties[key] = value;
            }

            objArray.push(jsonObject);
        }
    }
    catch (e) {
        ZenMoney.trace('error: ' + e);
    }

    return objArray;
}

function getJson(xml) {
    var tags = getTags(xml);
    for (var i = 0; i < tags.length; i++) {
        var tag = tags[i];
        var attributes = xml2json(tag);
    }
}

var defaultHeaders = {
    'Content-Type': 'application/x-www-form-urlencoded',
    'User-Agent': 'UniCredit%20Mobile/2.18.23.1 CFNetwork/808.3 Darwin/16.3.0',
    'Connection': 'keep-alive',
    'Accept': '*/*',
    'Accept-Language': 'ru',
    'Content-Length': '131',
    'Accept-Encoding': 'gzip, deflate',
    'Cache-Control': 'max-age=0'
};