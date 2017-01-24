var Goals = IgeEventingClass.extend({
    classId: 'Goals',

    init: function (goals) {

        var self = this;

        self.igeQuests = {};
    },

    createGoal: function(goalID,goalState){
        var self = this,
            questRef,
            goalStateLookup = [],
            itemsArray = [],
            tasksArray = [],
            gameGoalObj = {},
            goal = self.getGoal(goalID);

        if(goalState && goalState.tasks){
            for(var i = 0; i < goalState.tasks.length; i++){
                goalStateLookup[goalState.tasks[i].taskID] = goalState.tasks[i];
            }
        }

        gameGoalObj.goalTitle = goal.Title;
        gameGoalObj.goalMessage = goal.Congrats_Message;
        gameGoalObj.goalReward = goal.Reward;
        gameGoalObj.tasks = [];

        questRef = new IgeQuest();

        tasksArray = goal.Tasks.split(",")

        var taskClosure = function(task)
        {
            var obj = {
                taskID:tasksArray[i],
                // The number of times this event should fire
                // before we mark this quest item as complete
                count: parseInt(task.Task_Value),
                // The object to attach the event listener to
                emitter: ige.client.eventEmitter,
                // The name of the event to listen for
                eventName: task.Task_Event,
                // The method that will be called by the event
                // emitter, receiving it's parameters and then
                // evaluating if the event constitutes the quest
                // event we want to listen for. Returning true
                // tells the quest system to count the event
                // towards the item's event complete count.
                // This is optional, if no method is specified
                // then every event emitted will count towards
                // the item's event complete count.
                eventEvaluate: function (data) {
                    // Check for Target_Object's name
                    if(task.Target_Object === '*')
                        return true
                    else if (task.Target_Object.substr(0,2) === '__' && task.Target_Object.substr(2) === data.id)
                        return true;
                    else if (task.Target_Object === data.type)
                        return true

                }
            };
            return obj;
        }

        for(var i = 0; i < tasksArray.length; i++){
            var task = self.getTask(tasksArray[i]),
                taskObj,
                value= 0,
                percent = 0;

            if(goalStateLookup[tasksArray[i]]){
                value = goalStateLookup[tasksArray[i]].value;
                percent = Math.floor(goalStateLookup[tasksArray[i]].value * 100 / task.Task_Value)
            }

            gameGoalObj.tasks.push({"taskID":tasksArray[i],"targetOBJ":task.Target_Object,"title":task.Title,"currentValue":value,"totalValue":task.Task_Value,"percent":percent})

            if(goalStateLookup[tasksArray[i]] && goalStateLookup[tasksArray[i]].value === parseInt(task.Task_Value))
                continue;

            taskObj = new taskClosure(task);

            itemsArray.push(taskObj)
        }

        questRef.items(itemsArray)
            .complete(function () {
                self.emitGoalAsComplete(goalID, goal.Title, goal.Congrats_Message, goal.Reward)
            })
            // Start the quest now (activates event listeners)
            .start();

        for(var i = 0; i < tasksArray.length; i++){
            if(goalStateLookup[tasksArray[i]]){
                var elementPos = questRef._items.map(function(x) {return x.taskID; }).indexOf(tasksArray[i]);
                if(elementPos !== -1){
                    questRef._items[elementPos]._eventCount = goalStateLookup[tasksArray[i]].value;
                    questRef._eventCompleteCount += goalStateLookup[tasksArray[i]].value;
                }
            }
        }

        questRef.on('itemComplete',function(item){
            self.emit('itemComplete',{"item":item});
        });

        questRef.on('eventComplete',function(item){
            self.emit('eventComplete',{"item":item});
        });

        self.igeQuests[goalID] = questRef

        return gameGoalObj;
    },

    emitGoalAsComplete: function(goalID, title, message, reward){
        this.emit('goalComplete',{"goalID":goalID, "title":title, "message":message, "reward":reward});
    },

    loadGoal: function(goalID,goalState){
        var gameGoalObj = this.createGoal(goalID,goalState),
            isNewGoal = true;

        if(goalState)
            isNewGoal = false;
        else
            API.createGoal(goalID);

        this.emit('goalLoaded',{"id":goalID,"gameGoalObj":gameGoalObj,"isNewGoal": isNewGoal});
    },

    loadNextGoal: function(goalID){
        var nextGoalID = this.getNextGoalID(goalID),
            gameGoalObj;

        if(nextGoalID){
            gameGoalObj = this.createGoal(nextGoalID);
            API.createGoal(nextGoalID)
            this.emit('goalLoaded',{"id":goalID,"gameGoalObj":gameGoalObj,"isNewGoal":true});
        }
    },

    getTask: function(taskID){
        var elementPos = GameGoals.tasks.map(function(x) {return x.Task_ID; }).indexOf(taskID);
        return GameGoals.tasks[elementPos];
    },

    getGoal: function(goalID){
        var elementPos = GameGoals.goals.map(function(x) {return x.Goal_ID; }).indexOf(goalID);
        return GameGoals.goals[elementPos];
    },

    getNextGoalID: function (goalID){
        var elementPos = GameGoals.goals.map(function(x) {return x.Goal_ID; }).indexOf(goalID);
        if(GameGoals.goals[elementPos+1])
            return GameGoals.goals[elementPos+1].Goal_ID;
        else
            return null;
    }

})