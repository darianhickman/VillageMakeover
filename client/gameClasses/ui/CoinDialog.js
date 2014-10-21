var CoinDialog = Dialog.extend({
	classId: 'CoinDialog',

	init: function () {
		Dialog.prototype.init.call(this);

        var self = this

		new IgeUiElement()
			.id('coinDialogImage')
			.layer(0)
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

        var itemEnt = new IgeUiElement()
			.texture(ige.client.textures.marketItemBack)
			.dimensionsFromTexture();

        var cashIcon = new IgeUiElement()
			.id('fooCashIcon')
			.texture(ige.client.textures.marketItemBack)
			.dimensionsFromTexture()
			.texture(ige.client.textures.star)
			.center(10)
			.bottom(5)
			.mount(itemEnt);

        cashIcon.mouseUp(function() {
            ige.input.stopPropagation();
            ige.client.audio.select.play();
            self.hide()

            Buy.buy({cash: 10, coins: 10})
        })

        itemEnt.center(-150).top(20);
        itemEnt.mount(pageEnt)
    },
})
