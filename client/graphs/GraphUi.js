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

		if(GameConfig.config['xpFeature'] === "on"){
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
        }

        if(GameConfig.config['energyFeature'] === "on"){
            new IgeUiElement()
                .id('energyBar')
                .texture(ige.client.textures.energyBar)
                .dimensionsFromTexture()
                .left(475)
                //.barText('', '%', 'black')
                .mount(topNav);
        }

        $("#dropDownIcon").show();

        $("#dropDownDialog").dialog({
            resizable: false,
            draggable: true,
            dialogClass: 'ui-dialog-no-titlebar',
            closeOnEscape: false,
            width: 350,
            height: 180,
            modal: false,
            autoOpen: false,
            position: { my: "left top", at: "left bottom", of: "#dropDownIcon" }
        });

        $("#dropDownContent")
            .html('<div style="display: table-row;"><div style="float:left;padding-left: 10px;padding-top: 10px;"><img id="loginPicture" width="75px" height="75px"></div><div id="loginID" style="float: left;padding-left: 10px;padding-top:10px;">Offline</div></div><div style="height: 36px;background-color:white;padding-left: 10px;padding-top: 16px;margin-top: 30px;"><span id="loginLink" style="cursor: pointer">' + GameConfig.config['loginString'] + '</span><span id="logoutLink" style="cursor: pointer">' + GameConfig.config['logoutString'] + '</span> | <span id="helpLink" style="cursor: pointer">' + GameConfig.config['helpString'] + '</span> | <span id="feedbackLink" style="cursor: pointer">' + GameConfig.config['feedbackString'] + '</span> | <span id="editorLink" style="cursor: pointer">' + GameConfig.config['openEditorString'] + '</span></div>');

        if(API.user.picture_url === 'no-picture'){
            $("#loginPicture").attr("src", "assets/textures/ui/No_Image_Available_75.png");
        }
        else{
            $("#loginPicture").attr("src", API.user.picture_url);
        }

        if(API.loginStatus === 'offline'){
            $("#logoutLink").hide();
        }else{
            $("#loginLink").hide();
            $("#loginID").html(API.user.name);
        }

        if(API.user.editor_enabled === "false"){
            $("#editorLink").hide();
        }

        var buildButton = new IgeUiElement()
			.id('buildButton')
			.texture(self.textures.buildButton)
			.dimensionsFromTexture()
            .right(10)
			.mount(topNav);

        var goalButton = new IgeUiElement()
            .id('goalButton')
            .top(80)
            .right(23)
            .mount(topNav)
            .hide();

        var goalButtonTexture = new IgeEntity()
            .texture(self.textures.star)
            .dimensionsFromTexture()
            .mount(goalButton)

        var goalButtonFontEntity = new IgeFontEntity()
            .id('goalButtonFontEntity')
            .colorOverlay('black')
            .nativeFont('23px Times New Roman')
            .backgroundColor('#D3D3D3')
            .borderColor('#FFFFFF')
            .borderWidth(2)
            .right(25)
            .top(8)
            .width(140)
            .height(30)
            .textAlignX(0)
            .paddingLeft(10)
            .mount(goalButton)
            .text(GameConfig.config['newGoalString'])
            .hide();

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
        var self = this;

        $('#dropDownIcon').on('click',function(){
            self.toggleDropDownMenu();
        })

        $('#dropDownIcon').on('mouseover',function(){
            ige.client.audio.select.play();
        })

        $('#loginLink').on('click',function(){
            mixpanel.track("Click login");
            location.href = '/client/login.html'
        })

        $('#logoutLink').on('click',function(){
            mixpanel.track("Logout");
            location.href = '/api/logout'
        })

        $('#helpLink').on('click',function(){
            $("#dropDownDialog").dialog("close");
            ige.client.fsm.enterState('tutorial');
        })

        $('#feedbackLink').on('click',function(){
            mixpanel.track("Send feedback");
            window.open(
                GameConfig.config['feedbackButtonURL'],
                "GoogleGroupPage",
                "resizable,scrollbars,status"
            );
        })

        $('#editorLink').on('click',function(){
            $("#dropDownDialog").dialog("close");

            ige.client.editorManager = new EditorManager();
            ige.client.editorManager.gotoStep('init');

            ige.$('vp1')
                .mousePan.enabled(false)
                .scrollZoom.enabled(false)
                .camera.translateTo(0, 0, 0)
                .camera.scaleTo(1.0,1.0,0);

            ige.$('level1').hide();
            ige.addGraph('GraphEditor');
            ige.addGraph('GraphUiEditor');

            $("#dropDownIcon").hide();

            ige.client.fsm.enterState('editor');
        })

		ige.$('buildButton')
            .mouseOver(function(){
                ige.client.audio.select.play();
            })
			.mouseUp(function () {
				// Open the build menu
                mixpanel.track("Open market dialog");
				ige.$('marketDialog').show();
			});

        ige.$('goalButton')
            .mouseOver(function(){
                ige.client.audio.select.play();
            })
            .mouseUp(function () {
                // Open the goal dialog
                mixpanel.track("Open goal dialog");
                ige.$('goalButtonFontEntity').hide();
                $( "#goalDialog" ).dialog( "open" );
                ige.client.fsm.enterState('goalDialog');
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
            .mouseOver(function(){
                ige.client.audio.select.play();
            })
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
            .mouseOver(function(){
                ige.client.audio.select.play();
            })
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
	},

    toggleDropDownMenu: function(){
        if($("#dropDownDialog").dialog("isOpen")){
            $("#dropDownDialog").dialog("close");
        }else{
            $("#dropDownDialog").dialog("open");
        }
    }
});
