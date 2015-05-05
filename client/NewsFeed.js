var NewsFeed = IgeEventingClass.extend({
    classId: 'NewsFeed',
    init: function () {
        var self = this;

        $.ajax({
            url: '/newsFeed',
            dataType: 'json',
            success: function(result) {
                console.log('loaded newsFeed', result)
                self.feedNews(result)
            }
        })
    },

    feedNews: function(newsData) {
        var items = [];
        $.each(newsData, function (id, option) {
            console.log(option.news)
            items.push('<li>' + option.news + '</li>');
        });
        $('#newsList').html(items.join(''));
    }
})
