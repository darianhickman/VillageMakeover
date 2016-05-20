var getGameCatalog = function(){
    var deferred = $.Deferred();
    $.ajax({
        async: true,
        dataType: 'text',
        url: '/catalog',
        success: function(data) {
            eval('(function(){' + data + '})();');
            deferred.resolve(data);
        }
    })
    return deferred.promise();
}
