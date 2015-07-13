var GameLogic = IgeObject.extend({
    classId: 'GameLogic',

    init: function () {
        IgeObject.prototype.init.call(this);

        var self = this,
            currentGoalID;

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
                (function(i){
                    ige.client.eventEmitter.on(item, function(){
                        self.rewardMechanism.claimReward(arr[i].asset, arr[i].amount)
                    })
                })(i)
            }
        }

    }
})