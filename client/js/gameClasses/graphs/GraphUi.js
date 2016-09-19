var GraphUi = IgeSceneGraph.extend({
	classId: 'GraphUi',

	/**
	 * Called when loading the graph data via ige.addGraph().
	 * @param options
	 */
	addGraph: function (options) {
		var self = this,
            clientself = ige.client;
			uiScene = ige.$('uiScene');

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

        var waterDialog = new WaterDialog()
            .id('waterDialog')
            .layer(1)
            .hide()
            .mount(uiScene);

        var buyStatus = new BuyStatus()
			.id('buyStatus')
			.layer(1)
			.hide()
			.mount(uiScene);

        $( "#cashbarProgress" ).progressbar({
            max:100000,
            value: 0
        });

        $( "#coinbarProgress" ).progressbar({
            max:1000000,
            value: 0
        });

        $( "#waterbarProgress" ).progressbar({
            max:1000000,
            value: 0
        });


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

        $("#topToolbar").show();
        $("#notifyIconContainer").show();
        $("#newGoalNotification").hide();
        $("#endMove").hide();

        $("#dropDownContent")
            .html(DropDownMenu.dropDownContent);

        $(".c-menu__items")
            .html(DropDownMenu.dropDownLinksList);

        for(var i = 0; i < DropDownMenu.links.length; i++){
            $('#' + DropDownMenu.links[i].id).html(DropDownMenu.links[i].string);
        }

        if(API.user.picture_url === 'no-picture'){
            $("#loginPicture").attr("src", DropDownMenu.offlinePictureURL);
        }
        else{
            $("#loginPicture").attr("src", API.user.picture_url);
        }

        if(API.loginStatus === 'offline'){
            $("#logoutLink").hide();
            $("#shareMyVillageLink").hide();
        }else{
            $("#loginLink").hide();
            $("#loginID").html(API.user.name);
        }

        if(API.user.editor_enabled === "false"){
            $("#editorLink").hide();
        }

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

        clientself.slideRight = new Menu({
            wrapper: '#o-wrapper',
            type: 'slide-right',
            menuOpenerClass: '.c-button',
            maskId: '#c-mask'
        });

		this.addActions();

	},

	addActions: function () {
        var self = this,
            clientself = ige.client;

        $('#dropDownIcon').on('click',function(){
            ige.client.fsm.enterState('playerMenu');
        })

        $(".c-menu__close").on('click',function(){
            ige.client.fsm.enterState('select');
        })

        $(".c-mask").on('click',function(){
            ige.client.fsm.enterState('select');
        })

        $('#fullscreenIcon').on('click',function(){
            mixpanel.track("Go fullscreen");
            $( "#fullscreenIcon" ).find('img').toggle();
            if($.FullScreen.isFullScreen()){
                $.FullScreen.cancelFullScreen();
            }else{
                $('body').requestFullScreen();
            }
        })

        $('#fullscreenIcon').on('mouseover',function(){
            // No sound for now mouseover.
           // ige.client.audio.select.play();
        })

        $('#loginLink').on('click',function(){
            mixpanel.track("Click login");

            $( "#savingDialog" ).dialog({ resizable: false, draggable: true, dialogClass: 'ui-dialog-no-titlebar', closeOnEscape: false, width: 500, height: 300, modal: true, autoOpen: false });
            $( "#savingDialog" ).dialog( "open" );

            $( "#savingContent" )
                .html( "<div><p>Signing in, please wait!</p><p><img src='assets/textures/ui/loading_spinner.gif'></p></div>" );

            ige.client.gameLogic.loginManager.login();
        })

        $('#logoutLink').on('click',function(){
            mixpanel.track("Logout");
            ige.client.gameLogic.loginManager.logout();
        })

        $('#helpLink').on('click',function(){
            ige.client.fsm.enterState('tutorial');
        })

        $('#feedbackLink').on('click',function(){
            ige.client.fsm.enterState('feedbackDialog');
        })

        $('#editorLink').on('click',function(){
            ige.client.slideRight.close();

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

            ige.client.fsm.enterState('editor');
        })

        $('#shareMyVillageLink').on('click',function(){
            ige.client.fsm.enterState('shareMyVillage');
        })

        $('#toggleSFXLink').append("<span id='toggleSFXStatus'> - On</span>")
        $('#toggleSFXLink').on('click',function(){
            vlg.isSFXOn = !vlg.isSFXOn;
            if(vlg.isSFXOn){
                $('#toggleSFXStatus').html(" - On");
            }else{
                $('#toggleSFXStatus').html(" - Off");
            }
        })

        $('#toggleMusicLink').append("<span id='toggleMusicStatus'> - On</span>")
        $('#toggleMusicLink').on('click',function(){
            vlg.isMusicOn = !vlg.isMusicOn;
            if(vlg.isMusicOn){
                $('#toggleMusicStatus').html(" - On");
            }else{
                $('#toggleMusicStatus').html(" - Off");
            }
            toggleMusic();
        })

		$('#marketButton')
			.click(function () {
				// Open the build menu
                mixpanel.track("Open market dialog");
                self.toggleDialog('marketDialog');
			});

        $('#goalButton')
            .click(function () {
                self.toggleGoalDialog();
            });

        $('#cashbar')
            .click(function() {
                mixpanel.track("Open cash dialog");
                self.toggleDialog('cashDialog');
            });

        $('#coinbar')
            .click(function() {
                mixpanel.track("Open coin dialog");
                self.toggleDialog('coinDialog');
            });

        $('#waterbar')
            .click(function() {
                mixpanel.track("Open water dialog");
                self.toggleDialog('waterDialog');
            });

        $('#moveButton')
            .click(function () {
                ige.client.fsm.enterState('move');
            });
    },

	toggleDialog: function(name){
        if(ige.$(name).isVisible())
            ige.$(name).closeMe();
        else
            ige.$(name).show();

    },

    toggleGoalDialog: function(name){
        if(ige.client.fsm.currentStateName() === "goalDialog"){
            ige.client.fsm.enterState('select');
        }
        else{
            // Open the goal dialog
            mixpanel.track("Open goal dialog");
            $('#newGoalNotification').hide();
            ige.client.fsm.enterState('goalDialog', null, function (err) {
                if (!err) {
                    $( "#goalDialog" ).dialog({ resizable: false, draggable: true, closeOnEscape: true, close: function( event, ui ) {ige.client.fsm.enterState('select')}, width: 'auto', height: 'auto', modal: true, autoOpen: false });
                    $( "#goalDialog" ).dialog( "open" );
                }
            });
        }
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
