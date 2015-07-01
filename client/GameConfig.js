var GameConfig = {config:{}}
$.ajax({
    async: false,
    dataType: 'json',
    method: 'POST',
    url: '/config',
    success: function(data) {
        GameConfig.config = data
    }
})
