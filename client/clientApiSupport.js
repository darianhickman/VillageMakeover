
var API = {
    init: function(postinit_cb) {
        $.ajax({
            url: '/api/get_user',
            dataType: 'json',
            success: function(result) {
                API.user = result
                if(result.status === 'ok') {
                    API.loginStatus = "online"
                } else if(result.status === 'fail'){
                    location.href = result.login_url
                } else {
                    API.loginStatus = "offline"
                    if(localStorage.getItem('id') === null){
                        localStorage.setItem('id',ige.newIdHex())
                    }
                    API.user.id = localStorage.getItem('id')
                }
                postinit_cb()
                API.loadState()
                API._buyCallback()
            }
        })
    },

    _buyCallback: function() { console.error('missing buy callback') },

    loadState: function() {
        if(API.loginStatus === "offline"){
            //get local storage
            //no local storage crate one
            //has local storage load state
            if(localStorage.getItem('state') === null){
                localStorage.setItem('state',JSON.stringify(API.state))
            }
            console.log('loaded state from local storage', localStorage.getItem('state'))
            var first = !API.state.objects
            API.state = JSON.parse(localStorage.getItem('state'))
            if(first)
                API.firstReloadState()
            API.reloadState()

        }else if(API.loginStatus === "online"){
            $.ajax({
                url: '/api/get_state',
                dataType: 'json',
                success: function(result) {
                    console.log('loaded state', result)
                    var first = !API.state.objects
                    if(localStorage.getItem('state') !== null && result.first === 'true'){
                        API.state = JSON.parse(localStorage.getItem('state'))
                        API.state.first = 'false'
                        API.saveState()
                        localStorage.removeItem('state');
                        localStorage.removeItem('id');
                    }else if(localStorage.getItem('state') === null && result.first === 'true'){
                        API.state = result
                        API.state.first = 'false'
                        API.saveState()
                    }else{
                        API.state = result
                        //could show a warning that this is an existing user and local storage stands still
                    }
                    if(first)
                        API.firstReloadState()
                    API.reloadState()
                }
            })
        }
    },

    reduceAssets: function(assets) {
        console.log('reduce assets', assets)
        if(assets.coins > API.state.coins)
            return false
        if(assets.cash > API.state.cash)
            return false

        API.state.cash -= assets.cash
        API.state.coins -= assets.coins
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

    addCash: function(by) {
        API.state.cash += by
        API.reloadState()
        API.saveState()
        return true
    },

    saveState: function() {
        if(API.loginStatus === "offline"){
            localStorage.setItem('state',JSON.stringify(API.state))
        }else if(API.loginStatus === "online"){
            $.ajax({
                url: '/api/save_state',
                dataType: 'json',
                method: 'POST',
                data: {state: JSON.stringify(API.state),
                    csrf: API.user.csrf},
            })
        }
    },

    firstReloadState: function() {
        var objects = API.state.objects || [],
            isIDMissing = false;
        for(var i in objects) {
            if (objects[i].id === undefined){
                objects[i].id = ige.newIdHex()
                isIDMissing = true
            }
            API.stateObjectsLookup[objects[i].id] = API.state.objects[i]
            ClientHelpers.addObject(objects[i])
        }
        ClientHelpers.setPlayerPos()
        if(isIDMissing)
            API.saveState()
    },

    reloadState: function() {
        if(!API.state.coins)
            API.state.coins = 0
        if(!API.state.cash)
            API.state.cash = 0
        ClientHelpers.guiSetCoins(API.state.coins)
        ClientHelpers.guiSetCash(API.state.cash)
    },

    createObject: function(obj) {
        console.log("ige create object", obj)
        if(!API.state.objects)
            API.state.objects = []
        var newLength = API.state.objects.push(obj)
        API.stateObjectsLookup[obj.id] = API.state.objects[newLength-1]
        API.saveState()
    },

    updateObject: function(obj, newX, newY) {
        console.log("ige update object", obj)
        API.stateObjectsLookup[obj.id()].x = newX
        API.stateObjectsLookup[obj.id()].y = newY
        API.saveState()
    },
    state: {coins: 1000},
    stateObjectsLookup: {},
    user: null,
    loginStatus: "offline"
}
