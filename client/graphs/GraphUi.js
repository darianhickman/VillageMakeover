var GraphUi = IgeSceneGraph.extend({
	classId: 'GraphUi',

	/**
	 * Called when loading the graph data via ige.addGraph().
	 * @param options
	 */
	addGraph: function (options) {
		var self = ige.client,
			uiScene = ige.$('uiScene');

        var topNav = new IgeUiElement()
            .id('topNav')
            .width(900)
            .top(10)
            .height(50)
            .mount(uiScene)

		var marketDialog = new MarketDialog()
			.id('marketDialog')
			.layer(1)
			.hide()
			.mount(uiScene);

        GameObjects.setupMarket(marketDialog)

        var cashDialog = new CashDialog()
			.id('cashDialog')
			.layer(1)
			.hide()
			.mount(uiScene);

        var buyStatus = new BuyStatus()
			.id('buyStatus')
			.layer(1)
			.hide()
			.mount(uiScene);

		var cashBar = new IgeUiElement()
			.id('cashBar')
			.texture(ige.client.textures.cashBar)
			.dimensionsFromTexture()
            .left(0)
			.mount(topNav);

        var cashProgress = new IgeUiProgressBar()
			.id('cashProgress')
			.barColor('#69f22f')
			.min(0)
			.max(100000)
			.progress(80)
			.width(87)
			.height(18)
			.right(17)
            .barText('$', '', 'black')
			.mount(cashBar);

        var cashButton = new IgeUiElement()
			.id('cashButton')
			.texture(self.textures.greenPlus)
			.dimensionsFromTexture(80)
            .right(-40)
			.mount(cashProgress);


		var coinsBar = new IgeUiElement()
			.id('coinsBar')
			.texture(ige.client.textures.coinsBar)
			.dimensionsFromTexture()
            .left(175)
			.mount(topNav);

		new IgeUiProgressBar()
			.id('coinsProgress')
			.barColor('#69f22f')
			.min(0)
			.max(100)
			.progress(80)
			.width(87)
			.height(18)
			.right(17)
            .barText('', ' coins', 'black')
			.mount(coinsBar);

		var xpBar = new IgeUiElement()
			.id('xpBar')
			.texture(ige.client.textures.xpBar)
			.dimensionsFromTexture()
            .left(325)
			.mount(topNav);

        new IgeUiProgressBar()
			.id('xpProgress')
			//.barBackColor('#f2b982')
			//.barBorderColor('#3a9bc5')
			.barColor('#69f22f')
			.min(0)
			.max(500)
			.progress(80)
			.width(87)
			.height(18)
			.right(17)
            .barText('', ' XP', 'black')
			.mount(xpBar);

		new IgeUiElement()
			.id('energyBar')
			.texture(ige.client.textures.energyBar)
			.dimensionsFromTexture()
            .left(475)
            //.barText('', '%', 'black')
			.mount(topNav);

        var buildButton = new IgeUiElement()
			.id('buildButton')
			.texture(self.textures.buildButton)
			.dimensionsFromTexture()
            .right(10)
			.mount(topNav);

		new IgeParticleEmitter()
			.id('coinEmitter')
			.layer(10)
			.quantityTimespan(600)
			.quantityBase(10)
			.velocityVector(new IgePoint3d(0, -0.030, 0), new IgePoint3d(-0.025, -0.005, 0), new IgePoint3d(0.025, -0.01, 0))
			.linearForceVector(new IgePoint3d(0, 0.25, 0), new IgePoint3d(0, 0, 0), new IgePoint3d(0, 0, 0))
			.scaleBaseX(2)
			.scaleBaseY(2)
			.deathScaleBaseX(2)
			.deathScaleBaseY(2)
			.deathRotateBase(0)
			.deathRotateVariance(0, 360)
			.deathOpacityBase(0)
			.quantityMax(10)
			.particle(CoinParticle)
			.mount(uiScene)
			.top(20)
			.center(-146);

		this.addActions();

	},

	addActions: function () {

		ige.$('buildButton')
			.mouseUp(function () {
				// Open the build menu
				ige.$('marketDialog').show();
			});

        ige.$('cashBar')
            .mouseUp(function() {
                ige.$('cashDialog').show();
            });
        ige.$('cashProgress')
            .mouseUp(function() {
                ige.$('cashDialog').show();
            });
        ige.$('cashButton')
            .mouseUp(function() {
                ige.$('cashDialog').show();
            })

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
