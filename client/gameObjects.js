
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

                this.mouseOver(function(){
                    if((ige.client.fsm.currentStateName() === "select" || ige.client.fsm.currentStateName() === "view") && !ige.client.data('moveItem')){
                        this.layer(1)
                            .highlight(true);

                        $( '#objectDescription').html(this.mouseOverText)
                            .show();

                        if(ige.client.fsm.currentStateName() === "select" && !ige.client.data('moveItem')){
                            if (this.specialEvent !== "None" && API.stateObjectsLookup[this.id()].buildCompleted) {
                                this.currentSpecialEvent = this.getCurrentSpecialEvent();
                                var costs = SpecialEvents.events[this.currentSpecialEvent].cost.split(",");
                                var price = ClientHelpers.convertToPrice(costs);
                                var message = "Click to " + SpecialEvents.events[this.currentSpecialEvent].displayName;
                                if(price.coins > 0 || price.cash > 0 || price.water > 0)
                                    message += " for ";
                                if(price.coins > 0)
                                    message += price.coins + "<img class='tooltipImage' src='assets/textures/ui/Coin1.png'> ";
                                if(price.cash > 0)
                                    message += price.cash + "<img class='tooltipImage' src='assets/textures/ui/Banknotes.png'> ";
                                if(price.water > 0)
                                    message += price.water + "<img class='tooltipImage' src='assets/textures/ui/Water-48.png'>";
                                $( '#igeFrontBuffer' ).tooltip({
                                    show: {delay:300},
                                    items: document,
                                    content: message,
                                    track: true
                                });
                                $('#igeFrontBuffer').trigger('mouseover')
                                $( '#igeFrontBuffer' ).tooltip("open");
                            }else if (!API.stateObjectsLookup[this.id()].buildCompleted) {
                                $( '#igeFrontBuffer' ).tooltip({
                                    show: {delay:300},
                                    items: document,
                                    content: "Click to speed progress",
                                    track: true
                                });
                                $('#igeFrontBuffer').trigger('mouseover')
                                $( '#igeFrontBuffer' ).tooltip("open");
                            }
                        }
                    }
                })

                this.mouseOut(function(){
                    this.layer(0)
                        .highlight(false);
                    $( '#objectDescription').html('')
                        .hide();
                    $('#igeFrontBuffer').tooltip().tooltip('destroy')
                })

                this.mouseMove(function(){
                    if(ige.client.fsm.currentStateName() === "select" && !ige.client.data('moveItem'))
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
                    message  = 'Speed progress for ' + price.cash + ' VBucks?';

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
                                    cash: parseInt(price.cash, 10)})) {
                            // Not enough money?
                            mixpanel.track("Not enough money");
                            ige.$('cashDialog').show();
                            return;
                        }
                        self.finishProgress();
                    }
                }
                new BuyConfirm(message,callBack,confirmOnly)
                    .layer(1)
                    .show()
                    .mount(ige.$('uiScene'));
            }
        });
    }
}
