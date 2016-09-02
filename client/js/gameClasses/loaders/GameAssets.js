var GameAssets = {assets:{}}
var getGameAssets = function(){
    var deferred = $.Deferred(),
        retryCount = 1,
        getData;

    getData = function(retryCount) {
        $.ajax({
            async: true,
            dataType: 'json',
            method: 'POST',
            data: {worksheet: 'assets'},
            url: '/config',
            success: function (data) {
                GameAssets.assets = data
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