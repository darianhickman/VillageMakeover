var DropDownMenu = {links:[]}
var getDropDownMenu = function(){
    var deferred = $.Deferred(),
        retryCount = 1,
        getData;

    getData = function(retryCount) {
        $.ajax({
            async: true,
            dataType: 'json',
            url: '/dropdownmenu',
            success: function (data) {
                for (var i = 0; i < data.length; i++) {
                    switch (data[i].Type) {
                        case "String":
                            DropDownMenu.links.push({id: data[i].Key, string: data[i].Value})
                            break;
                        default:
                            DropDownMenu[data[i].Key] = data[i].Value;
                            break;
                    }
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