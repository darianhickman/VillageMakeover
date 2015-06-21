var TutorialViews = IgeClass.extend({
    classId: 'TutorialViews',

    init: function(){
        var self = this;

        self.viewsLookup = [];

        for(var i = 0; i < self.views.length; i++){
            self.viewsLookup[self.views[i].id] = self.views[i];
        }

    },

    views: [
        {
            id: 'welcomeScreen',
            view: '<div style="padding-top:80px"><p>Welcome to your village! Everything you do here impacts the real world.</p><button id="dialogButton">Play</button></div>'
        },
        {
            id: 'firstHomeBuiltScreen',
            view: '<div style="padding-top:80px"><p>Yay! You completed first building.</p><button id="dialogButton">Continue</button></div>'
        },
        {
            id: 'fastForwardScreen',
            view: '<div style="padding-top:80px"><p>Fast forward a couple of days.</p><button id="dialogButton">Continue</button></div>'
        },
        {
            id: 'notEnoughMoneyScreen',
            view: '<div style="padding-top:80px"><p>Need to add more VBucks.</p><button id="dialogButton">Continue</button></div>'
        },
        {
            id: 'creditCardScreen',
            view: '<div><p><img src="./assets/textures/ui/creditCardFillSample.png"></p><button id="dialogButton">Continue</button></div>'
        },
        {
            id: 'newGoalFirstScreen',
            view: '<div style="padding-top:80px"><p>Get your village capacity to 100 people.<br>Build 5 houses.<br>Grow 9 crops. </p><button id="dialogButton">Continue</button></div>'
        },
        {
            id: 'newGoalSecondScreen',
            view: '<div style="padding-top:80px"><p>Congratulations! You built 5 homes and 9 fields.</p><button id="dialogButton">Continue</button></div>'
        },
        {
            id: 'newGoalThirdScreen',
            view: '<div style="padding-top:80px"><p>New Goal! Build a community well.</p><button id="dialogButton">Continue</button></div>'
        },
        {
            id: 'newGoalFourthScreen',
            view: '<div style="padding-top:80px"><p>Congratulations! You just created a well in your village and supported construction and training for a real well.</p><button id="dialogButton">Continue</button></div>'
        },
        {
            id: 'finishTutorial',
            view: '<div style="padding-top:80px"><p>Congratulations! You completed the tutorial.</p><button id="dialogButton">Play</button></div>'
        }
    ],

    getViewByID: function(id){
        return this.viewsLookup[id];
    }
})