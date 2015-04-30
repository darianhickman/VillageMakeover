var gameScale = 1.5
var uniqueCounter = 0

var Client = IgeClass.extend({
	classId: 'Client',

	init: function () {
		//ige.addComponent(IgeEditorComponent);
		ige.addComponent(IgeAudioComponent);

		// Load our textures
		var self = this;
		this.audio = {};
		this.textures = {};
		this.fsm = new IgeFSM();

		// Define the fsm states
		this.fsm.defineState('select', {
            enter: function(data, completeCallback) {
                // Hook mouse events
                var self = this,
                    tileMap = ige.$('tileMap1');

                self.mouseUpHandle = tileMap.on('mouseUp', function (event, evc, data) {
                    if (!ige.client.data('moveItem')) {
                        // We're not already moving an item so check if the user
                        // just clicked on a building
                        var tile = tileMap.mouseToTile(),
                            item = ige.client.itemAt(tile.x, tile.y);

                        if (item) {
                            // The user clicked on a building so set this as the
                            // building we are moving.
                            ige.client.data('moveItem', item);
                            ige.client.data('moveItemX', item.data('tileX'));
                            ige.client.data('moveItemY', item.data('tileY'));

                            //set initial position to lastmoveX-Y data
                            item.data('lastMoveX', item.data('tileX'));
                            item.data('lastMoveY', item.data('tileY'));

                            ige.$('outlineEntity').tileWidth = item.data('tileWidth');
                            ige.$('outlineEntity').tileHeight = item.data('tileHeight');
                            ige.$('outlineEntity').isFeasible = true;
                            ige.$('outlineEntity').translateToTile(item.data('tileX'), item.data('tileY'));

                            ige.client.showGrid();
                        }else {
                            ige.$('bob').walkToTile(tile.x, tile.y);
                        }
                    } else {
                        // We are already moving a building, place this building
                        // down now
                        var item = ige.client.data('moveItem'),
                            moveX = item.data('lastMoveX'),
                            moveY = item.data('lastMoveY');

                        item.moveTo(moveX, moveY);
                        // Clear the data
                        ige.client.data('moveItem', '');

                        ige.client.hideGrid();

                        API.updateObject(item, moveX, moveY)
                    }
                });

                self.mouseMoveHandle = tileMap.on('mouseMove', function (event, evc, data) {
                    var item = ige.client.data('moveItem'),
                        map = tileMap.map,
                        tile = tileMap.mouseToTile();

                    if (item) {
                        // Check if the current tile is occupied or not
                        if (!tileMap.inGrid(tile.x, tile.y, item.data('tileWidth'), item.data('tileHeight'))) {
                            return;
                        }

                        if (!map.collision(tile.x, tile.y, item.data('tileWidth'), item.data('tileHeight')) || map.collisionWithOnly(tile.x, tile.y, item.data('tileWidth'), item.data('tileHeight'), item)) {
                            // We are currently moving an item so update it's
                            // translation
                            var tx = tile.x + item._tileAdjustX;
                            var ty = tile.y + item._tileAdjustY;

                            item.translateToTile(tx, ty);
                            ige.$('outlineEntity').translateToTile(tile.x, tile.y);

                            // Store the last position we accepted
                            item.data('lastMoveX', tile.x);
                            item.data('lastMoveY', tile.y);
                        }
                    }
                });


                completeCallback();
            },
            exit: function(data, completeCallback) {
                // Un-hook mouse events
                var self = this,
                    tileMap = ige.$('tileMap1');

                tileMap.off('mouseUp', self.mouseUpHandle);
                tileMap.off('mouseMove', self.mouseMoveHandle);

                if (ige.client.data('moveItem')) {
                    // We are moving a building, place this building
                    // down before changing state
                    var item = ige.client.data('moveItem'),
                        moveX = item.data('lastMoveX'),
                        moveY = item.data('lastMoveY');

                    item.moveTo(moveX, moveY);
                    // Clear the data
                    ige.client.data('moveItem', '');

                    ige.client.hideGrid();

                    API.updateObject(item, moveX, moveY)
                }
                completeCallback();
            }
        });

		this.fsm.defineState('buildDialog', {
            enter: function(data, completeCallback) {
				completeCallback();
			},
            exit: function(data, completeCallback) {
				completeCallback();
			}
        });

        this.fsm.defineState('cashDialog', {
            enter: function(data, completeCallback) {
                completeCallback();
            },
            exit: function(data, completeCallback) {
                completeCallback();
            }
        });

        this.fsm.defineState('coinDialog', {
            enter: function(data, completeCallback) {
                completeCallback();
            },
            exit: function(data, completeCallback) {
                completeCallback();
            }
        });

        var clientSelf = this

		this.fsm.defineState('build', {
            enter: function(data, completeCallback) {
				var self = this,
					tileMap = ige.$('tileMap1');

				// Create a new instance of the object we are going to build
				ige.client.cursorObject = new ige.newClassInstance(data.classId)
					.mount(ige.$('tileMap1'))
                    .layer(24);
                var cursorClassId = data.classId

				ige.client.cursorObjectData = data;

				var objectTileWidth = Math.ceil(ige.client.cursorObject._bounds3d.x
                                                / tileMap._tileWidth),
                    objectTileHeight = Math.ceil(ige.client.cursorObject._bounds3d.y
                                             / tileMap._tileHeight);

                ige.client.cursorObject.data('tileWidth', objectTileWidth)
                    .data('tileHeight', objectTileHeight);

                ige.$('outlineEntity').tileWidth = objectTileWidth;
                ige.$('outlineEntity').tileHeight = objectTileHeight;

                ige.client.showGrid();

				// Hook mouse events
				self.mouseMoveHandle = tileMap.on('mouseMove', function (event, evc, data) {
					var tile = tileMap.mouseToTile();

					// Check that the tiles this object will occupy if moved are
					// not already occupied
					if (tileMap.inGrid(tile.x, tile.y, objectTileWidth, objectTileHeight)) {
                        var isFree = !tileMap.isTileOccupied(
						    tile.x,
						    tile.y,
						    objectTileWidth,
						    objectTileHeight);
                        ige.client.cursorObject.opacity(isFree ? 1 : 0.5);
                        ige.$('outlineEntity').isFeasible = isFree;
						// Move our cursor object to the tile
                        var tx = tile.x + ige.client.cursorObject._tileAdjustX;
                        var ty = tile.y + ige.client.cursorObject._tileAdjustY;
						ige.client.cursorObject.translateToTile(tx, ty);
                        ige.$('outlineEntity').translateToTile(tile.x, tile.y);
						self.cursorTile = tile;
					}
				});

				self.mouseUpHandle = tileMap.on('mouseUp', function (event, evc, data) {
                    var objectTileWidth = Math.ceil(ige.client.cursorObject._bounds3d.x
                            / tileMap._tileWidth),
                        objectTileHeight = Math.ceil(ige.client.cursorObject._bounds3d.y
                            / tileMap._tileHeight),
                        player = ige.$('bob'),
                        playerTile = player.currentTile(),
                        tile = tileMap.mouseToTile();

                    if (!tileMap.inGrid(tile.x, tile.y, objectTileWidth, objectTileHeight)) {
                        return;
                    }

                    ige.client.hideGrid();

                    if(tileMap.isTileOccupied(
						    tile.x,
						    tile.y,
						    objectTileWidth,
						    objectTileHeight)) {

                        ige.client.cursorObject.destroy();
                        ige.client.cursorObject = null;
					    ige.client.cursorObjectData = null;

                        clientSelf.fsm.enterState('select')

                        return;
                    }

                    // Reduce the coins progress bar by the cost
                    if(!API.reduceAssets(
                        {coins: parseInt(ige.client.cursorObjectData.coins, 10),
                        cash: parseInt(ige.client.cursorObjectData.cash, 10)})) {
                        // Not enough money?
                        ige.client.cursorObject.destroy();
                        ige.client.cursorObject = null;
					    ige.client.cursorObjectData = null;

                        var message = 'You don\'t have enough coins. \nWould you like to buy some?';

                        var cashDialog = new BuyConfirm(message,
                            function() {
                                ige.$('coinDialog').show();
                            })
                            .layer(1)
                            .show()
                            .mount(ige.$('uiScene'));

                        clientSelf.fsm.enterState('select')
                        return;
                    }



					// Play the audio
					ige.client.audio.monster_footstep.play();

					// Build the cursorObject by releasing it from our control
					// and switching state
					ige.client.cursorObject.occupyTile(
						self.cursorTile.x,
						self.cursorTile.y,
						objectTileWidth,
						objectTileHeight
					);

                    ige.client.cursorObject.data('tileX', self.cursorTile.x)
                        .data('tileY', self.cursorTile.y)
                        .data('tileWidth', objectTileWidth)
                        .data('tileHeight', objectTileHeight);

                    var objinfo = {
                        id: ige.client.cursorObject.id(),
                        x: self.cursorTile.x,
						y: self.cursorTile.y,
						w: objectTileWidth,
						h: objectTileHeight,
                        name: cursorClassId,
                    }

                    API.createObject(objinfo)

					// Grab the point the entity is at before we animate it
					var buildPoint = ige.client.cursorObject._translate.toIso();

					// Tween the object to the position by "bouncing" it
					ige.client.cursorObject
                        .layer(5)
						.translate().z(100)
						._translate.tween(
							{z: 0},
							1000,
							{easing:'outBounce'}
						).start();

					// Set initial state of object by calling the place() method
					ige.client.cursorObject.place();

                    //we don't need a coin animation and particle effect for zero coin
					if(ige.client.cursorObjectData.coins > 0){
                        // Create a cash value rising from placement that fades out
                        var coinAnim;

                        coinAnim = new IgeEntity()
                            .layer(10)
                            .texture(ige.client.textures.coin)
                            .dimensionsFromCell()
                            .scaleTo(1, 1, 1)
                            .translateToPoint(buildPoint)
                            .translateBy(-10, -50, 0)
                            .mount(ige.$('tileMap1'));

                        new IgeFontEntity()
                            .layer(2)
                            .textAlignX(0)
                            .colorOverlay('#ffffff')
                            .nativeFont('12px Verdana')
                            .textLineSpacing(0)
                            .text('-' + ige.client.cursorObjectData.coins)
                            .width(45)
                            .center(28)
                            .mount(coinAnim);

                        coinAnim
                            ._translate.tween(
                                {y: buildPoint.y - 100},
                                2000
                            )
                            .start(200);

                        coinAnim.tween(
                                {_opacity: 0},
                                2000,
                                {easing: 'inQuad'}
                            )
                            .afterTween(function () {
                                coinAnim.destroy();
                            })
                            .start(200);

                        // Play the coin particle effect
                        ige.$('coinEmitter')
                            .quantityMax(parseInt(ige.client.cursorObjectData.coins, 10))
                            .start();
                    }

					// Remove reference to the object
					ige.client.cursorObject = null;
					ige.client.cursorObjectData = null;

					// Enter the select state
					ige.client.fsm.enterState('select');

					// Check if the tile we are standing on is occupied now
					if (ige.$('tileMap1').isTileOccupied(playerTile.x, playerTile.y, 1, 1)) {
						// Move our player away from the tile
						ige.$('bob').walkToTile(playerTile.x + 1, playerTile.y - 1);
					} else {
						// Move the player to the building
						ige.$('bob').walkToTile(self.cursorTile.x, self.cursorTile.y);
					}
				});

				completeCallback();
			},
            exit: function(data, completeCallback) {
				// Clear our mouse listeners
				var self = this,
					tileMap = ige.$('tileMap1');

				tileMap.off('mouseUp', self.mouseUpHandle);
				tileMap.off('mouseMove', self.mouseMoveHandle);

                ige.client.hideGrid();

                if (ige.client.cursorObject) {
                    ige.client.cursorObject.destroy();
                    delete ige.client.cursorObject;
                }

                completeCallback();
			}
        });

		this.fsm.defineState('pan', {
            enter: function(data, completeCallback) {
				completeCallback();
			},
            exit: function(data, completeCallback) {
				completeCallback();
			}
        });

		this.fsm.defineTransition('build', 'buildDialog', function (data, callback) {
			// Ensure that the item we were building is removed because
			// it was not placed
			if (ige.client.cursorObject) {
				ige.client.cursorObject.destroy();
				delete ige.client.cursorObject;
			}

			// Callback with no error
			callback(false);
		});

		// Load game audio
		this.audio.select = new IgeAudio('./assets/audio/select.mp3');
        this.audio.normClick = new IgeAudio('./assets/audio/generalclick04.wav');
		//this.audio.construct = new IgeAudio('./assets/audio/construct.mp3');
        this.audio.monster_footstep = new IgeAudio('./assets/audio/creatur_footstep_large.mp3');
		this.audio.dialogOpen = new IgeAudio('./assets/audio/dialogOpen.mp3');

		// Load a game texture here
		this.textures.greenBackground = new IgeTexture('./assets/textures/backgrounds/greenBackground.png');
        this.textures.valleyBackground = new IgeTexture('./assets/textures/backgrounds/valleyBackground.png')
		this.textures.dirtBackground = new IgeTexture('./assets/textures/backgrounds/dirtBackground.png');
		this.textures.aharoniFont = new IgeFontSheet('./assets/textures/fonts/aharoni_26px.png');

		this.textures.moneyMenuBackground = new IgeTexture('./assets/textures/ui/CashMenuTemplate.png');
		this.textures.coinMenuBackground = new IgeTexture('./assets/textures/ui/CoinMenuTemplate.png');
        this.textures.mainMenuBackground = new IgeTexture('./assets/textures/ui/mainMenuBackground.png');
		this.textures.marketItemBack = new IgeTexture('./assets/textures/ui/marketItemBack.png');
		this.textures.buildButton = new IgeTexture('./assets/textures/ui/build.png');
        this.textures.greenPlus = new IgeTexture('./assets/textures/ui/green+.png');
		this.textures.giftButton = new IgeTexture('./assets/textures/ui/giftButton.png');
		this.textures.actionButtonBack = new IgeTexture('./assets/textures/ui/actionButtonBack.png');
		this.textures.actionIconSelect = new IgeTexture('./assets/textures/ui/actionIconSelect.png');
		this.textures.friendTile = new IgeTexture('./assets/textures/ui/friendTile.png');
		this.textures.marketMenuBack = new IgeTexture('./assets/textures/ui/marketMenuBack.png');
		this.textures.cashBar = new IgeTexture('./assets/textures/ui/cashBar.png');
		this.textures.coinsBar = new IgeTexture('./assets/textures/ui/coinsBar.png');
		//this.textures.energyBar = new IgeTexture('./assets/textures/ui/energyBar.png');
		//this.textures.xpBar = new IgeTexture('./assets/textures/ui/xpBar.png');
		this.textures.coin = new IgeTexture('./assets/textures/ui/coin.png');
		this.textures.cash = new IgeTexture('./assets/textures/ui/cash.png');
        this.textures.star = new IgeTexture('./assets/textures/ui/star.png');
        this.textures.closeButton = new IgeTexture('./assets/textures/ui/close.png');

		this.textures.leftButton1 = new IgeTexture('./assets/textures/ui/leftButton1.png');
		this.textures.leftButton2 = new IgeTexture('./assets/textures/ui/leftButton2.png');
		this.textures.leftButton3 = new IgeTexture('./assets/textures/ui/leftButton3.png');

		this.textures.rightButton1 = new IgeTexture('./assets/textures/ui/rightButton1.png');
		this.textures.rightButton2 = new IgeTexture('./assets/textures/ui/rightButton2.png');
		this.textures.rightButton3 = new IgeTexture('./assets/textures/ui/rightButton3.png');

        for(var key in GameObjects.gameObjectTextures) {
            var tex = GameObjects.gameObjectTextures[key]
            this.textures[key] = new IgeCellSheet(tex[0], tex[1], 1)
        }

		this.textures.villager1 = new IgeCellSheet('./assets/textures/sprites/villager.png', 3, 2);
		this.textures.flowerPot1 = new IgeTexture('./assets/textures/sprites/flowerPot1.png');
		this.textures.fenceSW = new IgeTexture('./assets/textures/sprites/fenceSW.png');
		this.textures.clothingLine = new IgeTexture('./assets/textures/sprites/clothingLine.png');
		this.textures.wallSE = new IgeTexture('./assets/textures/sprites/wallSE.png');

		this.textures.greenDot = new IgeTexture('./assets/textures/greendot.png');
		this.textures.redDot = new IgeTexture('./assets/textures/reddot.png');
		this.textures.outline = new IgeTexture('./assets/textures/outline.js');
		this.textures.rectangle = new IgeTexture('./assets/textures/rectangle.js');

		ige.ui.style('.dialog', {
			left: 0,
			right: 0,
			top: 0,
			bottom: 0
		});

        ige.ui.style('#topNav', {
            'top': 10,
            'left': 10,
            'right': 10,
            'width': 1000,
            'height': 50
        });

		ige.ui.style('.underlay', {
			backgroundColor: '#000000',
			opacity: 0.6,
			left: 0,
			right: 0,
			top: 0,
			bottom: 0
		});

		// Wait for our textures to load before continuing
		ige.on('texturesLoaded', function () {
			// Create the HTML canvas
            if(true) {
			    ige.createFrontBuffer(true);
            } else {
                var canvas = $('<canvas id=gameCanvas>').appendTo('body')
                var width = 971 * gameScale
                var height = 470 * gameScale
                canvas.attr('width', width)
                canvas.attr('height', height)
                var baseSize = Math.min($(window).width() / width, $(window).height() / height)
                canvas.width(width * baseSize)
                canvas.height(height * baseSize)
                canvas.css({
                    position: 'absolute',
                    left: ($(window).width() - width * baseSize) / 2,
                    top: ($(window).height() - height * baseSize) / 2
                })
                $('body').css('background-color', '#407c03')
            }

            ige.canvas(document.getElementById('gameCanvas'));

			// Start the engine
			ige.start(function (success) {
				// Check if the engine started successfully
				function postinit() {
					// Add base scene data
					ige.addGraph('IgeBaseScene');

					// Add level1 graph
					ige.addGraph('GraphLevel1');

					// Add ui graph
					ige.addGraph('GraphUi');

					// Mouse pan with limits
					//ige.$('vp1')
					//	.addComponent(IgeMousePanComponent)
					//	.mousePan.enabled(true)
					//	.mousePan.limit(new IgeRect(-250, -200, 500, 400))

                   // if(location.search == '?bounds')
                   //     ige.$('vp1').drawBounds(true);
                    ige.$('vp1')
                        .addComponent(IgeMousePanComponent)
						.addComponent(ScrollZoomComponent)
						.addComponent(ScaleToPointComponent)
						//.addComponent(PinchZoomComponent)
						.addComponent(LimitZoomPanComponent, {
							boundsX: 0,
							boundsY: 0,
							boundsWidth: 2627,
							boundsHeight: 1545
						})

						.mousePan.enabled(true)
						.scrollZoom.enabled(true)
						.autoSize(true)
                        .drawBounds(false) // Switch this to true to draw all bounding boxes
			            .drawBoundsData(false) // Switch this to true to draw all bounding boxes
						.scene(ige.$('baseScene'))
						.mount(ige);

                    ige.$('vp1').mousePan.on('panMove', function(){
                        clientSelf.fsm.enterState('pan');
                    });
                    ige.$('vp1').mousePan.on('panEnd', function(){
                        clientSelf.fsm.enterState('select');
                    });

					new Villager()
						.id('bob')
						.mount(ige.$('tileMap1'))

					// Set the initial fsm state
					self.fsm.initialState('select');
				}
                if (success) {
                    API.init(postinit);
                }
			});
		});
	},

    /**
     * Returns the item occupying the tile co-ordinates of the tile map.
     * @param tileX
     * @param tileY
     */
    itemAt: function (tileX, tileY) {
        // Return the data at the map's tile co-ordinates
        return ige.$('tileMap1').map.tileData(tileX, tileY);
    },
    showGrid: function(){
        ige.$('tileMap1').drawGrid(true);
        ige.$('tileMap1').highlightOccupied(true);
        ige.$('outlineEntity').show();
    },
    hideGrid: function(){
        ige.$('tileMap1').drawGrid(false);
        ige.$('tileMap1').highlightOccupied(false);
        ige.$('outlineEntity').hide();
    }
});

if (typeof(module) !== 'undefined' && typeof(module.exports) !== 'undefined') { module.exports = Client; }
