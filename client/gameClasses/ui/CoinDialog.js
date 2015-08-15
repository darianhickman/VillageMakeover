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

        var coins = GameConfig.config['coinDialogCoins'].split(",").map(parseFloat);
        var pay = GameConfig.config['coinDialogPays'].split(",").map(parseFloat);
        for(var i=0; i < 5; i ++) {
            var offset = i * 173;
            var base =  new IgeUiLabel()
                .id('bCoin' + i)
                .left(40 + offset)
                .top(80)
                .width(146)
                .height(284)
                .drawBounds(true)
                .mount(panel);

            new IgeUiLabel()
                .value( coins[i] + " Coins")
                .font('13px Verdana')
                .top(13)
                .left(30)
                .width(150)
                .applyStyle({color: 'black'})
                .mount(base);

            new IgeUiLabel()
                .value( pay[i] + " VCash")
                .font('13px Verdana')
                .bottom(13)
                .left(35)
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

                    var message = 'Buy ' + coins[i] + ' coins for ' + pay[i] + ' villagebucks?';

                    var callBack = function() {
                        if(!API.reduceAssets(
                            {coins: parseInt(price.coins, 10),
                                cash: parseInt(price.cash, 10)})) {
                            // Not enough money?
                            mixpanel.track("Not enough money");
                            ige.$('cashDialog').show();
                            return;
                        }
                        API.addCoins(parseInt(coins[i], 10));
                    }

                    if(price.cash > API.state.cash){
                        // Not enough money?
                        mixpanel.track("Not enough money");
                        message = GameConfig.config['notEnoughCashString'];
                        callBack = function() {
                            ige.$('cashDialog').show();
                        }
                    }

                    var cashDialog = new BuyConfirm(message,callBack)
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

        ige.client.fsm.enterState('coinDialog', null, function (err) {
            if (!err) {
                Dialog.prototype.show.call(self);
                ige.client.audio.normClick.play();
            }
        });

        return this;
    }
})

