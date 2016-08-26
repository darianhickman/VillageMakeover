var getGameCatalog = function(){
    var deferred = $.Deferred(),
        retryCount = 1,
        getData;

    getData = function(retryCount){
        $.ajax({
            async: true,
            dataType: 'text',
            url: '/catalog',
            success: function(data) {
                eval('(function(){' + data + '})();');
                deferred.resolve(data);
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
