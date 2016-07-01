var CashDialog = Dialog.extend({
	classId: 'CashDialog',

    init: function () {
        Dialog.prototype.init.call(this);

        var self = this,
            bucks, pay, clonedItem;

        bucks = GameConfig.config['cashDialogBucks'].split(",").map(parseFloat);
        pay = GameConfig.config['cashDialogPays'].split(",").map(parseFloat);

        for(var i=0; i < 5; i ++) {
            clonedItem = $('#cashAssetList li').first().clone();
            clonedItem.find(".assetAmount").first().text(bucks[i] + " villagebucks for ");
            clonedItem.find(".assetPay").first().text("$" + pay[i] + "  USD");

            (function(i) {
                clonedItem.click(function() {
                    ige.input.stopPropagation();
                    // ige.client.audio.normClick.play();
                    vlg.sfx['select'].play();

                    self.hide();
                    $( "#cashBuyDialog" ).dialog( "close" );
                    self.closeMe();

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

            $('#cashAssetList').append(clonedItem);
        }
        $('#cashAssetList li').first().hide();

        this.closeButton.hide();
        this._underlay.hide();
    },

    show: function () {
        var self = this;

        ige.client.fsm.enterState('cashDialog', null, function (err) {
            if (!err) {
                $( "#cashBuyDialog" ).dialog({ resizable: false, draggable: false, closeOnEscape: false, width: 'auto', height: 'auto', modal: true, autoOpen: false, close: function( event, ui ) {self.closeMe();} });
                $( "#cashBuyDialog" ).dialog( "open" );
                Dialog.prototype.show.call(self);
                // ige.client.audio.normClick.play();
                vlg.sfx['select'].play();

            }
        });

        return this;
    }
})
