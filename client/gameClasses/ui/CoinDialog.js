var CoinDialog = Dialog.extend({
	classId: 'CoinDialog',

	init: function () {
		Dialog.prototype.init.call(this);

        var self = this

		new IgeUiElement()
			.id('coinDialogImage')
			.layer(0)
            .width(400)
            .height(300)
			.texture(ige.client.textures.marketMenuBack)
			.dimensionsFromTexture()
			.mount(this);

        var pageEnt = new IgeUiElement()
			.id('coinDialog_page0')
			.layer(1)
			.width(560)
			.height(380)
			.translateTo(0, 21, 0)
			.mount(this);

        for(var i=0; i < 2; i++) { (function() {
            var cash = (i + 1) * 10
            var coins = (i + 1) * 10

            var itemEnt = new IgeUiElement()
			    .texture(ige.client.textures.marketItemBack)
                .center((i - 1) * 150)
                .top(20)
			    .dimensionsFromTexture();

            var cashIcon = new IgeUiElement()
			    .id('coinDialog_cashIcon' + i)
			    .texture(ige.client.textures.cash)
			    .dimensionsFromTexture()
			    .left(10)
			    .bottom(5)
			    .mount(itemEnt);

            new IgeFontEntity()
			    .id('coinDialog_cash' + i)
			    .layer(2)
			    .textAlignX(0)
			    .colorOverlay('#000000')
			    .nativeFont('10px Verdana')
			    .nativeStroke(0.5)
			    .nativeStrokeColor('#666666')
			    .textLineSpacing(0)
			    .text(cash + '')
			    .width(20)
			    .center(20)
			    .mount(cashIcon);

            var coinIcon = new IgeUiElement()
			    .id('coinDialog_coinIcon' + i)
			    .texture(ige.client.textures.coin)
			    .dimensionsFromTexture()
			    .left(50)
			    .bottom(5)
			    .mount(itemEnt);

            new IgeFontEntity()
			    .id('coinDialog_coin' + i)
			    .layer(2)
			    .textAlignX(0)
			    .colorOverlay('#000000')
			    .nativeFont('10px Verdana')
			    .nativeStroke(0.5)
			    .nativeStrokeColor('#666666')
			    .textLineSpacing(0)
			    .text(coins + '')
			    .width(20)
			    .center(20)
			    .mount(coinIcon);

            itemEnt.mouseUp(function() {
                ige.input.stopPropagation();
                ige.client.audio.normClick.play();
                self.hide()

                Buy.buy({cash: cash, coins: coins})
            })

            itemEnt.mount(pageEnt)
        })() }

    },
})
