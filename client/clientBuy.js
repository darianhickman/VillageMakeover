
var Buy = {
    buy: function(assets) {
        $.ajax({
            url: '/buy?coins=' + (assets.coins || 0) + '&cash=' + (assets.cash || 0),
            dataType: 'json',
            success: function(data) {
                Buy.buyJWT(data.token)
            }
        })
    },

    buyJWT: function(jwt) {
        google.payments.inapp.buy({
            'jwt'     : jwt,
            'success' : function(data) {
                console.log(data)

                var addFuncs = {'coins': API.addCoins,
                              'cash': API.addCash}
                for(var what in addFuncs) {
                    var coins = Buy.getQueryVariable(data.request.sellerData, what)
                    coins = parseInt(coins, 10)
                    if(coins != coins) coins = 0
                    alert("You have just purchased " + coins + " " + what)
                    addFuncs[what](coins)
                }
            },
            'failure' : function() {
                alert("FAIL!");
            }
        });
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
