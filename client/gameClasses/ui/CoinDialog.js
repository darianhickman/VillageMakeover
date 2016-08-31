var CoinDialog = Dialog.extend({
	classId: 'CoinDialog',

	init: function () {
		Dialog.prototype.init.call(this);

        var self = this,
            coins, pay, clonedItem;

        coins = GameConfig.config['coinDialogCoins'].split(",").map(parseFloat);
        pay = GameConfig.config['coinDialogPays'].split(",").map(parseFloat);

        for(var i=0; i < 5; i ++) {
            clonedItem = $('#coinAssetList li').first().clone();
            clonedItem.find(".assetAmount").first().text(coins[i] + " Coins for ");
            clonedItem.find(".assetPay").first().text(pay[i] + " VBucks");

            (function(i) {
                clonedItem.click(function() {
                    ige.input.stopPropagation();
                    vlg.sfx['select'].play();

                    self.hide();
                    $( "#coinBuyDialog" ).dialog( "close" );
                    self.closeMe();

                    var price = {
                        cash: pay[i],
                        coins: 0
                    };

                    var message = 'Buy ' + coins[i] + ' coins for ' + pay[i] + ' VBucks?';

                    var callBack = function() {
                        if(!API.reduceAssets(
                            {coins: parseInt(price.coins, 10),
                                cash: parseInt(price.cash, 10)}).status) {
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

            $('#coinAssetList').append(clonedItem);
        }
        $('#coinAssetList li').first().hide();

        this.closeButton.hide();
        this._underlay.hide();
    },

    show: function () {
        var self = this;

        ige.client.fsm.enterState('coinDialog', null, function (err) {
            if (!err) {
                $( "#coinBuyDialog" ).dialog({ resizable: false, draggable: true, closeOnEscape: false, width: 'auto', height: 'auto', modal: true, autoOpen: false, close: function( event, ui ) {self.closeMe();} });
                $( "#coinBuyDialog" ).dialog( "open" );
                Dialog.prototype.show.call(self);
            }
        });

        return this;
    }
})

