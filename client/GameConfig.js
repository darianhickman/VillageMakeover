var GameConfig = {config:{}}
$.ajax({
    async: false,
    dataType: 'json',
    method: 'POST',
    url: '/config',
    success: function(data) {
        GameConfig.config = data
        for(var item in GameConfig.config){
            if (item.indexOf("String") !== -1){
                GameConfig.config[item] = GameConfig.config[item].replace(/\\n/g, "\n")
            }
        }
    }
})
