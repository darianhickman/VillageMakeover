var SpecialEvents = {events:[]}
var getSpecialEvents = function(){
    var deferred = $.Deferred(),
        retryCount = 1,
        getData;

    getData = function(retryCount) {
        $.ajax({
            async: true,
            dataType: 'json',
            url: '/specialevents',
            success: function (data) {
                for (var i = 0; i < data.length; i++) {
                    var item = data[i]
                    SpecialEvents.events[item.ID] = {
                        'id': item.ID,
                        'displayName': item.DisplayName,
                        'description': item.Description,
                        'cost': item.Cost,
                        'time': item.Time,
                        'startCell': item.StartCell,
                        'endCell': item.EndCell,
                        'speedValue': item.SpeedValue,
                        'speedText': item.SpeedText,
                        'notifyIcon': item.NotifyIcon,
                        'notifyIconEasing': item.NotifyIconEasing
                    };
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