$.ajax({
    async: false,
    dataType: 'text',
    url: '/catalog',
    success: function(data) {
        eval('(function(){' + data + '})();')
    }
})
