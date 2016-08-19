var SpecialEvents = {events:[]}
var getSpecialEvents = function(){
    var deferred = $.Deferred();
    $.ajax({
        async: true,
        dataType: 'json',
        url: '/specialevents',
        success: function(data) {
            for(var i = 0; i < data.length; i++){
                var item = data[i]
                SpecialEvents.events[item.ID] = {'id': item.ID,
                    'displayName': item.DisplayName,
                    'time': item.Time,
                    'startCell': item.StartCell,
                    'endCell': item.EndCell,
                    'speedValue': item.SpeedValue,
                    'notifyIcon': item.NotifyIcon,
                    'notifyIconEasing': item.NotifyIconEasing
                };
            }
            deferred.resolve("ok");
        }
    })
    return deferred.promise();
}