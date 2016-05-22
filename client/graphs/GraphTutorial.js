var GraphTutorial = IgeSceneGraph.extend({
	classId: 'GraphTutorial',

	/**
	 * Called when loading the graph data via ige.addGraph().
	 * @param options
	 */
	addGraph: function (options) {
		var self = ige.client,
			baseScene = ige.$('baseScene');

		var tutorialLevel = new IgeScene2d()
			.id('tutorialLevel')
			.mount(baseScene);

		var backScene = new IgeScene2d()
			.layer(0)
			.mount(tutorialLevel);

		var objectSceneTutorial = new IgeScene2d()
			.id('objectSceneTutorial')
			.layer(1)
			.mount(tutorialLevel);

		var uiSceneTutorial = new IgeScene2d()
			.id('uiSceneTutorial')
			.layer(2)
			.ignoreCamera(true)
			.mount(tutorialLevel);

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
			.id('tileMapTutorial')
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
			.mount(objectSceneTutorial);

	},

	/**
	 * The method called when the graph items are to be removed from the
	 * active graph.
	 */
	removeGraph: function () {
		// Since all our objects in addGraph() were mounted to the
		// 'scene1' entity, destroying it will remove everything we
		// added to it.
		ige.$('tutorialLevel').destroy();
	}
});
