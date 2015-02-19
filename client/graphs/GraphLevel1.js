var mapTileSize = 36;

var GraphLevel1 = IgeSceneGraph.extend({
	classId: 'GraphLevel1',

	/**
	 * Called when loading the graph data via ige.addGraph().
	 * @param options
	 */
	addGraph: function (options) {
		var self = ige.client,
			baseScene = ige.$('baseScene');

		var level1 = new IgeScene2d()
			.id('level1')
			.mount(baseScene);

		var backScene = new IgeScene2d()
			.id('backScene')
			.layer(0)
			.mount(level1);

		var objectScene = new IgeScene2d()
			.id('objectScene')
			.layer(1)
			.mount(level1);

		var uiScene = new IgeScene2d()
			.id('uiScene')
			.layer(2)
			.ignoreCamera(true)
			.mount(level1);

		// Add background entity
		new IgeEntity()
			.id('background')
			.layer(0)
			.texture(self.textures.valleyBackground)
			.dimensionsFromTexture()
			.translateTo(0, 0, 0)
			//.scaleTo(0.44, 0.44, 0.5)
			.mount(backScene);

		// Add ground entity
	/**
			new IgeEntity()
			.id('ground')
			.layer(1)
			.texture(self.textures.dirtBackground)
			.dimensionsFromTexture(gameScale * 100)
			.mount(backScene);
**/
		// Add tile map
        var tileCount = parseInt(28 * 36 / mapTileSize * gameScale)
        var mapDeltaY = 200
        var mapDeltaX = -0

		new IgeTileMap2d()
			.id('tileMap1')
            .drawGrid(true)
			.mouseEventsActive(true)
			.isometricMounts(true)
			.tileWidth(mapTileSize)
			.tileHeight(mapTileSize)
			.gridSize(tileCount, tileCount)
			.drawGrid(false)
			.drawMouse(false)
			.drawMouseData(false)
			//.translateTo(-7 - mapDeltaX, -228 - mapDeltaY, 0)
            .translateTo(0,-600,0)
            .highlightOccupied(false)
			.mount(objectScene);
	},

	/**
	 * The method called when the graph items are to be removed from the
	 * active graph.
	 */
	removeGraph: function () {
		// Since all our objects in addGraph() were mounted to the
		// 'scene1' entity, destroying it will remove everything we
		// added to it.
		ige.$('scene1').destroy();
	}
});
