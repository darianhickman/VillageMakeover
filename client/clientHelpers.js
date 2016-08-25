
var ClientHelpers = {
    guiSetCoins: function(value) {
        $('#coinbarProgress').progressbar("value",value);
        $('#coinbarProgress').text(value);
    },
    
    hideDialogs: function(){
        // not sure how to iterate over all dialogs hard code for now. Change to class select at some point.
        var dialogList = ["goalDialog","marketDialog","editorMarketDialog","cashBuyDialog","coinBuyDialog","tutorialDialog","newsFeedDialog","shareMyVillageDialog","dropDownDialog","savingDialog","buyConfirmDialog","feedBackDialog","waterBuyDialog"];
        for(var i = 0; i < dialogList.length; i++){
            $("#" + dialogList[i]).dialog();
            $("#" + dialogList[i]).dialog("close");
        }
    },

    guiSetCash: function(value) {
        $('#cashbarProgress').progressbar("value",value);
        $('#cashbarProgress').text(value);
    },

    guiSetWater: function(value) {
        $('#waterbarProgress').progressbar("value",value);
        $('#waterbarProgress').text(value);
    },

    guiAnimateCoins: function(startValue, addValue) {
        $('#coinbarProgress').prop('number', startValue)
            .animateNumber(
            {
                number: (startValue + addValue)
            }
        );
    },

    guiAnimateCash: function(startValue, addValue) {
        $('#cashbarProgress').prop('number', startValue)
            .animateNumber(
            {
                number: (startValue + addValue)
            }
        );
    },

    guiAnimateWater: function(startValue, addValue) {
        $('#waterbarProgress').prop('number', startValue)
            .animateNumber(
            {
                number: (startValue + addValue)
            }
        );
    },

    addObject: function(data, tileMap) {
        vlg.log.debug("add object", data.name)
        var obj = new ige.newClassInstance(data.name)
        obj.id(data.id)
        obj.currentState = data.currentState;
        obj.currentSpecialEvent = data.currentSpecialEvent;
	    obj.mount(ige.$(tileMap))
        vlg.log.debug("create", data, obj)
        obj.occupyTile(
            parseInt(data.x), parseInt(data.y), Math.ceil(parseFloat(data.w)), Math.ceil(parseFloat(data.h))
		)
        var tx = parseInt(data.x) + obj._tileAdjustX;
        var ty = parseInt(data.y) + obj._tileAdjustY;
        obj.translateToTile(
            tx, ty
        )
        obj.data('tileX', parseInt(data.x))
           .data('tileY', parseInt(data.y))
           .data('tileWidth', parseInt(data.w))
           .data('tileHeight', parseInt(data.h));
        if(data.buildStarted && !data.buildCompleted){
            if(!data.currentState)
                obj.currentState = "building"
            obj._buildStarted=data.buildStarted
            obj.place()
        }else{
            if(!data.currentState)
                obj.currentState = "ready"
            obj.place(true)
            obj.setEndCell();
        }
    },

    setPlayerPos: function() {
        var player = ige.$('bob')
		var playerTile = player.currentTile();

        var x = parseInt(GameConfig.config['villagerStartX']), y = parseInt(GameConfig.config['villagerStartY'])
        while(ige.$('tileMap1').isTileOccupied(x, y, 1, 1)) {
            x ++; y ++
        }
        player.translateToTile(x, y)
    },

    moveOutPlayer: function() {
        var player = ige.$('bob')
        var playerTile = player.currentTile()
        if (ige.$('tileMap1').isTileOccupied(playerTile.x, playerTile.y, 1, 1)) {
			// Move our player away from the tile
			ige.$('bob').walkToTile(playerTile.x + 1, playerTile.y - 1);
		}
    },

    showMessage: function(message){
        if(this.messageTimeout){
            this.messageTimeout.cancel();
            this.messageTimeout = null;
        }

        $('#notificationMessage').text(message)
            .stop()
            .css("opacity", 1)
            .css("left", 10)
            .css("top", 150)
            .show()
            .animate({ top: '-=100px' }, 1000, GameConfig.config['notificationMessageEasing']);

        this.messageTimeout = new IgeTimeout(function () {
            $('#notificationMessage').animate({ opacity: 0 }, {duration: 1000, complete: function(){$('#notificationMessage').hide()}});
        }, parseInt(GameConfig.config['message_fadeout']) * 1000);
    },

    closeAllDialogsButThis: function(dialogID){
        var dialogList = ["dropDownDialog","marketDialog","goalDialog","cashBuyDialog","coinBuyDialog","shareMyVillageDialog","feedBackDialog","waterBuyDialog"];
        for(var i = 0; i < dialogList.length; i++){
            if(dialogList[i] === dialogID)
                continue;
            else {
                $("#" + dialogList[i]).dialog();
                $("#" + dialogList[i]).dialog("close");
            }
        }
    },

    convertToPrice: function(costs){
        var item, price = {coins:0,cash:0,water:0};
        for (var i = 0; i < costs.length; i++) {
            item = costs[i];
            switch((item.match(/[a-zA-Z]/) || []).pop()){
                case 'c':
                    price.coins = parseInt(item, 10);
                    break;
                case 'b':
                    price.cash = parseInt(item, 10);
                    break;
                case 'w':
                    price.water = parseInt(item, 10);
                    break;
            }
        }
        return price;
    }
}
