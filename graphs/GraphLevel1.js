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
			.texture(self.textures.greenBackground)
			.dimensionsFromTexture()
			.translateTo(0, -50, 0)
			//.scaleTo(0.44, 0.44, 0.5)
			.mount(backScene);
		
		// Add ground entity
		new IgeEntity()
			.id('ground')
			.layer(1)
			.texture(self.textures.dirtBackground)
			.dimensionsFromTexture()
			.mount(backScene);
		
		// Add tile map
		new IgeTileMap2d()
			.id('tileMap1')
			.mouseEventsActive(true)
			.isometricMounts(true)
			.tileWidth(38)
			.tileHeight(38)
			.gridSize(12, 12)
			.drawGrid(false)
			.drawMouse(false)
			.drawMouseData(true)
			.translateTo(-7, -228, 0)
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