var GameAssets = {assets:{}}
var getGameAssets = function(){
    var deferred = $.Deferred();
    $.ajax({
        async: true,
        dataType: 'json',
        method: 'POST',
        data: {worksheet: 'assets'},
        url: '/config',
        success: function(data) {
            GameAssets.assets = data
            deferred.resolve("ok");
        }
    })
    return deferred.promise();
}