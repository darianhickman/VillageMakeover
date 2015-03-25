var BuyStatus = Dialog.extend({
	classId: 'BuyStatus',
    init: function () {
        Dialog.prototype.init.call(this);

        var base = new IgeUiLabel()
            .width(300)
            .height(100)
            .applyStyle({backgroundColor: '#000'})
            .mount(this);

        this.label =
            new IgeFontEntity()
            .colorOverlay('white')
            .nativeFont('30px Times New Roman')
            .width(300)
            .mount(base);

        this.closeButton.translateTo(150,-50,0);
    },

    startTransaction: function() {
        this.label.text('Buying...');
        this.show();
    },

    transactionSuccess: function() {
        var self = this;
        this.label.text('Transaction successful!');
        new IgeInterval(function () { self.hide()  }, 1000);
    },

    transactionFailed: function(callback) {
        var self = this;
        this.label.text('Transaction failed!\nPlease update your info...');
        this.label.nativeFont('20px Times New Roman')
        new IgeInterval(callback, 2000);
    }
})
