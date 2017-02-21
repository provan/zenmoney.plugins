var defaultHeaders = {
    'Content-Type': 'application/x-www-form-urlencoded',
    'User-Agent': 'UniCredit Mobile/2.18.23.1 CFNetwork/808.3 Darwin/16.3.0',
    'Connection': 'keep-alive',
    'Accept': '*/*',
    'Accept-Language': 'ru',
    'Accept-Encoding': 'gzip, deflate',
    'Cache-Control': 'max-age=0'
};

var baseUrl = 'https://enter.unicredit.ru/v2/cgi/bsi.dll';

var GET_TAG_REGEX = /<(\w+)[^>]*\/?\s?>/igm;
var GET_ATTRIBUTE_REGEX = /\s+(\w+)=\"([^\"]*)\"/igm;
var FIRST_SYNC_PERIOD = 6*30;

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

function newGuid() {
    return s4() + s4() + '-' + s4() + '-' + s4() + '-' + s4() + '-' + s4() + s4() + s4();
}

function s4() {
    return Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
}