
var Buy = {

    // need some details on how this works.
    buy: function(assets) {
        ige.$('buyStatus').startTransaction()
        Buy.pay(assets, function(amount, vbucks) {
            mixpanel.track("Cash buy");
            Buy._addAssets(assets);
            ige.$('buyStatus').transactionSuccess(amount, vbucks)
        }, function(amount, vbucks) {
            ige.$('buyStatus').transactionFailed(function() {
                location.href = 'pay.html?param=' + Buy.createReason(assets) + '&loginStatus=' + API.loginStatus + '&userID=' + API.user.id + '&amount=' + amount + '&vbucks=' + vbucks;
            })
        });
    },

    createReason: function(assets) {
        var rand = Math.random().toString(36).substring(7);
        var msg = rand + ';' + window.btoa(JSON.stringify(assets));
        var hash = CryptoJS.HmacSHA1(msg,
                                     API.user.csrf);
        document.cookie = 'continue_transaction=' + rand
        return hash.toString() + '-' + window.btoa(msg);
    },

    pay: function(assets, success, fail) {
        console.log('buy ', assets);
        $.ajax({
            url: '/api/pay',
            data: {amount: Buy._getAmount(assets),
                   csrf: API.user.csrf,
                   id: API.user.id,
                   loginStatus: API.loginStatus},
            dataType: 'json',
            type: 'POST',
            success: function(ret) {
                console.log('pay -> ', ret);
                if(ret.status == 'register')
                    location.href = 'pay.html?param=' + Buy.createReason(assets) + '&loginStatus=' + API.loginStatus + '&userID=' + API.user.id + '&amount=' + ret.amount + '&vbucks=' + ret.vbucks;
                else if(ret.status == 'ok')
                    success(ret.amount, ret.vbucks)
                else
                    fail(ret.amount, ret.vbucks)
            }
        })
    },

    _addAssets: function(assets) {
        var addFuncs = {'coins': API.addCoins,
                        'cash': API.addCash}
        var msgRest = []
        for(var what in addFuncs) {
            var coins = assets[what];
            coins = parseInt(coins, 10);
            if(coins != coins) coins = 0;
            if(coins != 0) {
                addFuncs[what](coins)
                msgRest.push(coins + " " + what)
            }
        }
        console.log("You have just purchased " + msgRest.join(' and '));
        //add twinkle or effect to where you enchance numbers.
    },

    _getAmount: function(assets) {
        if(!(0 <= assets.coins && 0 <= assets.cash)) // also catch NaNs
            throw "error " + JSON.stringify(assets);
        return JSON.stringify(assets);
    },

    getQueryVariable: function(query, variable) {
        var vars = query.split('&');
        for (var i = 0; i < vars.length; i++) {
            var pair = vars[i].split('=');
            if (decodeURIComponent(pair[0]) == variable) {
                return decodeURIComponent(pair[1]);
            }
        }
        console.log('Query variable %s not found', variable);
    }
}

API._buyCallback = function() {
    var payReason = Buy.getQueryVariable(location.hash.slice(1), 'pay');

    if(!payReason) return;

    console.warn('pay callback ', payReason)

    var index = payReason.indexOf('-');
    var hash = payReason.slice(0, index);
    var msg = window.atob(payReason.slice(index + 1));
    var exphash = CryptoJS.HmacSHA1(msg,
                                    API.user.csrf).toString();
    if(hash != exphash) {
        console.error('CSRF validation error');
        return;
    }

    var exp_transaction_id = getCookie('continue_transaction');

    if(!exp_transaction_id) {
        console.error('missing continue transaction cookie');
        return;
    }

    document.cookie = 'continue_transaction=' + Math.random().toString(36).substring(7);
    var aindex = msg.indexOf(';');
    var transaction_id = msg.slice(0, aindex);
    var data = msg.slice(aindex + 1);
    if(transaction_id != exp_transaction_id) {
        console.error('bad transaction id');
        return;
    }

    console.log('transaction validated!', transaction_id, hash, data, window.atob(data))

    var assets = JSON.parse(window.atob(data));
    Buy.buy(assets);
    location.hash = '#';
}
