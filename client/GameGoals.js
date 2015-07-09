var GameGoals = {goals:[],settings:{},tasks:[]}
$.ajax({
    async: false,
    dataType: 'json',
    url: '/goals',
    success: function(data) {
        GameGoals.goals = data.goals;
        GameGoals.settings = data.settings;
        GameGoals.tasks = data.tasks;
    }
})