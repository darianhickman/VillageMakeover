
var ClientHelpers = {
    guiSetCoins: function(value) {
        ige.$('coinsProgress').progress(value);
    },
    addObject: function(data) {
        var obj = new ige.newClassInstance(data.name)
	    obj.mount(ige.$('tileMap1'))
        console.log("create", data, obj)
        obj.translateToTile(
            data.x, data.y
        )
        obj.occupyTile(
            data.x, data.y, data.w, data.h
		)
        obj.place()
        ClientHelpers.moveOutPlayer()
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
