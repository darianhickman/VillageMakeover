var GameAssets = {assets:{}}
$.ajax({
    async: false,
    dataType: 'json',
    method: 'POST',
    data: {worksheet: 'assets'},
    url: '/config',
    success: function(data) {
        GameAssets.assets = data
    }
})