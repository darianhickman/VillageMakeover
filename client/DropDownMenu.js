var DropDownMenu = {links:[]}
var getDropDownMenu = function(){
    var deferred = $.Deferred();
    $.ajax({
        async: true,
        dataType: 'json',
        url: '/dropdownmenu',
        success: function(data) {
            for(var i = 0; i < data.length; i++){
                switch (data[i].Type){
                    case "String":
                        DropDownMenu.links.push({id: data[i].Key, string: data[i].Value})
                        break;
                    default:
                        DropDownMenu[data[i].Key] = data[i].Value;
                        break;
                }
            }
            deferred.resolve("ok");
        }
    })
    return deferred.promise();
}