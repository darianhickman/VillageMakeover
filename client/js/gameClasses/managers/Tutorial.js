var Tutorial = IgeEventingClass.extend({
    classId: 'Tutorial',

    init: function () {

        var self = this,
            tileMap = ige.$('tileMapTutorial');

        self.steps = [];
        self.currentStep = '';
        self.currentBuildStep = 1;
        self.currentGoalStep = 1;
        self.isMoneyAdded = false;
        self.tutorialViews = new TutorialViews();
        self.marketItems = $('<ul></ul>')
        self.tutorialObjects = []

        self.tutorialArrow = $("<span id='tutorialArrowSpan'></span>")
            .appendTo("#hudcontainer").insertAfter("#topToolbarTutorial");
        $("#tutorialArrowSpan").hide()

        self.tutorialArrow.image = $("<img id='tutorialArrowImage' src='" + ige.client.textures.tutorialArrow.url() + "'>")
            .appendTo("#tutorialArrowSpan")
            .rotate({angle:40});

        self.skipButton = $("<span id='skipTutorial'>" + GameConfig.config['skipTutorialString'] + "</span>")
            .appendTo("#hudcontainer")
            .position({my: "right bottom", at: "right bottom", of: window})
            .click(function(){
                mixpanel.track("Skip tutorial");
                self.gotoStep('finishTutorial');
            });

        self.skipButton.css("left", self.skipButton.position().left - 40 + "px")
        self.skipButton.css("top", self.skipButton.position().top - 40 + "px")

        self.items = {
            item1: {
                name: GameConfig.config['tutorialItem1'],
                mapX: 15,
                mapY: 5,
                marketX: -200,
                marketY: -100,
            },
            item2: {
                name: GameConfig.config['tutorialItem2'],
                mapX: 8,
                mapY: 13,
                marketX: 0,
                marketY: -100,
            },
            item3: {
                name: GameConfig.config['tutorialItem3'],
                mapX: 8,
                mapY: 18,
                marketX: 200,
                marketY: -100,
            },
            item4: {
                name: GameConfig.config['tutorialItem4'],
                mapX: 26,
                mapY: 18,
                marketX: -200,
                marketY: 100,
            }
        }

        self.steps['initialStep'] = {
            enter: function(){
                $( "#tutorialDialog" ).dialog({ appendTo: '#hudcontainer', resizable: false, draggable: true, dialogClass: 'ui-dialog-no-titlebar', closeOnEscape: false, width: 500, height: 'auto', modal: false, autoOpen: false, create: function() {
                    $(this).closest('div.ui-dialog')
                        .find('button.ui-dialog-titlebar-close')
                        .click(function(e) {
                            self.gotoStep('finishTutorial');
                            e.preventDefault();
                        });
                } });
                $( "#tutorialDialog" ).dialog( "open" );

                $( "#tutorialContent" )
                    .html( self.tutorialViews.getViewByID('welcomeScreen').view );

                $('#dialogButton').on('click', function(){
                    self.gotoStep('showmarketButton')
                });
            },
            exit: function(){
                $( "#tutorialDialog" ).dialog( "close" );
            }
        }

        self.steps['showmarketButton'] = {
            enter: function(){
                $('#marketButtonTutorial').show()
                    .click(function () {
                        self.gotoStep('showMarketDialog')
                    });

                self.setTutorialArrow("#hudcontainer", "#marketButtonTutorial", 40, 'marginTop');

            },
            exit: function(){
                $('#marketButtonTutorial').unbind('click');
            }
        }

        self.steps['showMarketDialog'] = {
            enter: function(){
                var itemID, options, dummyElem, imgWidth, imgHeight;

                $( "#tutorialDialog" ).dialog( "open" );

                itemID = self.items['item'+self.currentBuildStep].name;

                if(self.marketItems.find("#tutorialMarket" + itemID)[0] === undefined) {
                    self.newItem = $("<li class='tutorialMarketDialogItem' id='tutorialMarket" + itemID + "'></li>");
                    self.newItem.append($("<span class='tutorialMarketImage'></span>"))

                    options = GameObjects.catalogLookup[itemID]
                    dummyElem = $("<div class='tutorialMarketImage'></div>").hide().appendTo("body");
                    imgHeight = dummyElem.css("height").substr(0,dummyElem.css("height").indexOf('px'));
                    imgWidth = ige.client.textures[itemID]._sizeX / (ige.client.textures[itemID]._sizeY / imgHeight)
                    dummyElem.remove();

                    self.newItem.find(".tutorialMarketImage").first().css("background-image","url(" + options.textureUrl + ")")
                        .css("width", imgWidth / ige.client.textures[itemID]._cellColumns + "px")
                        .css("background-size", imgWidth + "px " + imgHeight + "px")
                        .css("background-position-x", imgWidth / ige.client.textures[itemID]._cellColumns + "px");


                    self.marketItems.append(self.newItem)
                }

                $( "#tutorialContent" )
                    .html( self.marketItems );

                $("#tutorialMarket" + self.items['item'+self.currentBuildStep].name).click(function(){
                    self.gotoStep('placeHouse');
                });


                self.setTutorialArrow("body", "#tutorialMarket" + self.items['item'+self.currentBuildStep].name, 130, 'marginLeft');

            },
            exit: function(){
                $( "#tutorialDialog" ).dialog( "close" );
                self.newItem.unbind('click');
            }
        }

        self.steps['placeHouse'] = {
            enter: function(){
                var objectTileWidth,
                    objectTileHeight,
                    objinfo,
                    catalogItem = GameObjects.catalogLookup[self.items['item'+self.currentBuildStep].name];

                $("#tutorialArrowSpan").hide();

                tileMap.drawGrid(true);
                tileMap.highlightOccupied(true);

                self.mapItemButton = new ige.newClassInstance(self.items['item'+self.currentBuildStep].name)
                    .id("tutorialTilemapItem2" + self.currentBuildStep)
                    .layer(1)
                    .mount(tileMap)
                    .cell(catalogItem.cell)
                    .mouseOver(function(){})
                    .mouseOut(function(){})
                    .mouseMove(function(){})
                    .mouseUp(function(){
                        self.gotoStep('showSpeedProgressInfo')
                    });

                self.mapItemButton.translateToTile(self.items['item'+self.currentBuildStep].mapX+self.mapItemButton._tileAdjustX,self.items['item'+self.currentBuildStep].mapY+self.mapItemButton._tileAdjustY)

                objectTileWidth = self.mapItemButton.xTiles;
                objectTileHeight = self.mapItemButton.yTiles;

                objinfo = {
                    id: ige.newIdHex(),
                    classID: catalogItem.id,
                    x: self.items['item'+self.currentBuildStep].mapX,
                    y: self.items['item'+self.currentBuildStep].mapY,
                    w: objectTileWidth,
                    h: objectTileHeight,
                    name: self.items['item'+self.currentBuildStep].name,
                    buildStarted: Date.now(),
                    buildCompleted: Date.now()
                }

                self.tutorialObjects.push(objinfo)

                new IgeTimeout(function () {
                    $("#tutorialArrowSpan").css("top", self.mapItemButton.screenPosition().y);
                    $("#tutorialArrowSpan").css("left", self.mapItemButton.screenPosition().x - 100);
                    $("#tutorialArrowSpan").show();
                }, 100);
            },
            exit: function(){
                var catalogItem = GameObjects.catalogLookup[self.items['item'+self.currentBuildStep].name];

                tileMap.drawGrid(false);
                tileMap.highlightOccupied(true);

                self.mapItemButton.cell(1)
                    .mouseUp(function(){});

                self.mapItemButton.buildProgressBar = new IgeUiProgressBar()
                    .barBackColor('#f2b982')
                    .barColor('#69f22f')
                    .barBorderColor('#3a9bc5')
                    .min(0)
                    .max(100)
                    .progress(0)
                    .width(50)
                    .height(10)
                    .translateTo(0,-40,0)
                    .mount(self.mapItemButton);

                self.mapItemButton.buildProgressTime = new IgeFontEntity()
                    .colorOverlay('white')
                    .nativeFont(GameConfig.config['gameFont'])
                    .nativeStroke(4)
                    .nativeStrokeColor('#000000')
                    .width(200)
                    .height(100)
                    .mount(self.mapItemButton)
                    .translateTo(0,-60,0)
                    .text(catalogItem.buildTime)
            }
        }

        self.steps['showSpeedProgressInfo'] = {
            enter: function(){
                $( "#tutorialDialog" ).dialog( "open" );
                $("#tutorialArrowSpan").hide();

                $( "#tutorialContent" )
                    .html( self.tutorialViews.getViewByID('speedProgressInfoScreen').view );

                $('#dialogButton').on('click', function(){
                    $( "#tutorialDialog" ).dialog( "close" );
                    self.gotoStep('buildHouse')
                });
            },
            exit: function(){
                self.mapItemButton.buildProgressBar.unMount();
                self.mapItemButton.buildProgressTime.unMount();
                self.mapItemButton.mouseUp(function () {});
                self.mapItemButton.destroy();
                self.mapItemButton = null;
            }
        }

        self.steps['showSpeedProgress'] = {
            enter: function(){
                var catalogItem = GameObjects.catalogLookup[self.items['item'+self.currentBuildStep].name];

                $( "#tutorialDialog" ).dialog( "open" );
                $("#tutorialArrowSpan").hide();

                $( "#tutorialContent" )
                    .html( self.tutorialViews.getViewByID('speedProgressScreen').view );

                if(self.currentBuildStep === 4){
                    $( "#tutorialContent div p" ).append(" for " + catalogItem.buildTimeSpeedValue + " VBucks");
                }else{
                    $( "#tutorialContent div p" ).append(" for FREE");
                }

                $('#dialogButton').on('click', function(){
                    $( "#tutorialDialog" ).dialog( "close" );
                    if(self.currentBuildStep === 4 && !self.isMoneyAdded){
                        self.gotoStep('showPaymentInfo')
                    }else if(self.currentBuildStep === 4 && self.isMoneyAdded){
                        $('#cashbarProgressTutorial').progressbar("value",497);
                        $('#cashbarProgressTutorial').text(497);
                        self.gotoStep('HouseIsBuilt')
                    }else {
                        self.gotoStep('HouseIsBuilt')
                    }
                });
            },
            exit: function(){

            }
        }

        self.steps['buildHouse'] = {
            enter: function(){
                var catalogItem = GameObjects.catalogLookup[self.items['item'+self.currentBuildStep].name];

                $("#tutorialArrowSpan").show();

                if(ige.$('tutorialTilemapItem' + self.currentBuildStep)){
                    self.mapItemButton.destroy();
                    self.mapItemButton = null;
                }
                self.mapItemButton = new ige.newClassInstance(self.items['item'+self.currentBuildStep].name)
                    .id("tutorialTilemapItem" + self.currentBuildStep)
                    .layer(1)
                    .mount(tileMap)
                    .cell(1)
                    .mouseOver(function(){})
                    .mouseOut(function(){})
                    .mouseMove(function(){})
                    .mouseUp(function(){
                        self.gotoStep('showSpeedProgress')
                    });

                self.mapItemButton.translateToTile(self.items['item'+self.currentBuildStep].mapX+self.mapItemButton._tileAdjustX,self.items['item'+self.currentBuildStep].mapY+self.mapItemButton._tileAdjustY)

                self.mapItemButton.buildProgressBar = new IgeUiProgressBar()
                    .barBackColor('#f2b982')
                    .barColor('#69f22f')
                    .barBorderColor('#3a9bc5')
                    .min(0)
                    .max(100)
                    .progress(0)
                    .width(50)
                    .height(10)
                    .translateTo(0,-40,0)
                    .mount(self.mapItemButton);

                self.mapItemButton.buildProgressTime = new IgeFontEntity()
                    .colorOverlay('white')
                    .nativeFont(GameConfig.config['gameFont'])
                    .nativeStroke(4)
                    .nativeStrokeColor('#000000')
                    .width(200)
                    .height(100)
                    .mount(self.mapItemButton)
                    .translateTo(0,-60,0)
                    .text(catalogItem.buildTime)

                $("#tutorialArrowSpan").css("top", self.mapItemButton.screenPosition().y + ige.$('tileMapTutorial')._renderPos.y);
                $("#tutorialArrowSpan").css("left", self.mapItemButton.screenPosition().x - 100);

            },
            exit: function(){
                self.mapItemButton.mouseUp(function () {});
            }
        }

        self.steps['HouseIsBuilt'] = {
            enter: function(){
                var catalogItem = GameObjects.catalogLookup[self.items['item'+self.currentBuildStep].name];
                self.mapItemButton.cell(catalogItem.cell)
                self.mapItemButton.buildProgressBar.unMount();
                self.mapItemButton.buildProgressTime.unMount();
                self.mapItemButton.mouseUp(function () {});

                switch (self.currentBuildStep){
                    case 1:
                        $("#tutorialArrowSpan").hide();

                        $( "#tutorialDialog" ).dialog( "open" );

                        $( "#tutorialContent" )
                            .html( self.tutorialViews.getViewByID('firstHomeBuiltScreen').view );

                        $('#dialogButton').on('click', function(){
                            $( "#tutorialDialog" ).dialog( "close" );
                            self.gotoStep('showGoalButton');
                        });
                        break;
                    case 2:
                        self.gotoStep('showmarketButton');
                        break;
                    case 3:
                        $("#tutorialArrowSpan").hide();

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
                $('#goalButtonTutorial')
                    .show()
                    .click(function () {
                        self.gotoStep('showGoalScreen')
                    });

                self.setTutorialArrow("#hudcontainer", "#goalButtonTutorial", 40, 'marginTop');
            },
            exit: function(){
                $('#goalButtonTutorial').unbind('click');
                $("#tutorialArrowSpan").hide();
            }
        }

        self.steps['showGoalScreen'] = {
            enter: function(){
                $("#tutorialArrowSpan").hide();

                switch (self.currentGoalStep) {
                    case 1:
                        $( "#tutorialContent" )
                            .html( self.tutorialViews.getViewByID('newGoalFirstScreen').view );

                        $('#dialogButton').on('click', function(){
                            $( "#tutorialDialog" ).dialog( "close" );
                            self.gotoStep('showmarketButton')
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
                            self.gotoStep('showmarketButton')
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

                $( "#tutorialDialog" ).dialog( "open" );
            },
            exit: function(){
                $( "#tutorialDialog" ).dialog( "close" );
                $("#tutorialArrowSpan").hide();
            }
        }

        self.steps['showPaymentInfo'] = {
            enter: function(){
                $( "#tutorialDialog" ).dialog( "open" );
                $("#tutorialArrowSpan").hide();

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
                $('#cashbarTutorial').show()
                    .click(function () {
                        self.gotoStep('showPaymentScreen')
                    });

                self.setTutorialArrow("#hudcontainer", "#cashbarTutorial", 40, 'marginTop');
            },
            exit: function(){
                $('#cashbarTutorial').unbind('click');
                $("#tutorialArrowSpan").hide()
            }
        }

        self.steps['showPaymentScreen'] = {
            enter: function(){
                $( "#tutorialDialog" ).dialog( "open" );

                $( "#tutorialContent" )
                    .html( "<ul><li id='tutorialMoneyButton'>" + GameConfig.config['tutorialBuyCashString'] + "</li></ul>" );

                $( "#tutorialMoneyButton").click(function(){
                    self.gotoStep('fillCreditCard');
                })

                self.setTutorialArrow("body", "#tutorialMoneyButton", 130, 'marginLeft');

            },
            exit: function(){
                $( "#tutorialMoneyButton").unbind("click");
            }
        }

        self.steps['fillCreditCard'] = {
            enter: function(){
                $( "#tutorialDialog" ).dialog( "open" );
                $("#tutorialArrowSpan").hide()

                $( "#tutorialContent" )
                    .html( self.tutorialViews.getViewByID('creditCardScreen').view );

                $('#dialogButton').on('click', function(){
                    self.isMoneyAdded = true;
                    $('#cashbarProgressTutorial').progressbar("value",500);
                    $('#cashbarProgressTutorial').text(500);
                    self.gotoStep('buildHouse')
                });
            },
            exit: function(){
                $( "#tutorialDialog" ).dialog( "close" );
            }
        }

        self.steps['showCoinButton'] = {
            enter: function(){
                $('#coinbarTutorial').show()
                    .click(function () {
                        self.gotoStep('showAddCoinsScreen')
                    });

                self.setTutorialArrow("#hudcontainer", "#coinbarTutorial", 40, 'marginTop');
            },
            exit: function(){
                $('#coinbarTutorial').unbind('click');
            }
        }

        self.steps['showAddCoinsScreen'] = {
            enter: function(){
                $( "#tutorialDialog" ).dialog( "open" );

                $( "#tutorialContent" )
                    .html( "<ul><li id='tutorialCoinButton'>" + GameConfig.config['tutorialBuyCoinsString'] + "</li></ul>" );

                $( "#tutorialCoinButton").click(function(){
                    $('#cashbarProgressTutorial').progressbar("value",496);
                    $('#cashbarProgressTutorial').text(496);
                    $('#coinbarProgressTutorial').progressbar("value",1100);
                    $('#coinbarProgressTutorial').text(1100);
                    self.gotoStep('completeMessage');
                })

                self.setTutorialArrow("body", "#tutorialCoinButton", 130, 'marginLeft');
            },
            exit: function(){
                $( "#tutorialCoinButton").unbind("click");
            }
        }

        self.steps['completeMessage'] = {
            enter: function(){
                $( "#tutorialDialog" ).dialog( "open" );
                $("#tutorialArrowSpan").hide()

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
                $('#skipTutorial').remove();
                $('#tutorialArrowSpan').remove();
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
            offsetX = 0,
            offsetY = 0,
            objectTileWidth,
            objectTileHeight;

        for (var i = 1; i <= 8; i++){
            var newItem = new ige.newClassInstance(GameConfig.config['tutorialItem3'])
                .layer(1)
                .mount(tileMap)
                .mouseOver(function(){})
                .mouseOut(function(){})
                .mouseMove(function(){})
                .mouseUp(function(){});

            objectTileWidth = newItem.xTiles;
            objectTileHeight = newItem.yTiles;
            offsetX += objectTileWidth
            if(i === 4){
                offsetX = 0
                offsetY += objectTileHeight
            }

            newItem.translateToTile(self.items['item3'].mapX + newItem._tileAdjustX + offsetX,self.items['item3'].mapY + newItem._tileAdjustY + offsetY)

            objinfo = {
                id: ige.newIdHex(),
                classID: GameConfig.config['tutorialItem3'],
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

        for (var i = 1; i <= 4; i++){
            var newItem = new ige.newClassInstance(GameConfig.config['tutorialItem2'])
                .layer(1)
                .mount(tileMap)
                .mouseOver(function(){})
                .mouseOut(function(){})
                .mouseMove(function(){})
                .mouseUp(function(){});

            objectTileWidth = newItem.xTiles;
            objectTileHeight = newItem.yTiles;
            offsetX += objectTileWidth

            newItem.translateToTile(self.items['item2'].mapX + newItem._tileAdjustX + offsetX,self.items['item2'].mapY + newItem._tileAdjustY)

            objinfo = {
                id: ige.newIdHex(),
                classID: GameConfig.config['tutorialItem2'],
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
    },

    animatethis: function(targetElement, speed, direction) {
        var self = this,
            obj = {};
        obj[direction] = "+=50px";
        $(targetElement).animate(obj,
            {
                duration: speed,
                easing: "easeInOutSine",
                complete: function ()
                {
                    obj[direction] = "-=50px";
                    targetElement.animate(obj,
                        {
                            duration: speed,
                            easing: "easeInOutSine",
                            complete: function ()
                            {
                                self.animatethis(targetElement, speed, direction);
                            }
                        });
                }
            }
        );
    },

    setTutorialArrow: function (placement, target, angle, margin) {
        var self = this;
        switch(placement){
            case "#hudcontainer":
                $("#tutorialArrowSpan").appendTo("#hudcontainer")
                    .insertAfter("#topToolbarTutorial")
                    .css("position","absolute")
                    .show()
                    .position({my: "top center", at: "bottom center", of: target})
                    .css("top","");
                break;
            case "body":
                $("#tutorialArrowSpan").appendTo("body")
                    .css("position","fixed")
                    .position({my: "right center", at: "left center", of: target})
                    .show();
                break;
        }
        $("#tutorialArrowImage").stop()
            .css("margin-top","0px")
            .css("margin-left","0px")
            .rotate({angle:angle});

        self.animatethis($('#tutorialArrowImage'), 500, margin);
    }
})
