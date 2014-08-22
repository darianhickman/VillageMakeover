
var ClientHelpers = {
    guiSetCoins: function(value) {
        ige.$('coinsProgress').progress(value);
    },
    addObject: function(data) {
        var obj = new ige.newClassInstance(data.name)
	    obj.mount(ige.$('tileMap1'))
        obj.translateToTile(
            data.x, data.y
        )
        obj.occupyTile(
            data.x, data.y, data.w, data.h
		)
        obj.place()
    }
}
