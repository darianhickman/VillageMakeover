
var GameObjects = {
    gameObjectTextures: {},
    setupMarket: function(marketDialog) {
        for(var i in GameObjects._marketCallbacks) {
		    (GameObjects._marketCallbacks[i])(marketDialog)
        }
    },
    _marketCallbacks: [],
};

(function() {
    function createGameObjectClass(classId, options) {
        GameObjects.gameObjectTextures[classId] = [options.textureUrl, options.cellCount || 1]

        GameObjects._marketCallbacks.push(function(marketDialog) {
            marketDialog.addItem({
			    'id': classId,
			    'classId': classId,
			    'title': classId,
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

    createGameObjectClass("WoodLarge", {
        textureUrl: "assets/textures/sprites/woodLarge.png",
        coins: 3,
        cash: 0,
        cell: 1,
        scale: false,
        bounds3d: [38, 38, 30],
        anchor: [-5, 8],
    })
    createGameObjectClass("WoodSmall", {
        textureUrl: "assets/textures/sprites/woodSmall.png",
        coins: 3,
        cash: 0,
        cell: 1,
        scale: false,
        bounds3d: [38, 38, 30],
        anchor: [-3, 13],
    })
    createGameObjectClass("SmokeyHut", {
        textureUrl: "assets/textures/sprites/smokeyHut.png",
        coins: 3,
        cash: 0,
        cell: 1,
        scale: true,
        bounds3d: [76, 76, 50],
        anchor: [-12, 4],
    })
    createGameObjectClass("Hut1", {
        textureUrl: "assets/textures/sprites/hut1.png",
        coins: 3,
        cash: 0,
        cell: 2,
        cellCount: 2,
        scale: true,
        bounds3d: [76, 76, 50],
        anchor: [-2, -1],
    })
    createGameObjectClass("Hut2", {
        textureUrl: "assets/textures/sprites/hut2.png",
        coins: 3,
        cash: 0,
        cell: 3,
        cellCount: 3,
        scale: true,
        bounds3d: [76, 76, 50],
        anchor: [-2, 4],
    })
})()
