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
            view: '<div style="padding-top:80px"><p>' + GameConfig.config['welcomeScreen'] + '</p><button id="dialogButton">Play</button></div>'
        },
        {
            id: 'firstHomeBuiltScreen',
            view: '<div style="padding-top:80px"><p>' + GameConfig.config['firstHomeBuiltScreen'] + '</p><button id="dialogButton">Continue</button></div>'
        },
        {
            id: 'fastForwardScreen',
            view: '<div style="padding-top:80px"><p>' + GameConfig.config['fastForwardScreen'] + '</p><button id="dialogButton">Continue</button></div>'
        },
        {
            id: 'notEnoughMoneyScreen',
            view: '<div style="padding-top:80px"><p>' + GameConfig.config['notEnoughMoneyScreen'] + '</p><button id="dialogButton">Continue</button></div>'
        },
        {
            id: 'creditCardScreen',
            view: '<div><p>' + GameConfig.config['creditCardScreen'] + '</p><button id="dialogButton">Continue</button></div>'
        },
        {
            id: 'newGoalFirstScreen',
            view: '<div style="padding-top:80px"><p>' + GameConfig.config['newGoalFirstScreen'] + '</p><button id="dialogButton">Continue</button></div>'
        },
        {
            id: 'newGoalSecondScreen',
            view: '<div style="padding-top:80px"><p>' + GameConfig.config['newGoalSecondScreen'] + '</p><button id="dialogButton">Continue</button></div>'
        },
        {
            id: 'newGoalThirdScreen',
            view: '<div style="padding-top:80px"><p>' + GameConfig.config['newGoalThirdScreen'] + '</p><button id="dialogButton">Continue</button></div>'
        },
        {
            id: 'newGoalFourthScreen',
            view: '<div style="padding-top:80px"><p>' + GameConfig.config['newGoalFourthScreen'] + '</p><button id="dialogButton">Continue</button></div>'
        },
        {
            id: 'finishTutorial',
            view: '<div style="padding-top:80px"><p>' + GameConfig.config['finishTutorial'] + '</p><button id="dialogButton">Play</button></div>'
        }
    ],

    getViewByID: function(id){
        return this.viewsLookup[id];
    }
})