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
            ctx.font = '13px Verdana';
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
            ctx.font = '13px Verdana';
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

        $("#topToolbar").show();

        $("#dropDownDialog").dialog({
            resizable: false,
            draggable: false,
            closeOnEscape: false,
            width: parseInt(DropDownMenu.width),
            height: parseInt(DropDownMenu.height),
            modal: false,
            autoOpen: false,
            position: { my: "left top", at: "left bottom", of: "#dropDownIcon" },
            open: function(event, ui) {
                $(this).dialog('widget').find('div.ui-dialog-titlebar').css('padding','4px');
                $(this).css('height','auto');
            }
        });

        $("#dropDownContent")
            .html(DropDownMenu.dropDownContent);

        $("#dropDownLinksList")
            .html(DropDownMenu.dropDownLinksList);

        for(var i = 0; i < DropDownMenu.links.length; i++){
            $('#' + DropDownMenu.links[i].id).html(DropDownMenu.links[i].string);
        }

        $(window).resize(function() {
            $("#dropDownDialog").dialog("option", "position", { my: "left top", at: "left bottom", of: "#dropDownIcon" });
        });

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
            .texture(ige.client.textures.pressStartFont)
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

        var messageFontEntity = new IgeFontEntity()
            .id('messageFontEntity')
            .layer(500)
            .colorOverlay('white')
            .texture(ige.client.textures.pressStartFont)
            .nativeStroke(4)
            .nativeStrokeColor('#000000')
            .textAlignX(0)
            .width(500)
            .mount(uiScene)
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

        $('#fullscreenIcon').on('click',function(){
            mixpanel.track("Go fullscreen");
            if($.FullScreen.isFullScreen()){
                $.FullScreen.cancelFullScreen();
            }else{
                $('body').requestFullScreen();
            }
        })

        $('#fullscreenIcon').on('mouseover',function(){
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

            ige.client.fsm.enterState('editor');
        })

        $('#shareMyVillageLink').on('click',function(){
            $( "#shareMyVillageDialog" ).dialog({ resizable: false, draggable: false, closeOnEscape: false, width: 500, height: 300, modal: true, autoOpen: false });
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

		$('#buildButton')
            .mouseover(function(){
                ige.client.audio.select.play();
            })
			.click(function () {
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
