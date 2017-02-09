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

    transactionSuccess: function(amount, vbucks) {
        var self = this,
            message;
        dataLayer.push({'event': 'transactionSuccess'});
        self.infoDialog.closeMe();
        message = GameConfig.config['transactionSuccessString'];
        message = message.replace(/\{amount\}/g, amount);
        message = message.replace(/\{vbucks\}/g, vbucks);
        new BuyConfirm(message, null, true)
            .layer(1)
            .show()
            .mount(ige.$('uiScene'));
    },

    transactionFailed: function(callback) {
        var self = this;
        dataLayer.push({'event': 'transactionFail'});
        self.infoDialog.closeMe();
        new BuyConfirm(GameConfig.config['transactionFailString'],callback,true)
            .layer(1)
            .show()
            .mount(ige.$('uiScene'));
    }
})
