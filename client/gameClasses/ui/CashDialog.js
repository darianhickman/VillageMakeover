var CashDialog = Dialog.extend({
	classId: 'CashDialog',
    init: function () {
        Dialog.prototype.init.call(this);

        var self = this

         var panel = new IgeUiElement()
            .id('cashDialogImage')
            .layer(0)
            .texture(ige.client.textures.moneyMenuBackground)
            .dimensionsFromTexture()
            .mount(this);

        var bucks = GameConfig.config['cashDialogBucks'].split(",").map(parseFloat);
        var pay = GameConfig.config['cashDialogPays'].split(",").map(parseFloat);
        for(var i=0; i < 5; i ++) {
            var offset = i * 173;
            var base =  new IgeUiLabel()
                .id('b' + i)
                .left(40 + offset)
                .top(80)
                .width(146)
                .height(284)
                .drawBounds(true)
                .mount(panel);

            var j = i + 1;
            new IgeUiLabel()
                .value( bucks[i] + " villagebucks\nfor $" + pay[i] + " USD")
                .font('11px Verdana')
                .bottom(15)
                .left(15)
                .width(150)
                .applyStyle({color: 'white'})
                .mount(base);

            (function(i) {
                base.mouseUp(function() {
                    ige.input.stopPropagation();
                    ige.client.audio.normClick.play();
                    self.hide();

                    var price = {
                        cash: bucks[i],
                        coins: 0
                    };


                    var message = 'Buy ' + bucks[i] + ' villagebucks for $' + pay[i] + '?';

                    var cashDialog = new BuyConfirm(message,
                        function() {
                            Buy.buy(price);
                        })
			            .layer(1)
			            .show()
			            .mount(ige.$('uiScene'));
                })
            })(i);
        }

        this.closeButton.translateTo(423,-139,0);
    },

    show: function () {
        var self = this;

        ige.client.fsm.enterState('cashDialog', null, function (err) {
            if (!err) {
                Dialog.prototype.show.call(self);
                ige.client.audio.normClick.play();
            }
        });

        return this;
    }
})
