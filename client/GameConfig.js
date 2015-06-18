var GameConfig = {config:{}}
$.ajax({
    async: false,
    dataType: 'json',
    url: '/config',
    success: function(data) {
        GameConfig.config = data
        console.log(GameConfig.config);
    }
})
