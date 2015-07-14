
var ClientHelpers = {
    guiSetCoins: function(value) {
        ige.$('coinsProgress').progress(value);
    },

    guiSetCash: function(value) {
        ige.$('cashProgress').progress(value);
    },

    addObject: function(data) {
        console.log("add object", data.name)
        var obj = new ige.newClassInstance(data.name)
        obj.id(data.id)
	    obj.mount(ige.$('tileMap1'))
        console.log("create", data, obj)
        obj.occupyTile(
            data.x, data.y, Math.ceil(data.w), Math.ceil(data.h)
		)
        var tx = data.x + obj._tileAdjustX;
        var ty = data.y + obj._tileAdjustY;
        obj.translateToTile(
            tx, ty
        )
        obj.data('tileX', data.x)
           .data('tileY', data.y)
           .data('tileWidth', data.w)
           .data('tileHeight', data.h);
        if(data.buildStarted && !data.buildCompleted){
            obj._buildStarted=data.buildStarted
            obj.place()
        }else{
            obj.place(true)
        }
        ClientHelpers.moveOutPlayer()
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
