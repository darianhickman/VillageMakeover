
var Buy = {
    buy: function(coins) {
        $.ajax({
            url: '/buy?coins=' + coins,
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
                var coins = Buy.getQueryVariable(data.request.sellerData, 'coins')
                coins = parseInt(coins, 10)
                alert("You have just purchased " + coins + " coins")
                API.addCoins(coins)
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
