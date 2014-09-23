var CoinDialog = Dialog.extend({
	classId: 'CoinDialog',

	init: function () {
		Dialog.prototype.init.call(this);

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
    },
})
