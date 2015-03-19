var CoinDialog = Dialog.extend({
	classId: 'CoinDialog',

	init: function () {
		Dialog.prototype.init.call(this);

        var self = this

        var panel = new IgeUiElement()
            .id('coinDialogImage')
            .layer(0)
            .texture(ige.client.textures.coinMenuBackground)
            .dimensionsFromTexture()
            .mount(this);

        var coins = [100, 200, 400, 1000, 2000];
        var pay = [1, 2, 4, 10, 20];
        for(var i=0; i < 5; i ++) {
            var offset = i * 173;
            if(i >= 3) offset += 20;
            var base =  new IgeUiLabel()
                .id('bCoin' + i)
                .left(60 + offset)
                .top(123)
                .width(146)
                .height(284)
                .drawBounds(true)
                .mount(panel);

            new IgeUiLabel()
                .value( coins[i] + " Coins")
                .top(13)
                .left(25)
                .width(150)
                .applyStyle({color: 'white'})
                .mount(base);

            new IgeUiLabel()
                .value( pay[i] + " VCash")
                .bottom(13)
                .left(25)
                .width(150)
                .applyStyle({color: 'white'})
                .mount(base);

            (function(i) {
                base.mouseUp(function() {
                    ige.input.stopPropagation();
                    ige.client.audio.normClick.play();
                    self.hide();

                    var price = {
                        cash: pay[i],
                        coins: 0
                    };

                    if(price.cash > API.state.cash){
                        // Not enough money?
                        ige.$('cashDialog').show();
                        return;
                    }

                    var message = 'Buy ' + coins[i] + ' coins for ' + pay[i] + ' villagebucks?';

                    var cashDialog = new BuyConfirm(message,
                        function() {
                            if(!API.reduceAssets(
                                {coins: parseInt(price.coins, 10),
                                    cash: parseInt(price.cash, 10)})) {
                                // Not enough money?
                                ige.$('cashDialog').show();
                                return;
                            }
                            API.addCoins(parseInt(coins[i], 10));
                        })
                        .layer(1)
                        .show()
                        .mount(ige.$('uiScene'));
                })
            })(i);
        }

        this.closeButton.translateTo(438,-236,0);
    },

    show: function () {
        var self = this;

        ige.client.fsm.enterState('coinDialog', null, function (err) {
            if (!err) {
                Dialog.prototype.show.call(self);
                ige.client.audio.normClick.play();
            }
        });

        return this;
    }
})

