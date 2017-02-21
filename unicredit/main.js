var _appSettings;
var _deviceId;

function main() {
    _appSettings = ZenMoney.getPreferences();
    if (!_appSettings.login) throw new ZenMoney.Error("Введите логин в интернет-банк.", null, true);
    if (!_appSettings.password) throw new ZenMoney.Error("Введите пароль в интернет-банк.", null, true);

    getDeviceId();

    var sessionId = login(_appSettings.login, _appSettings.password);

    ZenMoney.trace('SESSION_ID: ' + sessionId);

    var accounts = processAccounts(sessionId);
    processTransactions(accounts, sessionId);

    ZenMoney.saveData();
    ZenMoney.setResult({ success: true });
}

function getDeviceId() {
    _deviceId = ZenMoney.getData('deviceId');
    if (!_deviceId) {
        _deviceId = newGuid();
        ZenMoney.setData('deviceId', _deviceId);
    }
}

function login(login, password) {
    var loginRequest = {
        T: "rt_2Auth.CL",
        A: login,
        B: password,
        DeviceId: _deviceId,
        MobDevice: "apple",
        MobModel: "iPhone 5s (model A1457, A1518, A1528 (China), A1530 | Global)",
        MobOS: "iPhone OS 10.2.1",
        Console: "iphone",
        TIC: 1,
        L: "RUSSIAN",
        Scale: 2.000000,
        MODE: "NEW",
        appversion: "2.18.23.1"
    };

    var loginResponse = ZenMoney.requestPost(baseUrl, loginRequest, defaultHeaders);

    var jsonResponse = xml2json(loginResponse);
    var sessionId;
    for (var i = 0; i < jsonResponse.length; i++) {
        var item = jsonResponse[i];
        if (item.name != "information")
            continue;

        return item.properties.value;
    }
}

function processAccounts(sessionId) {
    var request = {
        T: 'RT_iphone_1common.start',
        Console: 'iphone',
        TIC: 0,
        SID: sessionId,
        L: 'RUSSIAN',
        Scale: '2.000000',
        MODE: 'NEW',
        appversion: '2.18.23.1'
    };

    var responseXml = ZenMoney.requestPost(baseUrl, request, defaultHeaders);

    var json = xml2json(responseXml);
    var foundAccounts = [];

    for (var i = 0; i < json.length; i++) {
        var node = json[i];

        var account = node.properties;
        if (node.name == "card") {
            if (ZenMoney.getLevel() >= 13 && ZenMoney.isAccountSkipped(account.account)) {
                continue;
            }

            foundAccounts.push({
                id: account.account,
                title: account.name,
                type: 'ccard',
                balance: parseFloat(account.ownfunds),
                syncID: [account.id]
            });
        }
        else if (node.name == "account") {
            if (ZenMoney.getLevel() >= 13 && ZenMoney.isAccountSkipped(account.number)) {
                continue;
            }

            foundAccounts.push({
                id: account.number,
                title: account.name,
                type: 'checking',
                balance: parseFloat(account.rest),
                syncID: [account.number.substring(account.number.length - 4)]
            });
        }
    }

    ZenMoney.addAccount(foundAccounts);
    ZenMoney.trace('Всего счетов добавлено: ' + foundAccounts.length);

    var accountsMap = {};
    for (var i = 0; i < foundAccounts.length; i++) {
        var acc = foundAccounts[i];
        accountsMap[acc.id] = acc;
    }

    return accountsMap;
}

function getDateString(date) {
    var day = date.getDate();
    var month = date.getMonth() + 1;
    var year = date.getFullYear();

    return `${("0" + day).slice(-2)}.${("0" + month).slice(-2)}.${year}`;
}

function processTransactions(accounts, sessionId) {
    var lastSyncDate = getLastSyncDate();
    var startDate = getDateString(new Date(lastSyncDate));
    var endDate = getDateString(new Date());

    var getHistoryRequest = {
        T: "rt_iphone_1Common.FORM",
        SCHEMENAME: "history",
        STM: 1,
        Datewith: startDate,
        DateOn: endDate,
        Console: "iphone",
        TIC: 0,
        SID: sessionId,
        L: "RUSSIAN",
        Scale: '2.000000',
        MODE: "NEW",
        appversion: "2.18.23.1"
    };

    var xml = ZenMoney.requestPost(baseUrl, getHistoryRequest, defaultHeaders);
    updateTransactions(accounts, xml2json(xml));
}

function getLastSyncDate() {
    var lastSyncDate = ZenMoney.getData('last_sync', 0);
    var now = Date.now();

    if (lastSyncDate == 0)
        lastSyncDate = now - FIRST_SYNC_PERIOD * 24 * 60 * 60 * 1000;

    return Math.min(lastSyncDate, Date.now() - 7 * 24 * 60 * 60 * 1000);
}

function updateTransactions(accounts, json) {
    ZenMoney.trace(`Found ${json.length} transactions`)
    for (var i = 0; i < json.length; i++) {
        var node = json[i];
        var item = node.properties;
        var tran;

        if (node.name != 'stmitem')
            continue;

        var accountId = getCardId(item.card);
        var account = accounts[accountId];
        var floatAmount = parseFloat(item.amount);

        if (floatAmount > 0) {
            tran = {};
            tran.income = parseFloat(item.amount);
            tran.incomeAccount = accountId;
            tran.outcome = 0;
            tran.outcomeAccount = accountId;
            tran.payee = item.name;

            // операция в валюте
            if (account.currency != item.CUR) {
                tran.opIncome = floatAmount;
                tran.opIncomeInstrument = item.CUR;
            }
        }
        else {
            tran = {};
            tran.outcome = -floatAmount;
            tran.outcomeAccount = accountId;
            tran.income = 0;
            tran.incomeAccount = accountId;
            tran.comment = item.paymentPurpose;
            tran.payee = item.contragentName;
            tran.opOutcomeInstrument = item.CUR;

            // операция в валюте
            if (account.currency != item.CUR) {
                tran.opOutcome = -floatAmount;
            }
        }

        if (tran)
            ZenMoney.addTransaction(tran);
    }
}

var cardNumberRegex = /\d+/;
function getCardId(inputString) {
    var result = cardNumberRegex.exec(inputString);
    if (!result)
        throw "Can't parse account id";
    return result[0];
}