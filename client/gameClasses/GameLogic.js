var GameLogic = IgeObject.extend({
    classId: 'GameLogic',

    init: function () {
        IgeObject.prototype.init.call(this);

        var self = this,
            currentGoalID,
            marketDialog = ige.$('marketDialog');

        //add unlocked market items based on user state
        for(var i in API.state.objects){
            var item = API.state.objects[i],
                options = GameObjects.catalogLookup[item.name]

            if(options.enabled && marketDialog.getItemByID(item.name) === null)
                self.addItemToMarketDialog(options);

            if(options.unlocks !== "none" && marketDialog.getItemByID(options.unlocks) === null){
                var unlockedOptions = GameObjects.catalogLookup[options.unlocks]
                if(unlockedOptions.enabled)
                    self.addItemToMarketDialog(unlockedOptions);
            }
        }

        self.goals = new Goals()

        //on goal load prepare ui
        self.goals.on("goalLoaded",function(data){
            //jquery fill ul with task titles
            var items = [];
            $.each(data.gameGoalObj.tasks, function (id, value) {
                items.push('<li>' + value.title + "<span id='task" + value.taskID + "' style='float:right;'>" + value.percent + "%</span></li>");
            });
            $('#goalDialogContent').html("<ul id='taskList'>" + items.join('') + "</ul>");
            //jquery prepare dialog
            $( "#goalDialog" ).dialog({ resizable: false, draggable: false, closeOnEscape: true, title: data.gameGoalObj.goalTitle, close: function( event, ui ) {ige.client.fsm.enterState('select')}, width: 400, height: 250, modal: true, autoOpen: false });
            //ui show goal button
            if(data.isNewGoal)
                ige.$('goalButtonFontEntity').show()
            ige.$('goalButton').show()
        })

        //on goal complete load next goal
        self.goals.on("goalComplete",function(data){
            //add reward assets

            API.setGoalAsComplete(data.goalID)

            //popup congrats message
            $('#goalDialogContent').html("<p style='text-align:center; padding-top:40px;'>" + data.message + "</p>");
            $( "#goalDialog" ).dialog({ resizable: false, draggable: false, closeOnEscape: true, title: data.title, close: function( event, ui ) {self.goals.loadNextGoal(data.goalID)}, width: 400, height: 250, modal: true, autoOpen: false });
            $( "#goalDialog" ).dialog( "open" );
        })

        //on eventComplete update goal dialog percentage
        self.goals.on("eventComplete",function(taskObj){
            var item = taskObj.item
            API.updateGoal(API.state.currentGoalID,item.taskID,item._eventCount)
            $('#task'+item.taskID).html(Math.floor(item._eventCount * 100 / item.count) + '%');
        })

        if(!API.state.goals){
            //load first goal
            self.goals.loadGoal(GameGoals.settings.startID)
            API.createGoal(GameGoals.settings.startID)
        }else if(API.state.currentGoalID){
            currentGoalID = API.state.currentGoalID
            if(API.stateGoalsLookup[currentGoalID].isComplete){
                //load next goal
                self.goals.loadNextGoal(currentGoalID)
            }else{
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
                        self.rewardMechanism.claimReward(arr[i].asset, arr[i].amount, translateObj)
                    })
                })(i, arr)
            }
        }

        //on item build unlock new item
        ige.client.eventEmitter.on('build', function(data){
            if(data.unlocks !== "none" && marketDialog.getItemByID(data.unlocks) === null){
                var options = GameObjects.catalogLookup[data.unlocks]
                if(options.enabled)
                    self.addItemToMarketDialog(options);
            }
        })
    },

    //add unlocked item to market dialog
    addItemToMarketDialog: function(options){
        var marketDialog = ige.$('marketDialog'),
            pageIndex = 0;

        //check for page availability, if not create new page
        while (marketDialog._pageItems[pageIndex] && marketDialog._pageItems[pageIndex].length === 6) {
            pageIndex++;
        }
        if(!marketDialog._pages[pageIndex])
            marketDialog.createSinglePage();

        //add item to market dialog
        marketDialog.addItem({
            'id': options.id,
            'classId': options.id,
            'title': options.name,
            'texture': ige.client.textures[options.id],
            'coins': options.coins,
            'cash': options.cash,
            'cell': options.cell,
            'scale': options.scale,
            'scaleValue': options.scaleValue
        });
    }
})