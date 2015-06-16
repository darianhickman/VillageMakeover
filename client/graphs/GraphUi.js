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

        var newsFeed = new NewsFeed()

        var cashDialog = new CashDialog()
			.id('cashDialog')
			.layer(1)
			.hide()
			.mount(uiScene);

        var coinDialog = new CoinDialog()
            .id('coinDialog')
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

        cashProgress.render = function(ctx){
            ctx.font = '11px Verdana';
            IgeUiProgressBar.prototype.render.call(this,ctx);
        }

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

        var coinsProgress = new IgeUiProgressBar()
			.id('coinsProgress')
			.barColor('#69f22f')
			.min(0)
			.max(1000000)
			.progress(80)
			.width(87)
			.height(18)
			.right(17)
            .barText('', ' coins', 'black')
			.mount(coinsBar);

        coinsProgress.render = function(ctx){
            ctx.font = '11px Verdana';
            IgeUiProgressBar.prototype.render.call(this,ctx);
        }

        var coinsButton = new IgeUiElement()
            .id('coinsButton')
            .texture(self.textures.greenPlus)
            .dimensionsFromTexture(80)
            .right(-40)
            .mount(coinsProgress);

		/*var xpBar = new IgeUiElement()
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
        */

        if(API.loginStatus === 'offline'){
            var loginButtonEntity = new IgeFontEntity()
                .colorOverlay('white')
                .nativeFont('25px Times New Roman')
                .right(320)
                .textAlignX(2)
                .mount(topNav)
                .text('Login')
                .mouseUp(function(){
                    mixpanel.track("Click login");
                    location.href = '/client/login.html'
                });

            loginButtonEntity.width(loginButtonEntity.measureTextWidth() + 5);
        }else{
            var loginIDString;
            if(API.user.email.lastIndexOf("@") === -1){
                loginIDString = API.user.email;
            }else{
                loginIDString = API.user.email.substring(0,API.user.email.lastIndexOf("@"));
                loginIDString = loginIDString.charAt(0).toUpperCase() + loginIDString.slice(1);
            }

            var loginIDEntity = new IgeFontEntity()
                .id('loginIDEntity')
                .colorOverlay('white')
                .nativeFont('25px Times New Roman')
                .right(410)
                .textAlignX(2)
                .mount(topNav)
                .text(loginIDString);

            loginIDEntity.width(loginIDEntity.measureTextWidth() + 5);

            var logoutButtonEntity = new IgeFontEntity()
                .id('logoutButtonEntity')
                .colorOverlay('white')
                .nativeFont('25px Times New Roman')
                .right(320)
                .textAlignX(2)
                .mount(topNav)
                .text('Logout')
                .mouseUp(function(){
                    mixpanel.track("Logout");
                    location.href = '/api/logout'
                });

            logoutButtonEntity.width(logoutButtonEntity.measureTextWidth() + 5);
        }

        if(API.user.picture_url === 'no-picture'){
            //draw triangle
        }else{
            var loginPicture = new IgeUiElement()
                .id('loginPicture')
                .texture(new IgeTexture(API.user.picture_url))
                .dimensionsFromTexture()
                .right(410 + ige.$('loginIDEntity').measureTextWidth() + 10)
                .mount(topNav);


            var likeButton = new IgeFontEntity()
                .colorOverlay('white')
                .nativeFont('25px Times New Roman')
                .right(600)
                .textAlignX(1)
                .mount(topNav)
                .text('Like')
                .mouseUp(function(){
                    //goto url
                    $.ajax({
                        url: '/api/like',
                        dataType: 'json',
                        success: function (result) {
                            mixpanel.track("Like game");
                            console.log(result)
                            $("#tutorialDialog").dialog({
                                resizable: false,
                                draggable: true,
                                dialogClass: 'ui-dialog-no-titlebar',
                                closeOnEscape: false,
                                width: 500,
                                height: 200,
                                modal: true,
                                autoOpen: false
                            });
                            $("#tutorialDialog").dialog("open");

                            $("#tutorialContent")
                                .html('<div style="padding-top:50px"><p>You liked our game. Thank You!</p><button id="dialogButton">OK</button></div>');

                            $('#dialogButton').on('click', function () {
                                $("#tutorialDialog").dialog("close");
                            });
                        }
                    });
                });

            likeButton.width(likeButton.measureTextWidth() + 5);
        }

        var helpButton = new IgeFontEntity()
            .colorOverlay('white')
            .nativeFont('25px Times New Roman')
            .right(290)
            .textAlignX(1)
            .mount(topNav)
            .text('?')
            .mouseUp(function(){
                ige.client.fsm.enterState('tutorial');
            });

        helpButton.width(helpButton.measureTextWidth() + 5);

        var feedbackButton = new IgeFontEntity()
            .colorOverlay('white')
            .nativeFont('25px Times New Roman')
            .right(180)
            .textAlignX(1)
            .mount(topNav)
            .text('Feedback')
            .mouseUp(function(){
                window.open(
                    mixpanel.track("Send feedback");
                    GameConfig.config['feedbackButtonURL'],
                    "GoogleGroupPage",
                    "resizable,scrollbars,status"
                );

            });

        feedbackButton.width(feedbackButton.measureTextWidth() + 5);

        var buildButton = new IgeUiElement()
			.id('buildButton')
			.texture(self.textures.buildButton)
			.dimensionsFromTexture()
            .right(10)
			.mount(topNav);

        var newsFeedButton = new IgeUiElement()
            .id('newsFeedButton')
            .texture(self.textures.newsFeedButton)
            .dimensionsFromTexture()
            .top(-15)
            .right(80)
            .mount(topNav);

		new IgeParticleEmitter()
			.id('coinEmitter')
			.layer(10)
			.quantityTimespan(60)
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
			.left(380);

		this.addActions();

	},

	addActions: function () {

		ige.$('buildButton')
			.mouseUp(function () {
				// Open the build menu
                mixpanel.track("Open market dialog");
				ige.$('marketDialog').show();
			});

        ige.$('newsFeedButton')
            .mouseUp(function () {
                mixpanel.track("Open newsfeed dialog");
                $( "#newsFeedDialog" ).dialog({ resizable: false, draggable: true, closeOnEscape: true, width: 675, height: 430, modal: true, autoOpen: false });
                $( "#newsFeedDialog" ).dialog( "open" );
            });

        ige.$('cashBar')
            .mouseUp(function() {
                mixpanel.track("Open cash dialog");
                ige.$('cashDialog').show();
            });
        ige.$('cashProgress')
            .mouseUp(function() {
                mixpanel.track("Open cash dialog");
                ige.$('cashDialog').show();
            });
        ige.$('cashButton')
            .mouseUp(function() {
                mixpanel.track("Open cash dialog");
                ige.$('cashDialog').show();
            })

        ige.$('coinsBar')
            .mouseUp(function() {
                mixpanel.track("Open coin dialog");
                ige.$('coinDialog').show();
            });
        ige.$('coinsProgress')
            .mouseUp(function() {
                mixpanel.track("Open coin dialog");
                ige.$('coinDialog').show();
            });
        ige.$('coinsButton')
            .mouseUp(function() {
                mixpanel.track("Open coin dialog");
                ige.$('coinDialog').show();
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
