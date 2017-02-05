function main() {
    var xml = ZenMoney.retrieveCode('lala');

    var items = xml2json(xml);
    for (var i = 0; i < items.length; i++) {
        var item = items[i];
        if (item.name == 'stmitem') {
            ZenMoney.trace(item.properties.date + ' ' + item.properties.amount + ' ' + item.properties.name)
        }
    }

    // let preferences = ZenMoney.getPreferences();

    // if (!preferences.login) throw new ZenMoney.Error("Введите логин в интернет-банк!", null, true);
    // if (!preferences.password) throw new ZenMoney.Error("Введите пароль в интернет-банк!", null, true);
    // if (!preferences.pin) throw new ZenMoney.Error("Введите ПИН-код мобильного приложения Сбербанк Онлайн!", null, true);

    // let authToken = tryLogin();
    // loadAccounts(authToken);
    // loadTransactions(authToken);

    ZenMoney.setResult({ success: true });
}

var CARDS_REGEXP = /<node((\s+\w+=\"[^\"]+\")+)><\/node>/im;

function loadAccounts() {
    let html = ZenMoney.requestGet(ACCOUNTS_URI);

    let cardNodes = getCardNodes(html);
    let accountNodes = getAccountNodes(html);

    for (let i = 0; i < cardNodes.length; i++) {
        let card = getCard(cardNodes[i]);
        ZenMoney.addAccount(card);
    }

    for (let i = 0; i < accountNodes.length; i++) {
        let account = getAccount(accountNodes[i]);
        ZenMoney.addAccount(account);
    }

    // var myregexp = /<node((\s+\w+=\"[^\"]+\")+)><\/node>/im;
    // var match = myregexp.exec("<Node attribute=\"one\" attribute2=\"two\" n=\"nth\"></node>");
    // if (match != null) {
    // 	result = match[1].trim();
    //   var arrayAttrs = result.split(/\s+/);
    //   for(var a = 0; a<arrayAttrs.length;a++){
    //   	alert(arrayAttrs[a]);
    //   }
    // }
}

function getCard(node) {
    throw "not implemented";
}

function account(node) {
    throw "not implemented";
}

function getCardNodes(html) {
    throw "not implemented";
}

function getAccountNodes(html) {
    throw "not implemented";
}

function tryLogin() {
    throw "not implemented";
}