
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
	    obj.mount(ige.$('tileMap1'))
        console.log("create", data, obj)
        obj.translateToTile(
            data.x, data.y
        )
        obj.occupyTile(
            data.x, data.y, Math.ceil(data.w), Math.ceil(data.h)
		)
        obj.place(true)
        ClientHelpers.moveOutPlayer()
    },

    setPlayerPos: function() {
        var player = ige.$('bob')
		var playerTile = player.currentTile();

        var x = 15, y = 15
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
