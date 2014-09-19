
var API = {
    init: function() {
        $.ajax({
            url: '/api/get_user',
            dataType: 'json',
            success: function(result) {
                if(result.status === 'ok') {
                    API.user = result
                } else {
                    location.href = result.login_url
                }
                API.loadState()
            }
        })
    },

    loadState: function() {
        $.ajax({
            url: '/api/get_state',
            dataType: 'json',
            success: function(result) {
                console.log('loaded state', result)
                var first = !API.state.objects
                API.state = result
                if(first)
                    API.firstReloadState()
                API.reloadState()
            }
        })
    },

    reduceCoins: function(by) {
        if(by > API.state.coins)
            return false
        API.state.coins -= by
        API.reloadState()
        API.saveState()
        return true
    },

    addCoins: function(by) {
        API.state.coins += by
        API.reloadState()
        API.saveState()
        return true
    },

    saveState: function() {
        $.ajax({
            url: '/api/save_state',
            dataType: 'json',
            method: 'POST',
            data: {state: JSON.stringify(API.state),
                   csrf: API.user.csrf},
        })
    },
    firstReloadState: function() {
        var objects = API.state.objects || []
        for(var i in objects) {
            ClientHelpers.addObject(objects[i])
        }
    },
    reloadState: function() {
        ClientHelpers.guiSetCoins(API.state.coins)
    },
    createObject: function(obj) {
        console.log("ige create object", obj)
        if(!API.state.objects)
            API.state.objects = []
        API.state.objects.push(obj)
        API.saveState()
    },
    state: {},
    user: null,
}
