function buy(coins) {
    $.ajax({
        url: '/buy',
        dataType: 'json',
        data: {'coins': coins},
        success: function(data) {
            buy_jwt(data.token)
        }
    })
}

function buy_jwt(jwt) {
    google.payments.inapp.buy({
        'jwt'     : jwt,
        'success' : function(data) {
            console.log(data)
            var coins = getQueryVariable(data.request.sellerData, 'coins')
            coins = parseInt(coins, 10)
            alert("You have just purchased " + coins + " coins")
            API.addCoins(coins)
        },
        'failure' : function() {
            alert("FAIL!");
        }
    });
}

function getQueryVariable(query, variable) {
    var vars = query.split('&');
    for (var i = 0; i < vars.length; i++) {
        var pair = vars[i].split('=');
        if (decodeURIComponent(pair[0]) == variable) {
            return decodeURIComponent(pair[1]);
        }
    }
    console.log('Query variable %s not found', variable);
}
