
var ClientHelpers = {
    guiSetCoins: function(value) {
        $('#coinbarProgress').progressbar("value",value);
        $('#coinbarProgress').text(value);
    },

    guiSetCash: function(value) {
        $('#cashbarProgress').progressbar("value",value);
        $('#cashbarProgress').text(value);
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

    addObject: function(data, tileMap) {
        vlg.log.debug("add object", data.name)
        var obj = new ige.newClassInstance(data.name)
        obj.id(data.id)
        obj.currentState = data.currentState;
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
            obj._buildStarted=data.buildStarted
            obj.place()
        }else{
            obj.place(true)
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
        ige.$('messageFontEntity').text(message)
            .opacity(1)
            .show()
            .translateTo(ige.$('uiScene')._renderPos.x + 270, ige.$('uiScene')._renderPos.y + 150, 0)
            ._translate.tween()
            .stepTo({
                y: (ige.$('uiScene')._renderPos.y + 80)
            },500,'inOutSine')
            .start();

        this.messageTimeout = new IgeTimeout(function () { ige.$('messageFontEntity').hide(); }, 3 * 1000);
    }
}
