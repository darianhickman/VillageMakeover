
var Buy = {
    buy: function(assets) {

    },

    pay: function(reason) {
        $.ajax({
            url: '/api/pay',
            data: {amount: Buy._getAmount(reason),
                   csrf: API.user.csrf},
            dataType: 'json',
            type: 'POST',
            success: function(ret) {
                console.log('pay -> ', ret);
                if(ret.status == 'register')
                    location.href = 'pay.html?param=' + reason
            }
        })
    },

    _getAmount: function(reason) {
        return 2;
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
