var GraphUi = IgeSceneGraph.extend({
	classId: 'GraphUi',

	/**
	 * Called when loading the graph data via ige.addGraph().
	 * @param options
	 */
	addGraph: function (options) {
		var self = ige.client,
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

        self.slideRight = new Menu({
            wrapper: '#o-wrapper',
            type: 'slide-right',
            menuOpenerClass: '.c-button',
            maskId: '#c-mask'
        });

		this.addActions();

	},

	addActions: function () {
        var self = ige.client;

        $('#dropDownIcon').on('click',function(){
            ClientHelpers.hideDialogs();
            self.slideRight.open();
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
            location.href = '/client/login.html'
        })

        $('#logoutLink').on('click',function(){
            mixpanel.track("Logout");
            location.href = '/api/logout'
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
            ClientHelpers.closeAllDialogsButThis('shareMyVillageDialog');
            $( "#shareMyVillageDialog" ).dialog({ resizable: false, draggable: true, closeOnEscape: false, width: 500, height: 300, modal: true, autoOpen: false });
            $( "#shareMyVillageDialog" ).dialog( "open" );

            $( "#shareMyVillageContent" )
                .html( '<div style="padding-top:45px"><p>Share My Village:</p><div><textarea id="shareMyVillageTextArea" style="width:428px;"></textarea>' +
                '<div id="shareMyVillageErrorField" class="ui-state-error" style="display:none;font-size:14px;">Your browser doesn\'t support copying. Please copy manually</div>' +
                '<button id="copyMyVillageClipboardButton">Copy to Clipboard</button></div></div>' );

            var url = window.location.href;
            var arr = url.split("/");
            var result = arr[0] + "//" + arr[2]
            $('#shareMyVillageTextArea').val(result + '/view/' + API.user.key_id);

            $('#copyMyVillageClipboardButton').on('click', function(){
                var copyTextarea = $('#shareMyVillageTextArea');
                copyTextarea.select();

                try {
                    var successful = document.execCommand('copy');
                    var msg = successful ? 'successful' : 'unsuccessful';
                    console.log('Copying text command was ' + msg);
                    if(!successful){
                        $('#shareMyVillageErrorField').css('display','')
                    }
                } catch (err) {
                    console.log('Oops, unable to copy');
                    $('#shareMyVillageErrorField').css('display','')
                }
            });
        })

		$('#marketButton')
			.click(function () {
				// Open the build menu
                mixpanel.track("Open market dialog");
				ige.$('marketDialog').show();
			});

        $('#goalButton')
            .click(function () {
                // Open the goal dialog
                mixpanel.track("Open goal dialog");
                $('#newGoalNotification').hide();
                ige.client.fsm.enterState('goalDialog', null, function (err) {
                    if (!err) {
                        $( "#goalDialog" ).dialog( "open" );
                    }
                });
            });

        $('#cashbar')
            .click(function() {
                mixpanel.track("Open cash dialog");
                ige.$('cashDialog').show();
            });

        $('#coinbar')
            .click(function() {
                mixpanel.track("Open coin dialog");
                ige.$('coinDialog').show();
            });

        $('#waterbar')
            .click(function() {
                mixpanel.track("Open water dialog");
                ige.$('waterDialog').show();
            });

        $('#moveButton')
            .click(function () {
                ige.client.fsm.enterState('move');
            });
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
