var GameEarnings = {earnings:{}}
var getGameEarnings = function() {
    var deferred = $.Deferred();
    $.ajax({
        async: true,
        dataType: 'json',
        method: 'POST',
        data: {worksheet: 'earnings'},
        url: '/config',
        success: function (data) {
            for (var i = 0; i < data.length; i++) {
                var row = data[i]
                GameEarnings.earnings[row.event] = GameEarnings.earnings[row.event] || []
                GameEarnings.earnings[row.event].push({asset: row.asset, amount: row.amount})
            }
            deferred.resolve("ok");
        }
    })
    return deferred.promise();
}