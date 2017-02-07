function main() {
    let preferences = ZenMoney.getPreferences();

    if (!preferences.login) throw new ZenMoney.Error("Введите логин в интернет-банк.", null, true);
    if (!preferences.password) throw new ZenMoney.Error("Введите пароль в интернет-банк.", null, true);
    // if (!preferences.pin) throw new ZenMoney.Error("Введите ПИН-код мобильного приложения Enter-Unicredit.", null, true);

    // login();
    loadAccounts();
    // loadTransactions(authToken);

    ZenMoney.setResult({ success: true });
}

function login() {
    throw 'not implemented';
}

//var baseUrl = 'https://enter.unicredit.ru/v2/cgi/bsi.dll';
var baseUrl = 'https://localhost/v2/cgi/bsi.dll';
function loadAccounts(sessionId) {
    // var request = {
    //     T: 'RT_iphone_1common.start',
    //     Console: 'iphone',
    //     TIC: 0,
    //     SID: 'VOPFGRWGVK.460927.S9FOMJ*',
    //     L: 'RUSSIAN',
    //     Scale: 2.000000,
    //     MODE: 'NEW',
    //     appversion: '2.18.23.1'
    // };

    // var responseXml = ZenMoney.requestPost(baseUrl, request, defaultHeaders);

    var responseXml = ZenMoney.retrieveCode();
    var json = xml2json(responseXml);
    var foundAccounts = [];

    for (var i = 0; i < json.length; i++) {
        var node = json[i];

        var account = node.properties;
        if (node.name == "card") {

            if (ZenMoney.getLevel() >= 13 && ZenMoney.isAccountSkipped(account.id)) {
                continue;
            }

            foundAccounts.push({
                id: account.id,
                title: account.name,
                type: 'ccard',
                balance: parseFloat(account.ownfunds),
                // syncID: [account.number.substring(account.number.length - 4)]
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

        ZenMoney.trace('done with ' + node.name);
    }

    ZenMoney.trace('Всего счетов добавлено: ' + foundAccounts.length);
    ZenMoney.addAccount(foundAccounts);
}