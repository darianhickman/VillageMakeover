var QueueManager = IgeEventingClass.extend({
    classId: 'QueueManager',

    init: function () {

        var self = this;

        self.queue = [];
    },

    addNewAction: function (actionID, callback) {
        var self = this;

        self.queue.push({"actionID" : actionID, "callback" : callback})
    },

    callNextPendingAction: function(){
        var self = this;

        if(self.queue[0]){
            self.queue[0].callback();
            self.queue.shift();
        }
    },

    callActionbyID: function(ID){
        var self = this;

        var elementPos = self.queue.map(function(x) {return x.actionID; }).indexOf(ID);
        if(elementPos !== -1)
            self.queue[elementPos].callback();
        else
            vlg.log.debug("cannot find any action for this ID: ", ID)
    },

    isAnyActionPending: function () {
        var self = this;

        return self.queue.length > 0 ? true : false;
    }
});
