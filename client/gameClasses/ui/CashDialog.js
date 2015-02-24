var CashDialog = Dialog.extend({
	classId: 'CashDialog',
    init: function () {
        Dialog.prototype.init.call(this);

        var self = this

         var panel = new IgeUiElement()
            .id('coinDialogImage')
            .layer(0)
            .texture(ige.client.textures.moneyMenuBackground)
            .dimensionsFromTexture()
            .mount(this);

        for(var i=0; i < 5; i ++) {
            var offset = i * 173;
            if(i >= 3) offset += 20;
            var base =  new IgeUiLabel()
                .id('b' + i)
                .value("50 villagebucks for $5 USD")
                .left(60 + offset)
                .top(123)
                .width(146)
                .height(284)
                .applyStyle({
                    'borderColor': '#ffffff',
                    'borderWidth': 2,
                })
                .drawBounds(true)
                .mount(panel);

            new IgeUiLabel()
                .value('Button ' + i)
                .bottom(10)
                .left(40)
                .mount(base)

            base.mouseUp(function() {
                ige.input.stopPropagation();
                ige.client.audio.normClick.play();
                self.hide()

                Buy.buy({cash: (i + 1) * 5, coins: 0})
            })

        }
    }
})
