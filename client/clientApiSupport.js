
var API = {
    init: function(postinit_cb) {
        $.ajax({
            url: '/api/get_user',
            dataType: 'json',
            success: function(result) {
                API.user = result
                if(ige.client.viewVillageID && ige.client.viewVillageID !== API.user.key_id){
                    ige.client.fsm.initialState('view');
                    return;
                }
                if(result.status === 'ok') {
                    mixpanel.track("Online user");
                    API.loginStatus = "online"
                    history.replaceState({'villageID':API.user.key_id},"load_village",'?v='+API.user.key_id+location.hash);
                } else if(result.status === 'fail'){
                    location.href = result.login_url
                } else {
                    API.loginStatus = "offline"
                    mixpanel.track("Offline user");
                    if(localStorage.getItem('id') === null){
                        localStorage.setItem('id',ige.newIdHex())
                    }
                    API.user.id = localStorage.getItem('id')
                }
                API.loadState(postinit_cb)

            }
        })
    },

    _buyCallback: function() { console.error('missing buy callback') },

    loadState: function(postinit_cb) {
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
            postinit_cb(API.state.isTutorialShown)
            API._buyCallback()
            if(first)
                API.firstReloadState()
            API.reloadState()
            if(API.state.isTutorialShown){
                //start game logic
                ige.client.eventEmitter = ige.client.eventEmitter || new EventEmitter()
                ige.client.gameLogic = ige.client.gameLogic || new GameLogic()
            }
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
                    postinit_cb(API.state.isTutorialShown)
                    API._buyCallback()
                    if(first)
                        API.firstReloadState()
                    API.reloadState()
                    if(API.state.isTutorialShown){
                        //start game logic
                        ige.client.eventEmitter = new EventEmitter()
                        ige.client.gameLogic = new GameLogic()
                    }
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

        ClientHelpers.guiAnimateCoins(API.state.coins, -assets.coins)
        ClientHelpers.guiAnimateCash(API.state.cash, -assets.cash)
        API.state.cash -= assets.cash
        API.state.coins -= assets.coins
        API.saveState()
        return true
    },

    addCoins: function(by) {
        mixpanel.track("Add Coins");
        ClientHelpers.guiAnimateCoins(API.state.coins, by)
        API.state.coins += by
        API.saveState()
        return true
    },

    addCash: function(by) {
        mixpanel.track("Add Cash");
        ClientHelpers.guiAnimateCash(API.state.cash, by)
        API.state.cash += by
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
            goals = API.state.goals || [],
            isIDMissing = false;
        for(var i in objects) {
            if (objects[i].id === undefined){
                objects[i].id = ige.newIdHex()
                isIDMissing = true
            }
            API.stateObjectsLookup[objects[i].id] = objects[i]
            ClientHelpers.addObject(objects[i],"tileMap1")
            ClientHelpers.moveOutPlayer()
        }
        for(var i in goals) {
            API.stateGoalsLookup[goals[i].goalID] = goals[i]
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
        mixpanel.track("Create object");
        console.log("ige create object", obj)
        if(!API.state.objects)
            API.state.objects = []
        var newLength = API.state.objects.push(obj)
        API.stateObjectsLookup[obj.id] = API.state.objects[newLength-1]
        API.saveState()
    },

    updateObject: function(obj, newX, newY) {
        mixpanel.track("Update object");
        console.log("ige update object", obj)
        API.stateObjectsLookup[obj.id()].x = newX
        API.stateObjectsLookup[obj.id()].y = newY
        API.saveState()
    },

    saveObjectBuiltDate: function(obj, buildCompleted) {
        vlg.log.debug("ige update object", obj)
        API.stateObjectsLookup[obj.id()].buildCompleted = buildCompleted
        API.saveState()
    },

    resetBuildTimes: function(obj, buildStarted){
        API.stateObjectsLookup[obj.id()].buildStarted = buildStarted;
        API.stateObjectsLookup[obj.id()].buildCompleted = null;
        API.saveState()
    },

    saveObjectStateProperties: function(obj, props) {
        for (var key in props) {
            if (props.hasOwnProperty(key)){
                API.stateObjectsLookup[obj.id()][key] = props[key]
                console.log(API.stateObjectsLookup[obj.id()][key]);
                console.log(props[key]);
            }
        }
        API.saveState()
    },

    setTutorialAsShown: function() {
        console.log("tutorial is shown")
        API.state.isTutorialShown = true
        API.saveState()
    },

    createGoal: function(goalID) {
        mixpanel.track("Create goal");
        console.log("ige create goal", goalID)
        if(!API.state.goals)
            API.state.goals = []
        var newLength = API.state.goals.push({'goalID':goalID})
        API.stateGoalsLookup[goalID] = API.state.goals[newLength-1]
        API.state.currentGoalID = goalID
        API.saveState()
    },

    updateGoal: function(goalID, taskID, value) {
        mixpanel.track("Update goal");
        console.log("ige update goal", goalID, taskID, value)
        if(!API.stateGoalsLookup[goalID].tasks)
            API.stateGoalsLookup[goalID].tasks = []
        var elementPos = API.stateGoalsLookup[goalID].tasks.map(function(x) {return x.taskID; }).indexOf(taskID);
        if(elementPos !== -1)
            API.stateGoalsLookup[goalID].tasks[elementPos].value = value
        else
            API.stateGoalsLookup[goalID].tasks.push({"taskID":taskID,"value":value})
        API.saveState()
    },

    setGoalAsComplete: function(goalID) {
        mixpanel.track("Complete goal");
        console.log("goal is complete")
        API.stateGoalsLookup[goalID].isComplete = true
        API.saveState()
    },

    addUnlockedItem: function(itemID){
        API.state.unlockedItems = API.state.unlockedItems || [];
        if(API.state.unlockedItems.indexOf(itemID) === -1){
            mixpanel.track("Add unlocked item to state");
            API.state.unlockedItems.push(itemID);
            API.saveState()
        }
    },

    getUnlockedItem: function(itemID){
        API.state.unlockedItems = API.state.unlockedItems || [];
        var index = API.state.unlockedItems.indexOf(itemID);
        if(index === -1)
            return null;
        else
            return API.state.unlockedItems[index];
    },

    state: {coins: parseInt(GameConfig.config['startCoins']), cash: parseInt(GameConfig.config['startCash']) },
    stateObjectsLookup: {},
    stateGoalsLookup: {},
    user: null,
    loginStatus: "offline"
}
