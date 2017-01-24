var ProblemManager = IgeEventingClass.extend({
    classId: 'ProblemManager',

    init: function () {

        var self = this;

        self.currentProblemID;
    },

    showProblem: function (problemID) {
        ige.client.eventEmitter.emit('showMessage', {
            "title" : GameProblems.problemsLookup[problemID].title,
            "message" : GameProblems.problemsLookup[problemID].details,
            "callback" : function(){
                ige.client.eventEmitter.emit('loadGoal', {
                    "goalID" : GameProblems.problemsLookup[problemID].goalID
                });
            }
        });
    },

    getGoalIDbyProblemID: function (problemID) {
        return GameProblems.problemsLookup[problemID].goalID;
    },

    getProblemIDbyGoalID: function (goalID) {
        return GameProblems.goalsLookup[goalID].problemID;
    }
});
