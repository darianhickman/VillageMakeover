var BuyStatus = Dialog.extend({
	classId: 'BuyStatus',
    init: function () {
        Dialog.prototype.init.call(this);

        this.closeButton.hide();
        this._underlay.hide();
    },

    startTransaction: function() {
        var self = this;
        self.infoDialog = new BuyConfirm(GameConfig.config['buyingString'],null,true)
            .layer(1)
            .show()
            .mount(ige.$('uiScene'));
    },

    transactionSuccess: function(amount) {
        var self = this;
        mixpanel.track("Transaction success");
        self.infoDialog.closeMe();
        new BuyConfirm(GameConfig.config['transactionSuccessString'] + amount,null,true)
            .layer(1)
            .show()
            .mount(ige.$('uiScene'));
    },

    transactionFailed: function(callback) {
        var self = this;
        mixpanel.track("Transaction fail");
        self.infoDialog.closeMe();
        new BuyConfirm(GameConfig.config['transactionFailString'],callback,true)
            .layer(1)
            .show()
            .mount(ige.$('uiScene'));
    }
})
