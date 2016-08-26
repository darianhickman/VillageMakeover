var GameEarnings = {earnings:{}}
var getGameEarnings = function() {
    var deferred = $.Deferred(),
        retryCount = 1,
        getData;

    getData = function(retryCount) {
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
            },
            error : function(jqXHR, textStatus, errorThrown ){
                if(retryCount === parseInt(GameConfig.config['URLRetryCount'])){
                    deferred.reject();
                    return;
                }
                retryCount++;
                getData(retryCount);
            }
        })
    }
    getData(retryCount);
    return deferred.promise();
}