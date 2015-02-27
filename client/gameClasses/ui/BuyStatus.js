var BuyStatus = Dialog.extend({
	classId: 'BuyStatus',
    init: function () {
        Dialog.prototype.init.call(this);

        var base = new IgeUiLabel()
            .left(200)
            .top(200)
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
    },

    startTransaction: function() {
        this.label.text('Buying...');
        this.show();
    },

    transactionSuccess: function() {
        var self = this;
        this.label.text('Transaction successful!');
        new IgeInterval(function () { self.hide()  }, 1000);
    }
})
