var GraphView = IgeSceneGraph.extend({
	classId: 'GraphView',

	/**
	 * Called when loading the graph data via ige.addGraph().
	 * @param options
	 */
	addGraph: function (options) {
		var self = ige.client,
			baseScene = ige.$('baseScene');

		var viewLevel = new IgeScene2d()
			.id('viewLevel')
			.mount(baseScene);

		var backScene = new IgeScene2d()
			.layer(0)
			.mount(viewLevel);

		var objectSceneView = new IgeScene2d()
			.id('objectSceneView')
			.layer(1)
			.mount(viewLevel);

		var uiSceneView = new IgeScene2d()
			.id('uiSceneView')
			.layer(2)
			.ignoreCamera(true)
			.mount(viewLevel);

		// Add background entity
		new IgeEntity()
			.layer(0)
			.texture(self.textures.valleyBackground)
			.dimensionsFromTexture()
			.translateTo(0, 0, 0)
			.mount(backScene);

		// Add tile map
        var tileCount = parseInt(28 * 36 / mapTileSize * gameScale)
        var mapDeltaY = 200
        var mapDeltaX = -0

		new IgeTileMap2d()
			.id('tileMapView')
            .drawGrid(true)
			.mouseEventsActive(true)
			.isometricMounts(true)
			.tileWidth(mapTileSize)
			.tileHeight(mapTileSize)
			.gridSize(tileCount, tileCount)
			.drawGrid(false)
			.drawMouse(false)
			.drawMouseData(false)
            .translateTo(0,-640,0)
            .highlightOccupied(false)
			.mount(objectSceneView);

	},

	/**
	 * The method called when the graph items are to be removed from the
	 * active graph.
	 */
	removeGraph: function () {
		// Since all our objects in addGraph() were mounted to the
		// 'scene1' entity, destroying it will remove everything we
		// added to it.
		ige.$('viewLevel').destroy();
	}
});
