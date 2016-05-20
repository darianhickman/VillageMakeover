var GameGoals = {goals:[],settings:{},tasks:[]}
var getGameGoals = function() {
    var deferred = $.Deferred();
    $.ajax({
        async: true,
        dataType: 'json',
        url: '/goals',
        success: function (data) {
            GameGoals.goals = data.goals;
            GameGoals.settings = data.settings;
            GameGoals.tasks = data.tasks;
            deferred.resolve("ok");
        }
    })
    return deferred.promise();
}