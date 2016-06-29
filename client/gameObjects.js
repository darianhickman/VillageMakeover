
var GameObjects = {
    gameObjectTextures: {},
    setupMarket: function(marketDialog) {
        var pageCount = Math.ceil(GameObjects._marketCallbacks.length / 6);
        marketDialog.createPages(pageCount);

        for(var i in GameObjects._marketCallbacks) {
		    (GameObjects._marketCallbacks[i])(marketDialog)
        }
    },
    setupEditor: function(editorDialog) {
        var pageCount = Math.ceil(GameObjects.catalog.length / 6);
        editorDialog.createPages(pageCount);

        for(var i in GameObjects.catalog) {
            var item = GameObjects.catalog[i]
            editorDialog.addItem({
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
                this.specialEventDisplayName = options.specialEventDisplayName;
                this.specialEventTime = options.specialEventTime;
                this.specialEventTimeMilliseconds = convertTimeFormatToMilliseconds(this.specialEventTime);
                this.specialEventStartCell = parseInt(options.specialEventStartCell);
                this.specialEventSpeedValue = parseInt(options.specialEventSpeedValue);
                this.specialEventNotifyIcon = options.specialEventNotifyIcon;
                this.specialEventNotifyIconEasing = options.specialEventNotifyIconEasing;

                this.mouseOver(function(){
                    if(ige.client.fsm.currentStateName() === "select" && !ige.client.data('moveItem')){
                        this.layer(1)
                            .highlight(true);

                        $( "#mouseOverDialog" ).dialog({ resizable: false, draggable: false, dialogClass: 'ui-dialog-no-titlebar', position:{at: "middle bottom"}, closeOnEscape: true, width: 450, height: 120, modal: false, autoOpen: false });
                        $( "#mouseOverDialog" ).dialog( "open" );
                        $( '#mouseOverObjectText').html(this.mouseOverText);
                        var middle = ($( "#mouseOverDialog" ).height() - $( '#mouseOverObjectText').height()) / 2
                        $( '#mouseOverObjectText').css('padding-top', middle);

                    }
                })

                this.mouseOut(function(){
                    this.layer(0)
                        .highlight(false);
                    try{
                        $( "#mouseOverDialog" ).dialog( "close" );
                    }catch(error){

                    }
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
                    .nativeFont('25px Times New Roman')
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
                    if(!this.isNotifyElementAnimating)
                        this.specialEventNotifyElement.css("top", this.screenPosition().y - 50);
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
                        return this.specialEventTimeMilliseconds;
                }
            },

            getCurrentStateCellNo: function(progress){
                switch(this.currentState){
                    case 'building':
                        return Math.ceil(progress / 100 * (options.cell - 1));
                    case 'waitingSpecialEvent':
                        return Math.floor(progress / 100 * (options.cell - this.specialEventStartCell)) + this.specialEventStartCell;
                }
            },

            getCurrentStateSpeedValue: function(progress){
                switch(this.currentState){
                    case 'building':
                        return this.buildTimeSpeedValue;
                    case 'waitingSpecialEvent':
                        return this.specialEventSpeedValue;
                }
            },

            finishProgress: function(){
                API.saveObjectBuiltDate(this, Date.now())
                if(this.currentState === "building")
                    ige.client.eventEmitter.emit('buildCompleted', {"id":classId, "type":this.type})
                this.currentState = "ready";
                API.saveObjectState(this, this.currentState);
                this._buildProgressBar.destroy()
                this._buildProgressBar = null
                this._buildProgressTime.destroy()
                this._buildProgressTime = null
                this.cell(options.cell)
                this.notifySpecialEvent();
            },

            notifySpecialEvent: function(){
                var self = this;
                if(self.specialEvent !== "None" && self.specialEventNotifyIcon !== "None"){
                    self.specialEventNotifyElement = $("<img class='notifyIcon' src='" + ige.client.textures[self.specialEventNotifyIcon].url() + "'></img>")
                        .appendTo("#notifyIconContainer")
                        .css("top",self.screenPosition().y-100)
                        .css("left",self.screenPosition().x-7)
                        .animate({ top: '+=50px' }, 1000, self.specialEventNotifyIconEasing, function(){self.isNotifyElementAnimating = false});
                    self.isNotifyElementAnimating = true;
                }
            },

            removeNotifyIcon: function(){
                if(this.specialEventNotifyElement)
                    this.specialEventNotifyElement.remove();
            },

            speedProgress: function(){
                var message, callback, price = {coins:0}, self = this;

                price.cash = this.getCurrentStateSpeedValue();

                //show are you sure and reduce assets
                message  = 'Speed progress for ' + price.cash + ' villagebucks?';

                callBack = function() {
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

                var cashDialog = new BuyConfirm(message,callBack)
                    .layer(1)
                    .show()
                    .mount(ige.$('uiScene'));


            }
        });
    }
}
