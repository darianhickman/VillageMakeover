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
       //add 5 transparent buttons over the exact pixels needed
         var b1 =  new IgeUiLabel()
            .id('b1')
            .value("50 villagebucks for $5 USD")
            .left(10)
            .width(150)
            .height(300)
             .drawBounds(true)
            .mount(panel);

        var b2 = new IgeUiLabel()
            .id('b2')
            .value("100 villagebucks for 10 USD")
            .left(110)
            .width(150)
            .height(300)
            .mount(panel);

        var b3 = new IgeUiLabel()
            .id('b3')
            .value("200 villagebucks for $20 USD ")
            .left(220)
            .width(150)
            .height(300)
            .mount(panel);

        var b4 = new IgeUiElement()
            .id('b4')

            .left(330)
            .width(150)
            .height(300)
            .mount(panel);

        var b5 = new IgeUiElement()
            .id('b5')
            .left(440)
            .width(150)
            .height(300)
            .mount(panel);

        b1.mouseUp(function() {
                ige.input.stopPropagation();
                ige.client.audio.normClick.play();
                self.hide()

                Buy.buy({cash: 4.99, coins: 0})
            })
        b2.mouseUp(function() {
                ige.input.stopPropagation();
                ige.client.audio.normClick.play();
                self.hide()

                Buy.buy({cash: 9.99, coins: 0})
            })
        b3.mouseUp(function() {
                ige.input.stopPropagation();
                ige.client.audio.normClick.play();
                self.hide()

                Buy.buy({cash: 19.99, coins: 0})
            })
        b4.mouseUp(function() {
                ige.input.stopPropagation();
                ige.client.audio.normClick.play();
                self.hide()

                Buy.buy({cash: 49.00, coins: 0})
            })
        b5.mouseUp(function() {
                ige.input.stopPropagation();
                ige.client.audio.normClick.play();
                self.hide()

                Buy.buy({cash: 99.99, coins: 0})
            })


            // background texture



    }



})

//since it's actually all one image it will be pretty tricky.
// use gimp to get needed offsets and widths.

