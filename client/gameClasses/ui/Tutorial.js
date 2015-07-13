var Tutorial = IgeEventingClass.extend({
    classId: 'Tutorial',

    init: function () {

        var self = this,
            uiScene = ige.$('uiSceneTutorial'),
            tileMap = ige.$('tileMapTutorial');

        self.steps = [];
        self.currentStep = '';
        self.currentBuildStep = 1;
        self.currentGoalStep = 1;
        self.isMoneyAdded = false;
        self.tutorialViews = new TutorialViews();

        self.tutorialArrow = new IgeEntity()
            .layer(100)
            .width(240)
            .height(100)
            .mount(uiScene)
            .hide()

        self.tutorialArrow.textureEntity = new IgeEntity()
            .layer(100)
            .width(240)
            .height(100)
            .texture(ige.client.textures.arrow)
            .mount(self.tutorialArrow)
            ._translate.tween()
                .stepTo({
                    x: -20,
                    y: 0
                }, 500, 'inOutSine')
                .stepTo({
                    x: 20,
                    y: 0
                }, 500, 'inOutSine')
                .repeatMode(1, -1)
                .startTime(ige._currentTime)
                .start();

        self.buildButtonTutorial = new IgeUiElement()
            .layer(50)
            .texture(ige.client.textures.buildButton)
            .dimensionsFromTexture()
            .top(3)
            .right(20)
            .mount(uiScene)
            .hide()

        self.goalButtonTutorial = new IgeUiElement()
            .texture(ige.client.textures.star)
            .dimensionsFromTexture()
            .top(80)
            .right(23)
            .mount(uiScene)
            .hide()

        self.marketDialogTutorial = new IgeUiElement()
            .layer(50)
            .mount(uiScene)
            .hide()

        new IgeUiElement()
            .layer(0)
            .texture(ige.client.textures.marketMenuBack)
            .dimensionsFromTexture()
            .mount(self.marketDialogTutorial);

        self.cashDialogTutorial = new IgeUiElement()
            .layer(50)
            .mount(uiScene)
            .hide()

        new IgeUiElement()
            .layer(0)
            .texture(ige.client.textures.moneyMenuBackground)
            .dimensionsFromTexture()
            .mount(self.cashDialogTutorial);

        self.coinsDialogTutorial = new IgeUiElement()
            .layer(50)
            .mount(uiScene)
            .hide()

        new IgeUiElement()
            .layer(0)
            .texture(ige.client.textures.coinMenuBackground)
            .dimensionsFromTexture()
            .mount(self.coinsDialogTutorial);

        self.cashBar = new IgeUiElement()
            .layer(50)
            .texture(ige.client.textures.cashBar)
            .dimensionsFromTexture()
            .left(10)
            .top(5)
            .mount(uiScene)
            .hide();

        self.cashProgress = new IgeUiProgressBar()
            .barColor('#69f22f')
            .min(0)
            .max(100000)
            .progress(0)
            .width(87)
            .height(18)
            .right(17)
            .barText('$', '', 'black')
            .mount(self.cashBar);

        self.cashProgress.render = function(ctx){
            ctx.font = '11px Verdana';
            IgeUiProgressBar.prototype.render.call(this,ctx);
        }

        self.cashButton = new IgeUiElement()
            .texture(ige.client.textures.greenPlus)
            .dimensionsFromTexture(80)
            .right(-40)
            .mount(self.cashProgress);

        self.coinsBar = new IgeUiElement()
            .layer(50)
            .texture(ige.client.textures.coinsBar)
            .dimensionsFromTexture()
            .left(185)
            .top(5)
            .mount(uiScene)
            .hide();

        self.coinsProgress = new IgeUiProgressBar()
            .barColor('#69f22f')
            .min(0)
            .max(1000000)
            .progress(1000)
            .width(87)
            .height(18)
            .right(17)
            .barText('', ' coins', 'black')
            .mount(self.coinsBar);

        self.coinsProgress.render = function(ctx){
            ctx.font = '11px Verdana';
            IgeUiProgressBar.prototype.render.call(this,ctx);
        }

        self.coinsButton = new IgeUiElement()
            .texture(ige.client.textures.greenPlus)
            .dimensionsFromTexture(80)
            .right(-40)
            .mount(self.coinsProgress);

        self.skipButton = new IgeFontEntity()
            .colorOverlay('white')
            .nativeFont('24px Times New Roman')
            .width(180)
            .height(50)
            .right(10)
            .bottom(10)
            .text(GameConfig.config['skipTutorialString'])
            .mount(uiScene)
            .mouseUp(function(){
                mixpanel.track("Skip tutorial");
                self.gotoStep('finishTutorial');
            });

        self.tutorialObjects = []

        self.items = {
            item1: {
                name: 'Hut2',
                mapX: 15,
                mapY: 5,
                marketX: -200,
                marketY: -100,
            },
            item2: {
                name: 'Hut1',
                mapX: 8,
                mapY: 13,
                marketX: 0,
                marketY: -100,
            },
            item3: {
                name: 'PlantsSmall',
                mapX: 8,
                mapY: 18,
                marketX: 200,
                marketY: -100,
            },
            item4: {
                name: 'Well2',
                mapX: 26,
                mapY: 18,
                marketX: -200,
                marketY: 100,
            }
        }

        self.steps['initialStep'] = {
            enter: function(){
                $( "#tutorialDialog" ).dialog({ resizable: false, draggable: true, dialogClass: 'ui-dialog-no-titlebar', closeOnEscape: false, width: 500, height: 300, modal: false, autoOpen: false });
                $( "#tutorialDialog" ).dialog( "open" );

                $( "#tutorialContent" )
                    .html( self.tutorialViews.getViewByID('welcomeScreen').view );

                $('#dialogButton').on('click', function(){
                    self.gotoStep('showBuildButton')
                });
            },
            exit: function(){
                $( "#tutorialDialog" ).dialog( "close" );
            }
        }

        self.steps['showBuildButton'] = {
            enter: function(){
                self.buildButtonTutorial
                    .show()
                    .mouseUp(function () {
                        self.gotoStep('showMarketDialog')
                    });

                self.tutorialArrow
                    .scaleTo(.5,.5,.5)
                    .translateTo(self.buildButtonTutorial._translate.x - 60, self.buildButtonTutorial._translate.y, self.buildButtonTutorial._translate.z)
                    .show()

            },
            exit: function(){
                self.buildButtonTutorial.mouseUp(function () {});
            }
        }

        self.steps['showMarketDialog'] = {
            enter: function(){
                var realMarketDialogItem = ige.$('marketDialog').getItemByID(self.items['item'+self.currentBuildStep].name)

                self.marketItemButton = new IgeEntity()
                    .layer(1)
                    .texture(ige.client.textures[self.items['item'+self.currentBuildStep].name])
                    .cell(realMarketDialogItem.cell)
                    .dimensionsFromCell()
                    .height(100,true)
                    .mount(self.marketDialogTutorial)
                    .translateTo(self.items['item'+self.currentBuildStep].marketX,self.items['item'+self.currentBuildStep].marketY,0)
                    .mouseUp(function () {
                        if(self.currentBuildStep === 4 && !self.isMoneyAdded)
                            self.gotoStep('showPaymentInfo');
                        else if (self.currentBuildStep === 4 && self.isMoneyAdded){
                            self.cashProgress.progress(250);
                            self.gotoStep('buildHouse');
                        }
                        else
                            self.gotoStep('buildHouse');
                    });

                if(self.currentBuildStep === 4){
                    self.marketItemButton.fontEntity = new IgeFontEntity()
                        .colorOverlay('black')
                        .nativeFont('15px Times New Roman')
                        .width(400)
                        .height(50)
                        .text(GameConfig.config['tutorialVBString'])
                        .mount(self.marketItemButton)
                        .translateTo(-5,50,0)
                }

                self.tutorialArrow
                    .scaleTo(.75,.75,.75)
                    .rotateTo(0,0,3.1415)
                    .translateTo(self.marketItemButton._translate.x + 90 ,self.marketItemButton._translate.y, self.marketItemButton._translate.z)
                    .show()

                self.marketDialogTutorial.show()
            },
            exit: function(){
                self.marketDialogTutorial.hide()
                self.marketItemButton.mouseUp(function () {});
            }
        }

        self.steps['buildHouse'] = {
            enter: function(){
                var step = 1,
                    objectTileWidth,
                    objectTileHeight,
                    objinfo,
                    realMarketDialogItem = ige.$('marketDialog').getItemByID(self.items['item'+self.currentBuildStep].name);

                self.mapItemButton = new ige.newClassInstance(self.items['item'+self.currentBuildStep].name)
                    .layer(1)
                    .mount(tileMap)
                    .cell(step)
                    .mouseOver(function(){})
                    .mouseOut(function(){})
                    .mouseMove(function(){})
                    .mouseUp(function(){
                        if(realMarketDialogItem.cell == step){
                            self.gotoStep('HouseIsBuilt')
                        }
                        else{
                            step++;
                            this.cell(step)
                            this.buildProgressBar.progress(this.buildProgressBar.progress() + 50)
                        }
                    });

                self.mapItemButton.translateToTile(self.items['item'+self.currentBuildStep].mapX+self.mapItemButton._tileAdjustX,self.items['item'+self.currentBuildStep].mapY+self.mapItemButton._tileAdjustY)

                objectTileWidth = Math.ceil(self.mapItemButton._bounds3d.x / tileMap._tileWidth);
                objectTileHeight = Math.ceil(self.mapItemButton._bounds3d.y / tileMap._tileHeight);

                objinfo = {
                    id: ige.newIdHex(),
                    x: self.items['item'+self.currentBuildStep].mapX,
                    y: self.items['item'+self.currentBuildStep].mapY,
                    w: objectTileWidth,
                    h: objectTileHeight,
                    name: self.items['item'+self.currentBuildStep].name,
                    buildStarted: Date.now(),
                    buildCompleted: Date.now()
                }

                self.tutorialObjects.push(objinfo)

                self.mapItemButton.buildProgressBar = new IgeUiProgressBar()
                    .barBackColor('#f2b982')
                    .barColor('#69f22f')
                    .barBorderColor('#3a9bc5')
                    .min(0)
                    .max(100)
                    .progress(0)
                    .width(50)
                    .height(10)
                    .translateTo(0,-60,0)
                    .mount(self.mapItemButton);

                self.tutorialArrow.rotateTo(0,0,0)
                    .unMount()
                    .isometric(true)
                    .mount(tileMap)
                    .translateTo(self.mapItemButton._translate.x - 70 ,self.mapItemButton._translate.y, self.mapItemButton._translate.z)
                    .show()
            },
            exit: function(){
                self.mapItemButton.buildProgressBar.unMount();
                self.mapItemButton.mouseUp(function () {});

                self.tutorialArrow
                    .unMount()
                    .isometric(false)
                    .mount(uiScene)
            }
        }

        self.steps['HouseIsBuilt'] = {
            enter: function(){
                switch (self.currentBuildStep){
                    case 1:
                        self.tutorialArrow.hide();

                        $( "#tutorialDialog" ).dialog( "open" );

                        $( "#tutorialContent" )
                            .html( self.tutorialViews.getViewByID('firstHomeBuiltScreen').view );

                        $('#dialogButton').on('click', function(){
                            $( "#tutorialDialog" ).dialog( "close" );
                            self.gotoStep('showGoalButton');
                        });
                        break;
                    case 2:
                        self.gotoStep('showBuildButton');
                        break;
                    case 3:
                        self.tutorialArrow.hide();

                        $( "#tutorialDialog" ).dialog( "open" );

                        $( "#tutorialContent" )
                            .html( self.tutorialViews.getViewByID('fastForwardScreen').view );

                        $('#dialogButton').on('click', function(){
                            self.fillScreenWithObjects(3);
                            $( "#tutorialDialog" ).dialog( "close" );
                            self.gotoStep('showGoalButton');
                        });
                        break;
                    case 4:
                        self.gotoStep('showGoalButton');
                        break;
                }
                self.currentBuildStep++;
            },
            exit: function(){

            }
        }

        self.steps['showGoalButton'] = {
            enter: function(){
                self.goalButtonTutorial
                    .show()
                    .mouseUp(function () {
                        self.gotoStep('showGoalScreen')
                    });

                self.tutorialArrow
                    .scaleTo(.5,.5,.5)
                    .translateTo(self.goalButtonTutorial._translate.x - 50, self.goalButtonTutorial._translate.y, self.goalButtonTutorial._translate.z)
                    .show()
            },
            exit: function(){
                self.goalButtonTutorial.mouseUp(function () {});
                self.tutorialArrow.hide()
            }
        }

        self.steps['showGoalScreen'] = {
            enter: function(){
                self.tutorialArrow.hide()

                switch (self.currentGoalStep) {
                    case 1:
                        $( "#tutorialContent" )
                            .html( self.tutorialViews.getViewByID('newGoalFirstScreen').view );

                        $('#dialogButton').on('click', function(){
                            $( "#tutorialDialog" ).dialog( "close" );
                            self.gotoStep('showBuildButton')
                        });
                        break;
                    case 2:
                        $( "#tutorialContent" )
                            .html( self.tutorialViews.getViewByID('newGoalSecondScreen').view );

                        $('#dialogButton').on('click', function(){
                            $( "#tutorialDialog" ).dialog( "close" );
                            self.gotoStep('showGoalButton')
                        });
                        break;
                    case 3:
                        $( "#tutorialContent" )
                            .html( self.tutorialViews.getViewByID('newGoalThirdScreen').view );

                        $('#dialogButton').on('click', function(){
                            $( "#tutorialDialog" ).dialog( "close" );
                            self.gotoStep('showBuildButton')
                        });
                        break;
                    case 4:
                        $( "#tutorialContent" )
                            .html( self.tutorialViews.getViewByID('newGoalFourthScreen').view );

                        $('#dialogButton').on('click', function(){
                            $( "#tutorialDialog" ).dialog( "close" );
                            self.gotoStep('showCoinButton')
                        });
                        break;
                }
                self.currentGoalStep++;
                $( "#tutorialDialog" ).dialog({ resizable: false, draggable: true, dialogClass: 'ui-dialog-no-titlebar', closeOnEscape: false, width: 500, height: 300, modal: false, autoOpen: false });
                $( "#tutorialDialog" ).dialog( "open" );
            },
            exit: function(){
                $( "#tutorialDialog" ).dialog( "close" );
                self.tutorialArrow.hide();
            }
        }

        self.steps['showPaymentInfo'] = {
            enter: function(){
                $( "#tutorialDialog" ).dialog( "open" );
                self.tutorialArrow.hide()

                $( "#tutorialContent" )
                    .html( self.tutorialViews.getViewByID('notEnoughMoneyScreen').view );

                $('#dialogButton').on('click', function(){
                    $( "#tutorialDialog" ).dialog( "close" );
                    self.gotoStep('showMoneyButton')
                });
            },
            exit: function(){

            }
        }

        self.steps['showMoneyButton'] = {
            enter: function(){
                self.cashBar.show();
                self.cashButton
                    .mouseUp(function () {
                        self.gotoStep('showPaymentScreen')
                    });

                self.tutorialArrow
                    .scaleTo(.5,.5,.5)
                    .translateTo(self.cashBar._translate.x + 125, self.cashBar._translate.y, self.cashBar._translate.z)
                    .show()
            },
            exit: function(){
                self.cashButton.mouseUp(function () {});
                self.tutorialArrow.hide()
            }
        }

        self.steps['showPaymentScreen'] = {
            enter: function(){
                self.dummyMoneyButton = new IgeEntity()
                    .layer(1)
                    .width(146)
                    .height(284)
                    .mount(self.cashDialogTutorial)
                    .translateTo(-400,40,0)
                    .mouseUp(function () {
                        self.gotoStep('fillCreditCard');
                    });

                self.dummyMoneyButton.fontEntity = new IgeFontEntity()
                    .colorOverlay('white')
                    .nativeFont('15px Times New Roman')
                    .width(400)
                    .height(50)
                    .translateTo(50,80,0)
                    .text(GameConfig.config['tutorialBuyCashString'])
                    .mount(self.dummyMoneyButton)

                self.tutorialArrow
                    .scaleTo(.75,.75,.75)
                    .rotateTo(0,0,0)
                    .translateTo(self.dummyMoneyButton._translate.x - 50,self.dummyMoneyButton._translate.y, self.dummyMoneyButton._translate.z)
                    .show()

                self.cashDialogTutorial.show()

            },
            exit: function(){
                self.cashDialogTutorial.hide()
                self.dummyMoneyButton.mouseUp(function () {});
            }
        }

        self.steps['fillCreditCard'] = {
            enter: function(){
                $( "#tutorialDialog" ).dialog({ resizable: false, draggable: true, dialogClass: 'ui-dialog-no-titlebar', closeOnEscape: false, width: 500, height: 400, modal: false, autoOpen: false });
                $( "#tutorialDialog" ).dialog( "open" );
                self.tutorialArrow.hide()

                $( "#tutorialContent" )
                    .html( self.tutorialViews.getViewByID('creditCardScreen').view );

                $('#dialogButton').on('click', function(){
                    self.isMoneyAdded = true;
                    self.cashProgress.progress(500);
                    self.gotoStep('showBuildButton')
                });
            },
            exit: function(){
                $( "#tutorialDialog" ).dialog( "close" );
            }
        }

        self.steps['showCoinButton'] = {
            enter: function(){
                self.coinsBar.show();
                self.coinsButton
                    .mouseUp(function () {
                        self.gotoStep('showAddCoinsScreen')
                    });

                self.tutorialArrow
                    .scaleTo(.5,.5,.5)
                    .rotateTo(0,0,3.1415)
                    .translateTo(self.coinsBar._translate.x + 125, self.coinsBar._translate.y, self.coinsBar._translate.z)
                    .show()
            },
            exit: function(){
                self.coinsButton.mouseUp(function () {});
                self.tutorialArrow.hide()
            }
        }

        self.steps['showAddCoinsScreen'] = {
            enter: function(){
                self.dummyCoinsButton = new IgeEntity()
                    .layer(1)
                    .width(146)
                    .height(284)
                    .mount(self.coinsDialogTutorial)
                    .translateTo(-400,40,0)
                    .mouseUp(function () {
                        self.coinsProgress.progress(1100);
                        self.cashProgress.progress(249);
                        self.gotoStep('completeMessage');
                    });

                self.dummyCoinsButton.fontEntity = new IgeFontEntity()
                    .colorOverlay('black')
                    .nativeFont('15px Times New Roman')
                    .width(400)
                    .height(50)
                    .translateTo(50,-80,0)
                    .text(GameConfig.config['tutorialBuyCoinsString'])
                    .mount(self.dummyCoinsButton)

                self.tutorialArrow
                    .scaleTo(.75,.75,.75)
                    .rotateTo(0,0,0)
                    .translateTo(self.dummyCoinsButton._translate.x - 50,self.dummyCoinsButton._translate.y, self.dummyCoinsButton._translate.z)
                    .show()

                self.coinsDialogTutorial.show()

            },
            exit: function(){
                self.coinsDialogTutorial.hide()
                self.dummyCoinsButton.mouseUp(function () {});
            }
        }

        self.steps['completeMessage'] = {
            enter: function(){
                $( "#tutorialDialog" ).dialog( "open" );
                self.tutorialArrow.hide()

                $( "#tutorialContent" )
                    .html( self.tutorialViews.getViewByID('finishTutorial').view );

                $('#dialogButton').on('click', function(){

                    self.gotoStep('finishTutorial')
                });
            },
            exit: function(){
                $( "#tutorialDialog" ).dialog( "close" );
            }
        }

        self.steps['finishTutorial'] = {
            enter: function(){
                $( "#tutorialDialog" ).dialog( "close" );
                ige.client.setGameBoardPostTutorial(self.tutorialObjects);
                API.setTutorialAsShown()
                ige.client.fsm.enterState('select')
            },
            exit: function(){

            }
        }

    },

    gotoStep: function(stepID){
        if(this.currentStep !== ''){
            this.steps[this.currentStep].exit();
        }
        this.currentStep = stepID;
        this.steps[stepID].enter();
    },

    fillScreenWithObjects: function(currentBuildStep) {
        var self = this,
            tileMap = ige.$('tileMapTutorial'),
            realMarketDialogItem,
            offsetX = 0,
            offsetY = 0,
            objectTileWidth,
            objectTileHeight;

        realMarketDialogItem = ige.$('marketDialog').getItemByID('PlantsSmall')

        for (var i = 1; i <= 8; i++){
            var newItem = new ige.newClassInstance('PlantsSmall')
                .layer(1)
                .mount(tileMap)
                .mouseOver(function(){})
                .mouseOut(function(){})
                .mouseMove(function(){})
                .mouseUp(function(){});

            objectTileWidth = Math.ceil(newItem._bounds3d.x / tileMap._tileWidth);
            objectTileHeight = Math.ceil(newItem._bounds3d.y / tileMap._tileHeight);
            offsetX += objectTileWidth
            if(i === 4){
                offsetX = 0
                offsetY += objectTileHeight
            }

            newItem.translateToTile(self.items['item3'].mapX + newItem._tileAdjustX + offsetX,self.items['item3'].mapY + newItem._tileAdjustY + offsetY)

            objinfo = {
                id: ige.newIdHex(),
                x: self.items['item3'].mapX + offsetX,
                y: self.items['item3'].mapY + offsetY,
                w: objectTileWidth,
                h: objectTileHeight,
                name: self.items['item3'].name,
                buildStarted: Date.now(),
                buildCompleted: Date.now()
            }

            self.tutorialObjects.push(objinfo)
        }

        offsetX = 0
        offsetY = 0

        realMarketDialogItem = ige.$('marketDialog').getItemByID('Hut1')

        for (var i = 1; i <= 4; i++){
            var newItem = new ige.newClassInstance('Hut1')
                .layer(1)
                .mount(tileMap)
                .mouseOver(function(){})
                .mouseOut(function(){})
                .mouseMove(function(){})
                .mouseUp(function(){});

            objectTileWidth = Math.ceil(newItem._bounds3d.x / tileMap._tileWidth);
            objectTileHeight = Math.ceil(newItem._bounds3d.y / tileMap._tileHeight);
            offsetX += objectTileWidth

            newItem.translateToTile(self.items['item2'].mapX + newItem._tileAdjustX + offsetX,self.items['item2'].mapY + newItem._tileAdjustY)

            objinfo = {
                id: ige.newIdHex(),
                x: self.items['item2'].mapX + offsetX,
                y: self.items['item2'].mapY,
                w: objectTileWidth,
                h: objectTileHeight,
                name: self.items['item2'].name,
                buildStarted: Date.now(),
                buildCompleted: Date.now()
            }

            self.tutorialObjects.push(objinfo)
        }
    }
})
