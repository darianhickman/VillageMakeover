
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
