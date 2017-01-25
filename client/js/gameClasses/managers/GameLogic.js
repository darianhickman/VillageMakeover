var GameLogic = IgeObject.extend({
    classId: 'GameLogic',

    init: function () {
        IgeObject.prototype.init.call(this);

        var self = this,
            currentGoalID,
            marketDialog = ige.$('marketDialog');

        self.queueManager = new QueueManager();
        self.loginManager = new LoginManager();

        //add unlocked market items based on user state
        for(var i in API.state.objects){
            var item = API.state.objects[i],
                options = GameObjects.catalogLookup[item.name]

            if(options.enabled)
                self.unlockMarketDialogItem(marketDialog.getItemByID(item.name));

            if(options.unlocks !== "none"){
                var unlockedOptions = GameObjects.catalogLookup[options.unlocks]
                if(unlockedOptions.enabled)
                    self.unlockMarketDialogItem(marketDialog.getItemByID(options.unlocks));
            }
        }

        //add unlocked market items based on unlockedItems in user state
        for(var i in API.state.unlockedItems){
            var itemID = API.state.unlockedItems[i];
            var itemData = marketDialog.getItemByID(itemID);

            this.unlockMarketDialogItem(itemData);
        }

        //add notify icons for special events
        for(var i in API.state.objects) {
            var item = API.state.objects[i];

            if(item.buildCompleted){
                (function(item){
                    setTimeout(function(){
                        ige.$(item.id).notifySpecialEvent();
                    },100);
                })(item);
            }
        }

        self.problemManager = new ProblemManager();

        self.goals = new Goals()

        //show noActiveGoalString by default
        $('#goalDialogContent').html("<p style='text-align:center;'>" + GameConfig.config['noActiveGoalString'] + "</p>");
        //jquery prepare dialog
        $( "#goalDialog" ).dialog({ resizable: false, draggable: true, closeOnEscape: true, title: "Goals", close: function( event, ui ) {ige.client.fsm.enterState('select')}, width: 'auto', height: 'auto', modal: true, autoOpen: false });

        //on goal load prepare ui
        self.goals.on("goalLoaded",function(data){
            var items = [],
                rewardsArr = data.gameGoalObj.goalReward.split(","),
                assets;
            //jquery fill ul with task titles
            $.each(data.gameGoalObj.tasks, function (id, value) {
                var itemImg = "";
                if(value.targetOBJ.substr(0,2) === '__'){
                    var itemID, options, dummyElem, imgWidth, imgHeight;
                    itemID = value.targetOBJ.substr(2);
                    options = GameObjects.catalogLookup[itemID]
                    dummyElem = $("<div class='goalTaskImage'></div>").hide().appendTo("body");
                    // imgHeight = dummyElem.css("height").substr(0,dummyElem.css("height").indexOf('px'));
                    imgHeight = 30
                    // imgWidth = ige.client.textures[itemID]._sizeX / (ige.client.textures[itemID]._sizeY / imgHeight)
                    imgWidth = 30
                    dummyElem.remove();
                    itemImg = "<span class='goalTaskImage'><img class='goalTaskImage' src='"+options.iconUrl+"' /></span>";

                    // itemImg = "<span class='goalTaskImage' style='background-image: url(" + options.textureUrl + ");" +
                    //     imgHeight + "px;background-position-x: "+ imgWidth / ige.client.textures[itemID]._cellColumns +"px;'></span>";
                }
                items.push('<li>' + itemImg + " <span class='goalTaskTitle'>"+ value.title  +  "</span><div class='goalTaskPercent' id='task" + value.taskID + "' ><div class='progressLabel' id='taskLabel" + value.taskID + "'></div></div></li>");
            });
            //add problem info
            $('#goalDialogContent').html("<div class='goalDialogInfo'>Solves:" + GameProblems.problemsLookup[API.state.currentProblemID].title + "<span class='problemDetails'><img class='problemDetailsIcon' src='/assets/textures/ui/Info-50.png'></span></div>");
            var problemDetails = $('#goalDialogContent').find(".problemDetails").first();
            problemDetails.attr("title",GameProblems.problemsLookup[API.state.currentProblemID].details);
            problemDetails.tooltip({
                position: { my: "right center", at: "left center" }
            });
            //add tasks
            $('#goalDialogContent').append("<ul id='taskList'>" + items.join('') + "</ul>");
            //jquery prepare tasks' progressbars
            $.each(data.gameGoalObj.tasks, function (id, value) {
                var progressbar = $( "#task" + value.taskID ),
                    progressLabel = $( "#taskLabel" + value.taskID );
                $( "#task" + value.taskID ).progressbar({
                    value: false,
                    change: function() {
                        progressLabel.text( progressbar.data( "currentValue" ) + "/" + value.totalValue );
                    },
                    complete: function() {
                        progressLabel.text( "Complete!" );
                    }
                });
                $( "#task" + value.taskID ).data( "currentValue", value.currentValue );
                $( "#task" + value.taskID ).progressbar( "value", value.percent );
            });
            //prepare rewards info
            for(var i = 0; i < rewardsArr.length; i++){
                assets = rewardsArr[i].split(":");
                rewardsArr[i] = assets.reverse().join("");
            }
            //add rewards info
            $('#goalDialogContent').append("<hr><div class='goalDialogInfo'>Rewards:" + rewardsArr + "</div>");
            //if goal is complete and rewards not collected add 'collect rewards' button into dialog, and show 'goal complete' in ui
            if(API.stateGoalsLookup[data.id].isComplete && !API.stateGoalsLookup[data.id].isRewardsCollected){
                //add 'collect rewards' button
                $('#goalDialogContent').append("<div class='goalDialogInfo'><button id='collectRewardsGoal" + data.id + "'>Collect Rewards</button></div>");
                $('#collectRewardsGoal' + data.id).click(function(){
                    $("#goalCompleteNotification").hide();
                    ige.client.eventEmitter.emit('collectRewards', {"goalID":data.id,
                        "title":data.gameGoalObj.goalTitle,
                        "message":data.gameGoalObj.goalMessage,
                        "reward":data.gameGoalObj.goalReward});
                });
                //show 'goal complete' info in ui
                $("#goalCompleteNotification").show(GameConfig.config['goalCompleteEffect'], parseInt(GameConfig.config['goalCompleteEffectDuration']));
            }
            //jquery prepare dialog
            $( "#goalDialog" ).dialog({ resizable: false, draggable: true, closeOnEscape: true, title: data.gameGoalObj.goalTitle, close: function( event, ui ) {ige.client.fsm.enterState('select')}, width: 'auto', height: 'auto', modal: true, autoOpen: false });
            //show 'new goal' info in ui
            if(data.isNewGoal)
                $('#newGoalNotification').show(GameConfig.config['newGoalEffect'], parseInt(GameConfig.config['newGoalEffectDuration']));
        })

        //on goal complete add 'collect rewards' button into dialog, and show 'goal complete' in ui
        self.goals.on("goalComplete",function(data) {
            API.setGoalAsComplete(data.goalID);
            //add 'collect rewards' button
            $('#goalDialogContent').append("<div class='goalDialogInfo'><button id='collectRewardsGoal" + data.goalID + "'>Collect Rewards</button></div>");
            $('#collectRewardsGoal' + data.goalID).click(function(){
                $("#goalCompleteNotification").hide();
                ige.client.eventEmitter.emit('collectRewards', data);
            });
            //show 'goal complete' info in ui
            $("#goalCompleteNotification").show(GameConfig.config['goalCompleteEffect'], parseInt(GameConfig.config['goalCompleteEffectDuration']));
        })

        ige.client.eventEmitter.on('collectRewards', function(data){
            //add reward assets
            var rewardsArr = data.reward.split(","),
                rewardsObj = {}, assets, totalAssets, startX, distribution = 75;//pixels

            for(var i = 0; i < rewardsArr.length; i++){
                assets = rewardsArr[i].split(":");
                rewardsObj[assets[0]] = assets[1];
            }
            totalAssets = Object.keys(rewardsObj).length;
            startX = ( (totalAssets - 1) * -distribution / 2 ) -distribution;
            for(var item in rewardsObj){
                startX += distribution;
                self.rewardMechanism.claimReward(item, rewardsObj[item],{x:(-ige.$('uiScene')._renderPos.x + startX),y:200,z:0});
            }

            API.setGoalRewardsAsCollected(data.goalID);

            //add loadNextProblem action to the queueManager
            ige.client.gameLogic.queueManager.addNewAction("loadNextProblem", function(){
                //load next problem
                var nextProblemID = ige.client.gameLogic.goals.getGoal(data.goalID).Load_Problem_On_Complete;
                if(nextProblemID !== "None" && nextProblemID !== "none" && nextProblemID !== "" && nextProblemID !== null && nextProblemID !== undefined){
                    ige.client.gameLogic.problemManager.showProblem(nextProblemID);
                    API.state.currentProblemID = nextProblemID;
                    API.setProblemAsShown(nextProblemID);
                }
            });

            //popup congrats message by entering state goalDialog explicitly
            ige.client.fsm.enterState('goalDialog', null, function (err) {
                if (!err) {
                    $('#goalDialogContent').html("<p style='text-align:center;'>" + data.message + "</p>");
                    $( "#goalDialog" ).dialog({ resizable: false, draggable: true, closeOnEscape: true, title: data.title, close: function( event, ui ) {ige.client.fsm.enterState('select')}, width: 'auto', height: 'auto', modal: true, autoOpen: false });
                    $( "#goalDialog" ).dialog( "open" );
                }
            });
        })

        //on eventComplete update goal dialog percentage
        self.goals.on("eventComplete",function(taskObj){
            var item = taskObj.item
            API.updateGoal(API.state.currentGoalID,item.taskID,item._eventCount)
            $('#task'+item.taskID).data( "currentValue", item._eventCount );
            $('#task'+item.taskID).progressbar( "value", Math.floor(item._eventCount * 100 / item.count) );
        })

        //on message broadcast transition to message state
        ige.client.eventEmitter.on('showMessage', function(data){
            ige.client.fsm.enterState('showMessage', data, null);
        })

        //on loadGoal broadcast load goal by goalmanager
        ige.client.eventEmitter.on('loadGoal', function(data){
            self.goals.loadGoal(data.goalID);
        })

        //on executePendingAction broadcast execute pending action in queueManager
        ige.client.eventEmitter.on('executePendingAction', function(){
            if(self.queueManager.isAnyActionPending()){
                self.queueManager.callNextPendingAction();
            }
        })

        //add missing problems to the API.state.problems
        if(API.state.goals && !API.state.problems){
            var goalIDs = API.state.goals.map(function(x) {return x.goalID; });
            for(var i = 0; i < goalIDs.length; i++){
                API.setProblemAsShown(self.problemManager.getProblemIDbyGoalID(goalIDs[i]));
            }
        }

        //main starting point
        if(!API.state.goals){
            if(!API.state.problems){
                //if goals and problems don't exist, start game by loading first problem
                self.queueManager.addNewAction("loadNextProblem", function(){
                    //load first problem
                    var firstProblemID = GameConfig.config['firstProblemID'];
                    self.problemManager.showProblem(firstProblemID);
                    API.state.currentProblemID = firstProblemID;
                    API.setProblemAsShown(firstProblemID);
                });
            }else{
                //load goal for currentProblemID
                self.goals.loadGoal(self.problemManager.getGoalIDbyProblemID(API.state.currentProblemID));
            }
        }else if(API.state.currentGoalID){
            currentGoalID = API.state.currentGoalID
            //if goal complete and rewards collected, load next problem
            if(API.stateGoalsLookup[currentGoalID].isComplete && API.stateGoalsLookup[currentGoalID].isRewardsCollected){
                //load next problem
                var nextProblemID = self.goals.getGoal(API.state.currentGoalID).Load_Problem_On_Complete;
                if(nextProblemID !== "None" && nextProblemID !== "none" && nextProblemID !== "" && nextProblemID !== null && nextProblemID !== undefined){
                    self.problemManager.showProblem(nextProblemID);
                    API.state.currentProblemID = nextProblemID;
                    API.setProblemAsShown(nextProblemID);
                }
            }else{
                //fix missing currentProblemID
                if(!API.state.currentProblemID){
                    for(var i in GameProblems.goalsLookup){
                        if (i === API.state.currentGoalID){
                            API.state.currentProblemID = GameProblems.goalsLookup[i].problemID;
                            API.saveState()
                            break;
                        }
                    }
                }
                //load current goal
                self.goals.loadGoal(currentGoalID, API.stateGoalsLookup[currentGoalID])
            }
        }

        self.rewardMechanism = new RewardMechanism();

        //set earnings on handlers
        for(var item in GameEarnings.earnings){
            var arr = GameEarnings.earnings[item]
            for(var i = 0; i < arr.length; i++){
                (function(i, arr){
                    ige.client.eventEmitter.on(item, function(data){
                        var translateObj = null;
                        if(data.positionX || data.positionY){
                            translateObj = {};
                            translateObj.x = data.positionX || 0;
                            translateObj.y = data.positionY || 0;
                            translateObj.z = 0;
                        }
                        self.rewardMechanism.claimReward(arr[i].asset, arr[i].amount, translateObj, data.itemRef)
                    })
                })(i, arr)
            }
        }

        //on item build unlock new item
        ige.client.eventEmitter.on('build', function(data){
            var options = GameObjects.catalogLookup[data.unlocks]
            if(options && options.enabled && options.dependency !== "none" && API.getUnlockedItem(data.unlocks) === null){
                self.unlockMarketDialogItem(marketDialog.getItemByID(data.unlocks));
                data.callback();
                var message = GameConfig.config['itemUnlockMessageString'];
                message = message.replace("{itemName}", options.name);
                ige.client.eventEmitter.emit('showMessage', {
                    "title" : GameConfig.config['itemUnlockTitleString'],
                    "message" : message
                });
            }else{
                data.callback();
                // Enter the select state
                ige.client.fsm.enterState('select');
            }
        })

        //if coming from login/logout enter select state explicitly
        if(ige.client.fsm.currentStateName() === "reloadGame"){
            ige.client.fsm.enterState('select');
        }
    },

    unlockMarketDialogItem: function(itemData){
        var marketDialog = ige.$('marketDialog');

        marketDialog.removeItemCover(itemData);
        marketDialog.bindItemAction(itemData);
        API.addUnlockedItem(itemData.id);
    }
})