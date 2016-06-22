
var ClientHelpers = {
    guiSetCoins: function(value) {
        ige.$('coinsProgress').progress(value);
    },

    guiSetCash: function(value) {
        ige.$('cashProgress').progress(value);
    },

    addObject: function(data, tileMap) {
        console.log("add object", data.name)
        var obj = new ige.newClassInstance(data.name)
        obj.id(data.id)
        obj.currentState = data.currentState;
	    obj.mount(ige.$(tileMap))
        console.log("create", data, obj)
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
    }
}
