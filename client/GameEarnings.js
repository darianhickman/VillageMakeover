var GameEarnings = {earnings:{}}
$.ajax({
    async: false,
    dataType: 'json',
    method: 'POST',
    data: {worksheet: 'earnings'},
    url: '/config',
    success: function(data) {
        for(var i=0;i<data.length;i++){
            var row = data[i]
            GameEarnings.earnings[row.event] = GameEarnings.earnings[row.event] || []
            GameEarnings.earnings[row.event].push({asset: row.asset, amount: row.amount})
        }
    }
})