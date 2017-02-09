
var GameObjects = {
    gameObjectTextures: {},
    setupMarket: function(marketDialog) {
        var pageCount = Math.ceil(GameObjects._marketCallbacks.length / marketDialog.itemCount);
        marketDialog.createPages(pageCount);

        for(var i in GameObjects._marketCallbacks) {
		    (GameObjects._marketCallbacks[i])(marketDialog)
        }
    },
    setupEditorMarket: function(editorMarketDialog) {
        var pageCount = Math.ceil(GameObjects.catalog.length / parseInt(GameConfig.config['itemCount']));
        editorMarketDialog.createPages(pageCount);

        for(var i in GameObjects.catalog) {
            var item = GameObjects.catalog[i]
            editorMarketDialog.addItem({
                'id': 'editor' + item.id,
                'classId': item.id,
                'title': item.name,
                'texture': ige.client.textures[item.id],
                'coins': 0,
                'cash': 0,
                'cell': item.cell,
                'scale': item.scale,
                'scaleValue': item.scaleValue
            });
        }
    },
    _marketCallbacks: [],
    loadCatalog: function(catalog) {
        GameObjects.catalog = catalog;
        GameObjects.catalogLookup = {};
        for(var i in catalog) {
            var item = catalog[i]
            GameObjects.createGameObjectClass(item.id, item)
            GameObjects.catalogLookup[item.id] = item
        }
    },
    createGameObjectClass: function(classId, options) {
        GameObjects.gameObjectTextures[classId] = [options.textureUrl, options.cellCount || 1]

        if(options.enabled) GameObjects._marketCallbacks.push(function(marketDialog) {
            marketDialog.addItem({
			    'id': classId,
			    'classId': classId,
			    'title': options.name,
			    'texture': ige.client.textures[classId],
			    'coins': options.coins,
			    'cash': options.cash,
			    'cell': options.cell,
			    'scale': options.scale,
			    'scaleValue': options.scaleValue,
                'dependency': options.dependency,
                'unlockValue': parseInt(options.unlockValue)
		    });
        })

        window[classId] = GameObject.extend({
	        classId: classId,

	        init: function () {
		        GameObject.prototype.init.call(this);

                var self = this;

		        this.texture(ige.client.textures[classId])
			        .dimensionsFromCell()
			        .bounds3d(options.bounds3d[0], options.bounds3d[1], options.bounds3d[2])
			        .anchor(options.anchor[0], options.anchor[1]);

                this.width(options.scaleValue * this.width())
                this.height(options.scaleValue * this.height())

		        this.calcTileAdjust();
                this.cell(options.cell)

                this.type = options.type;
                this.xTiles = parseInt(options.xTiles);
                this.yTiles = parseInt(options.yTiles);
                this.dependency = options.dependency;
                this.unlocks = options.unlocks;
                this.unlockValue = parseInt(options.unlockValue);
                this.mouseOverText = options.description;
                this.buildTime = options.buildTime;
                this.buildTimeMilliseconds = convertTimeFormatToMilliseconds(this.buildTime);
                this.buildTimeSpeedValue = parseInt(options.buildTimeSpeedValue);
                this.specialEvent = options.specialEvent;
                this.specialEvents = options.specialEvent.split(",");

                //prepare mouseover panel contents
                this.mouseOverPanel = $('#objectInfoPanelTemplate').clone().prop({ id: "objectInfoPanel" + self.id()});
                this.mouseOverPanel.find("h3").contents()[0].textContent = options.name;
                this.mouseOverPanel.find("p").first().html(this.mouseOverText);
                this.mouseOverPanel.find("img").first().attr("src", options.iconUrl);
                this.mouseOverPanel.find(".currentStateInactiveInfo").first().html(GameConfig.config['objectInactiveString']);
                this.mouseOverPanel.find("h3 button").first().click(function() {
                    self.hideMouseOverPanel();
                });
                this.mouseOverPanel.mouseover(function(){
                    self.cancelTimeouts("Off");
                });
                this.mouseOverPanel.mouseout(function(){
                    self.cancelTimeouts("Off");
                    //add a timeout before hiding panel
                    self.mouseOverPanelOffTimeout = new IgeTimeout(function () {
                        self.hideMouseOverPanel();
                    }, parseInt(GameConfig.config['mouseOverPanelOffTimeout']));
                });
                this.mouseOverPanel.find(".currentStateAction").first().click(function(){
                    if(ige.client.fsm.currentStateName() === "select"){
                        self.handleMouseClick();
                    }
                })
                //add mouseover panel to main container
                $("#objectInfoContainer").append(this.mouseOverPanel);

                this.mouseDown(function(){
                    if(ige.client.fsm.currentStateName() === "select"){
                        ige.input.stopPropagation();
                    }
                });

                this.mouseUp(function(){
                    if(ige.client.fsm.currentStateName() === "select"){
                        ige.input.stopPropagation();
                        self.handleMouseClick();
                    }
                });

                this.mouseOver(function(){
                    var self = this;
                    if(ige.client.fsm.currentStateName() === "select" || ige.client.fsm.currentStateName() === "view"){
                        this.layer(1)
                            .highlight(true);

                        if(ige.client.fsm.currentStateName() === "select"){
                            self.updateMouseOverPanelContents();
                        }

                        self.updateMouseOverPanelPosition(true);

                        if(ige.client.currentMouseOverPanelOwner && ige.client.currentMouseOverPanelOwner !== self){
                            ige.client.currentMouseOverPanelOwner.cancelTimeouts();
                            ige.client.currentMouseOverPanelOwner.hideMouseOverPanel();
                        }

                        ige.client.currentMouseOverPanelOwner = self;

                        self.cancelTimeouts("Off");
                        //add a timeout before showing panel
                        self.mouseOverPanelOnTimeout = new IgeTimeout(function () {
                            self.showMouseOverPanel();
                        }, parseInt(GameConfig.config['mouseOverPanelOnTimeout']));
                    }
                })

                this.mouseOut(function(){
                    this.layer(0)
                        .highlight(false);

                    self.cancelTimeouts();
                    //add a timeout before hiding panel
                    self.mouseOverPanelOffTimeout = new IgeTimeout(function () {
                        self.hideMouseOverPanel();
                    }, parseInt(GameConfig.config['mouseOverPanelOffTimeout']));
                })

                this.mouseMove(function(){
                    self.cancelTimeouts("Off");
                    if(ige.client.fsm.currentStateName() === "select" || ige.client.fsm.currentStateName() === "view")
                        ige.input.stopPropagation();
                })
	        },

            place: function(noBuildAnimation) {
                GameObject.prototype.place.call(this);

                if(noBuildAnimation)
                    return

                //if(options.cell == 1) // no build animation
                  //  return

                this._buildProgressBar = new IgeUiProgressBar()
					.barBackColor('#f2b982')
					.barColor('#69f22f')
					.barBorderColor('#3a9bc5')
					.min(0)
					.max(100)
					.progress(0)
					.width(50)
					.height(10)
                    .translateTo(0,-40,0)
					.mount(this);

                this._buildProgressTime = new IgeFontEntity()
                    .colorOverlay('white')
                    .nativeFont(GameConfig.config['gameFont'])
                    .nativeStroke(4)
                    .nativeStrokeColor('#000000')
                    .width(200)
                    .height(100)
                    .mount(this)
                    .translateTo(0,-60,0)
                    .text('')
            },

            update: function() {
                GameObject.prototype.update.call(this);

                this.updateMouseOverPanelPosition();

                if(this.specialEventNotifyElement) {
                    this.specialEventNotifyElement.css("top", this.screenPosition().y - 100);
                    this.specialEventNotifyElement.css("left", this.screenPosition().x - 7);
                }

                if(this._buildProgressBar) {
                    var progress,
                        remainingMilliseconds,
                        remainingSeconds,
                        remainingMinutes,
                        remainingHours,
                        remainingDays,
                        progressText = '';

                    progress = Math.floor((100 / this.getCurrentStateFinishTime()) * (Date.now() - this._buildStarted));

                    remainingMilliseconds = this.getCurrentStateFinishTime() - (Date.now() - this._buildStarted)

                    remainingDays = Math.floor(remainingMilliseconds / 864e5);
                    remainingHours = Math.floor((remainingMilliseconds % 864e5) / 36e5);
                    remainingMinutes = Math.floor((remainingMilliseconds % 36e5) / 6e4);
                    remainingSeconds = Math.floor((remainingMilliseconds % 6e4) / 1000);

                    if(remainingDays > 0){
                        progressText += remainingDays + 'd'

                        if(remainingHours > 0)
                            progressText += remainingHours + 'h'
                        else if(remainingMinutes > 0)
                            progressText += remainingMinutes + 'm'
                        else if(remainingSeconds > 0)
                            progressText += remainingSeconds + 's'

                    }else if(remainingHours > 0){
                        progressText += remainingHours + 'h'

                        if(remainingMinutes > 0)
                            progressText += remainingMinutes + 'm'
                        else if(remainingSeconds > 0)
                            progressText += remainingSeconds + 's'

                    }else if(remainingMinutes > 0){
                        progressText += remainingMinutes + 'm'
                        progressText += remainingSeconds + 's'
                    }else{
                        progressText += remainingSeconds + 's'
                    }


                    this._buildProgressBar.progress(progress);
                    this._buildProgressTime.text(progressText);
                    this.mouseOverPanel.find(".currentStateCountdown").first().html(progressText);

                    if(progress >= 100) {
                        this.finishProgress();
                    } else {
                        var cellno = this.getCurrentStateCellNo(progress);
                        //console.log(cellno)
                        if(cellno == 0) cellno = 1
                        this.cell(cellno)
                    }
                }
            },

            getCurrentStateFinishTime: function(){
                switch(this.currentState){
                    case 'building':
                        return this.buildTimeMilliseconds;
                    case 'waitingSpecialEvent':
                        return convertTimeFormatToMilliseconds(SpecialEvents.events[this.getCurrentSpecialEvent()].time);
                }
            },

            getCurrentStateCellNo: function(progress){
                switch(this.currentState){
                    case 'building':
                        return Math.ceil(progress / 100 * (options.builtCell - 1));
                    case 'waitingSpecialEvent':
                        var startCell = parseInt(SpecialEvents.events[this.getCurrentSpecialEvent()].startCell),
                            endCell = parseInt(SpecialEvents.events[this.getCurrentSpecialEvent()].endCell);
                        if(isNaN(startCell))
                            return options.cell;
                        if(isNaN(endCell))
                            endCell = options.cell;
                        return Math.floor(progress / 100 * (endCell - startCell)) + startCell;
                }
            },

            getCurrentStateSpeedValue: function(progress){
                switch(this.currentState){
                    case 'building':
                        return this.buildTimeSpeedValue;
                    case 'waitingSpecialEvent':
                        return parseInt(SpecialEvents.events[this.getCurrentSpecialEvent()].speedValue);
                    case 'ready':
                        return -1;
                }
            },

            getCurrentSpecialEvent: function(){
                if(this.currentSpecialEvent === null || this.currentSpecialEvent === undefined)
                    this.currentSpecialEvent = this.specialEvents[0];
                return this.currentSpecialEvent;
            },

            getNextSpecialEvent: function(){
                var next, currentIndex, current = this.getCurrentSpecialEvent();
                currentIndex = this.specialEvents.indexOf(current);

                if(this.specialEvents.length === 1)
                    return current;

                return (++currentIndex >= this.specialEvents.length) ? this.specialEvents[0] : this.specialEvents[currentIndex];
            },

            getPrevSpecialEvent: function(){
                var prev, currentIndex, current = this.getCurrentSpecialEvent();
                currentIndex = this.specialEvents.indexOf(current);

                if(this.specialEvents.length === 1)
                    return current;

                return (--currentIndex < 0) ? this.specialEvents[this.specialEvents.length - 1] : this.specialEvents[currentIndex];
            },

            finishProgress: function(){
                var endCell;
                API.saveObjectBuiltDate(this, Date.now())
                if(this.currentState === "building"){
                    ige.client.eventEmitter.emit('buildCompleted', {"id":classId, "type":this.type})
                    endCell = options.builtCell;
                }else if(this.currentState === "waitingSpecialEvent"){
                    endCell = parseInt(SpecialEvents.events[this.getCurrentSpecialEvent()].endCell);
                    if(isNaN(endCell))
                        endCell = options.cell;
                    this.currentSpecialEvent = this.getNextSpecialEvent();
                }
                this.currentState = "ready";
                API.saveObjectStateProperties(this, {"currentState" : this.currentState, "currentSpecialEvent": this.currentSpecialEvent});
                this._buildProgressBar.destroy()
                this._buildProgressBar = null
                this._buildProgressTime.destroy()
                this._buildProgressTime = null
                this.cell(endCell);
                this.notifySpecialEvent();
                this.updateMouseOverPanelContents();
            },

            setEndCell: function(){
                var endCell;
                if(this.specialEvent !== "None")
                    endCell = parseInt(SpecialEvents.events[this.getPrevSpecialEvent()].endCell);
                if(isNaN(endCell))
                    endCell = options.cell;
                this.cell(endCell);
            },

            notifySpecialEvent: function(){
                var self = this;
                if(self.specialEvent !== "None" && SpecialEvents.events[this.getCurrentSpecialEvent()].notifyIcon !== "None"){
                    self.specialEventNotifyElement = $("<span class='notifyIconWrapper'></span>")
                        .appendTo("#notifyIconContainer")
                        .css("top",self.screenPosition().y-100)
                        .css("left",self.screenPosition().x-7);
                    $("<img class='notifyIcon' src='" + ige.client.textures[SpecialEvents.events[this.getCurrentSpecialEvent()].notifyIcon].url() + "'>")
                        .appendTo(self.specialEventNotifyElement)
                        .animate({ top: '+=50px' }, 1000, SpecialEvents.events[this.getCurrentSpecialEvent()].notifyIconEasing);
                }
            },

            removeNotifyIcon: function(){
                if(this.specialEventNotifyElement)
                    this.specialEventNotifyElement.remove();
            },

            speedProgress: function(){
                var message, callBack, price = {coins:0}, self = this, confirmOnly = null;

                price.cash = this.getCurrentStateSpeedValue();

                if(price.cash === -1){
                    message  = 'Progress already finished!';
                    confirmOnly = true;
                }else{
                    //show are you sure and reduce assets
                    message  = 'Speed progress for ' + price.cash + ' VBuck' + ((price.cash > 1) ? "s" : "") + '?';

                    callBack = function() {
                        if(self.getCurrentStateSpeedValue() === -1){
                            new BuyConfirm('Progress already finished!',null,true)
                                .layer(1)
                                .show()
                                .mount(ige.$('uiScene'));
                            return;
                        }
                        if(!API.reduceAssets(
                                {coins: parseInt(price.coins, 10),
                                    cash: parseInt(price.cash, 10)}).status) {
                            // Not enough money?
                            mixpanel.track("Not enough money");
                            new BuyConfirm(GameConfig.config['notEnoughCashString'],
                                function () {
                                    ige.$('cashDialog').show();
                                })
                                .layer(1)
                                .show()
                                .mount(ige.$('uiScene'));
                            return;
                        }
                        dataLayer.push({'event': 'gameObjectSpeedProgress'});
                        self.finishProgress();
                    }
                }
                new BuyConfirm(message,callBack,confirmOnly)
                    .layer(1)
                    .show()
                    .mount(ige.$('uiScene'));
            },

            showMouseOverPanel: function(){
                var self = this;
                self.isMouseOverPanelOn = true;
                self.mouseOverPanel.show(GameConfig.config['mouseOverPanelShowEffect'], parseInt(GameConfig.config['mouseOverPanelShowDuration']));
            },

            hideMouseOverPanel: function(){
                var self = this;
                self.mouseOverPanel.hide(GameConfig.config['mouseOverPanelHideEffect'], parseInt(GameConfig.config['mouseOverPanelHideDuration']), function(){
                    self.isMouseOverPanelOn = false;
                });
            },

            cancelTimeouts: function(whichOne){
                var self = this;

                if(self.mouseOverPanelOnTimeout && whichOne !== "Off"){
                    self.mouseOverPanelOnTimeout.cancel();
                    self.mouseOverPanelOnTimeout = null;
                }
                if(self.mouseOverPanelOffTimeout && whichOne !== "On"){
                    self.mouseOverPanelOffTimeout.cancel();
                    self.mouseOverPanelOffTimeout = null;
                }
            },

            handleMouseClick: function(){
                var self = this;

                if (self.specialEvent !== "None" && API.stateObjectsLookup[self.id()].buildCompleted) {
                    self.currentSpecialEvent = self.getCurrentSpecialEvent();
                    var costs = SpecialEvents.events[self.currentSpecialEvent].cost.split(",");
                    var price = ClientHelpers.convertToPrice(costs);
                    var result = API.reduceAssets(
                        {coins: parseInt(price.coins, 10),
                            cash: parseInt(price.cash, 10),
                            water: parseInt(price.water, 10)});
                    if(!result.status) {
                        // Not enough assets?
                        mixpanel.track("Not enough assets");
                        var message = "You don't have enough ";
                        if(!result.coins)
                            message += "Coins "
                        if(!result.cash)
                            message += "VBucks "
                        if(!result.water)
                            message += "Water"
                        new BuyConfirm(message, null, true)
                            .layer(1)
                            .show()
                            .mount(ige.$('uiScene'));
                    }else{
                        dataLayer.push({'gameObjectClickActionName': self.currentSpecialEvent});
                        dataLayer.push({'event': 'gameObjectClick'});
                        self._buildStarted = Date.now();
                        API.resetBuildTimes(self, self._buildStarted);
                        self.currentState = "waitingSpecialEvent";
                        API.saveObjectStateProperties(self, {"currentState" : self.currentState, "currentSpecialEvent" : self.currentSpecialEvent});
                        self.place();
                        self.removeNotifyIcon();
                        ige.client.eventEmitter.emit(self.currentSpecialEvent, {
                            "id": self.classId(),
                            "type": self.type,
                            "positionX": self.screenPosition().x,
                            "positionY": (self.screenPosition().y - 30),
                            "itemRef": self
                        });
                    }
                    self.updateMouseOverPanelContents();
                }
                else if (!API.stateObjectsLookup[self.id()].buildCompleted) {
                    self.speedProgress();
                    self.updateMouseOverPanelContents();
                }
            },

            updateMouseOverPanelContents: function(){
                var self = this,
                    iconTooltipContent, countDownTooltipContent, speedProgressTooltipContent;

                if (this.specialEvent !== "None" && API.stateObjectsLookup[this.id()].buildCompleted) {
                    this.currentSpecialEvent = this.getCurrentSpecialEvent();
                    var costs = SpecialEvents.events[this.currentSpecialEvent].cost.split(",");
                    var price = ClientHelpers.convertToPrice(costs);
                    var message = SpecialEvents.events[this.currentSpecialEvent].displayName;
                    iconTooltipContent = SpecialEvents.events[this.currentSpecialEvent].description;
                    if(price.coins > 0 || price.cash > 0 || price.water > 0)
                        message += " for ";
                    if(price.coins > 0)
                        message += price.coins + "<img class='tooltipImage' src='assets/textures/ui/Coin1.png'> ";
                    if(price.cash > 0)
                        message += price.cash + "<img class='tooltipImage' src='assets/textures/ui/Banknotes.png'> ";
                    if(price.water > 0)
                        message += price.water + "<img class='tooltipImage' src='assets/textures/ui/Water-48.png'>";

                    self.mouseOverPanel.find(".currentStateName img").first().attr("src",ige.client.textures[SpecialEvents.events[self.getCurrentSpecialEvent()].notifyIcon].url());
                    self.mouseOverPanel.find(".currentStateCountdown").first().html("Ready!").attr("title","").tooltip().tooltip('destroy').css("display","table-cell");
                    self.mouseOverPanel.find(".currentStateAction").first().html(message).attr("title","").tooltip().tooltip('destroy').css("display","table-cell");
                }else if (!API.stateObjectsLookup[this.id()].buildCompleted) {
                    countDownTooltipContent = "Waiting ";
                    speedProgressTooltipContent = "Click to speed progress ";
                    if(this.currentState === "building"){
                        self.mouseOverPanel.find(".currentStateName img").first().attr("src","assets/textures/ui/Under-Construction-48.png");
                        countDownTooltipContent += "on construction";
                        speedProgressTooltipContent += "on construction";
                        iconTooltipContent = GameConfig.config['underConstructionString'];
                    } else if(this.currentState === "waitingSpecialEvent"){
                        self.mouseOverPanel.find(".currentStateName img").first().attr("src",ige.client.textures[SpecialEvents.events[self.getCurrentSpecialEvent()].notifyIcon].url());
                        this.currentSpecialEvent = this.getCurrentSpecialEvent();
                        countDownTooltipContent += SpecialEvents.events[this.currentSpecialEvent].speedText;
                        speedProgressTooltipContent += SpecialEvents.events[this.currentSpecialEvent].speedText;
                        iconTooltipContent = SpecialEvents.events[this.currentSpecialEvent].description;
                    }
                    self.mouseOverPanel.find(".currentStateCountdown").first().attr("title",countDownTooltipContent).tooltip().css("display","table-cell");
                    self.mouseOverPanel.find(".currentStateAction").first().html("<img src='assets/textures/ui/Fast-Forward-48.png' width='25' height='25'><br>" +
                        "<span class='currentStateSpeedValue'>" + self.getCurrentStateSpeedValue() + "</span>" +
                        "<img src='assets/textures/ui/Banknotes.png' width='15' height='15'>").attr("title",speedProgressTooltipContent).tooltip().css("display","table-cell");
                }else{
                    iconTooltipContent = GameConfig.config['comingSoonString'];
                    self.mouseOverPanel.find(".currentStateName img").first().attr("src","assets/textures/ui/Error-48.png");
                    self.mouseOverPanel.find(".currentStateCountdown").first().css("display","none");
                    self.mouseOverPanel.find(".currentStateAction").first().css("display","none");
                    self.mouseOverPanel.find(".currentStateInactiveInfo").first().css("display","table-cell");
                }
                self.mouseOverPanel.find(".currentStateName img").first().attr("title",iconTooltipContent).tooltip();
            },

            updateMouseOverPanelPosition: function(force){
                var self = this;

                if(self.isMouseOverPanelOn === true || force === true){
                    var topCSS = this.screenPosition().y - self.mouseOverPanel.height() - (this.height() / 4),
                        leftCSS = this.screenPosition().x - (self.mouseOverPanel.width() / 2),
                        arrowDiv = self.mouseOverPanel.find(".arrow").first(),
                        arrowTopCSS, arrowLeftCSS;

                    if(topCSS < 0){
                        topCSS = this.screenPosition().y + (this.height() / 2);
                        arrowDiv.attr("class", "arrow arrow-up");
                        arrowTopCSS = topCSS - 20;
                    }else{
                        arrowDiv.attr("class", "arrow arrow-down");
                        arrowTopCSS = topCSS + self.mouseOverPanel.height();
                    }

                    if(leftCSS < 0)
                        leftCSS = 0;
                    else if(this.screenPosition().x + (self.mouseOverPanel.width() / 2) > $(window).width())
                        leftCSS = $(window).width() - self.mouseOverPanel.width();

                    if(leftCSS <= 0 && this.screenPosition().x <= 0)
                        arrowLeftCSS = 10;
                    else if(this.screenPosition().x + (self.mouseOverPanel.width() / 2) >= $(window).width() && this.screenPosition().x >= $(window).width())
                        arrowLeftCSS = $(window).width() - 50;
                    else
                        arrowLeftCSS = this.screenPosition().x - 20;

                    self.mouseOverPanel.css("top", topCSS);
                    self.mouseOverPanel.css("left", leftCSS);
                    arrowDiv.css("top", arrowTopCSS);
                    arrowDiv.css("left", arrowLeftCSS);
                }
            }
        });
    }
}
