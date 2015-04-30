
var GameObjects = {
    gameObjectTextures: {},
    setupMarket: function(marketDialog) {
        for(var i in GameObjects._marketCallbacks) {
		    (GameObjects._marketCallbacks[i])(marketDialog)
        }
    },
    _marketCallbacks: [],
    loadCatalog: function(catalog) {
        for(var i in catalog) {
            var item = catalog[i]
            GameObjects.createGameObjectClass(item.id, item)
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
			    'scale': options.scale
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

                this.mouseOverFontEntity = new IgeFontEntity()
                    .layer(2)
                    .colorOverlay('white')
                    .texture(ige.client.textures.aharoniFont)
                    .width(500)
                    .height(150)
                    .textAlignX(1)
                    .autoWrap(true)
                    .text(options.description)
                    .mount(this)
                    .hide()

                var totalLines = (this.mouseOverFontEntity._renderText.match(new RegExp('\n', 'g')) || []).length || 1
                this.mouseOverFontEntity.translateTo(0, -this.height() / 2 - 20 * totalLines, 0)

                this.fontEntityBackground = new IgeEntity()
                    .layer(2)
                    .width(this.mouseOverFontEntity.measureTextWidth(this.mouseOverFontEntity._renderText) + 20)
                    .height((totalLines + 1) * 40)
                    .translateTo(0, -this.height() / 2 - 20 * totalLines, 0)
                    .texture(ige.client.textures.rectangle)
                    .mount(this)
                    .hide()

                this.mouseOver(function(){
                    if(ige.client.fsm.currentStateName() === "select" && !ige.client.data('moveItem')){
                        this.mouseOverFontEntity.show()
                        this.fontEntityBackground.show()
                        this.layer(24)
                    }
                })

                this.mouseOut(function(){
                    this.mouseOverFontEntity.hide()
                    this.fontEntityBackground.hide()
                    this.layer(23)
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

                if(options.cell == 1) // no build animation
                    return

                this._buildStarted = ige._currentTime;
                this._buildProgressBar = new IgeUiProgressBar()
					.barBackColor('#f2b982')
					.barColor('#69f22f')
					.barBorderColor('#3a9bc5')
					.min(0)
					.max(100)
					.progress(0)
					.width(50)
					.height(10)
					.mount(this);
            },

            update: function() {
                GameObject.prototype.update.call(this);

                if(this._buildProgressBar) {
                    var progress = Math.floor((100 / 15000) * (ige._currentTime - this._buildStarted));

                    this._buildProgressBar.progress(progress);

                    if(progress >= 100) {
                        this._buildProgressBar.destroy()
                        this._buildProgressBar = null
                        this.cell(options.cell)
                    } else {
                        var cellno = Math.ceil(progress / 100 * (options.cell - 1))
                        if(cellno == 0) cellno = 1
                        this.cell(cellno)
                    }
                }
            }
        });
    }
}
