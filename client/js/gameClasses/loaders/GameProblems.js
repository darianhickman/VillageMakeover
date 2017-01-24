var GameProblems = {problems:[],problemsLookup:{},goalsLookup:{}}
var getGameProblems = function() {
    var deferred = $.Deferred(),
        retryCount = 1,
        getData;

    getData = function(retryCount) {
        $.ajax({
            async: true,
            dataType: 'json',
            url: '/problems',
            success: function (data) {
                for (var i = 0; i < data.length; i++) {
                    var item = data[i]
                    GameProblems.problems.push({
                        'problemID': item.Problem_ID,
                        'title': item.Title,
                        'details': item.Details,
                        'goalID': item.Load_Goal_ID
                    });
                    GameProblems.problemsLookup[item.Problem_ID] = GameProblems.goalsLookup[item.Load_Goal_ID] = GameProblems.problems[GameProblems.problems.length - 1];
                }
                deferred.resolve("ok");
            },
            error : function(jqXHR, textStatus, errorThrown ){
                if(retryCount === parseInt(GameConfig.config['URLRetryCount'])){
                    deferred.reject();
                    return;
                }
                retryCount++;
                getData(retryCount);
            }
        })
    }
    getData(retryCount);
    return deferred.promise();
}